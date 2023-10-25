import { readFileContent } from './fileReaderService';
import { Metadata } from "../models/MetadataInterface";
import {fetchDataAndConstructStructure, populateDatabaseWithMetadata} from "../config/database";
import { validateMetadata } from "../utils/metadataValidator";
import { validateLog } from "../utils/logsValidator";
import { executeQuery } from '../config/database';
import fs from 'fs';

export async function initiateUndo() {
    const metadataFile = readFileContent('metadado.json', 'metadata');
    const logsFile = readFileContent('entradaLog.txt', 'logs');
    const tableName = 'metadados';

    if (!metadataFile || !logsFile) {
        return console.error('Verifique os arquivos de entrada, um ou mais não foi encontrado!');
    }

    try {
        const logs = logsFile.split(/\r?\n/).filter(line => line.trim().length > 0);
        const metadata: Metadata = JSON.parse(metadataFile);

        if (!validateMetadata(metadata) || !validateLog(logs, metadata)) {
            return console.error('Parando execução');
        }

        await populateDatabaseWithMetadata(metadata, tableName);

        await processUndo(metadata, logs, tableName);
    }
    catch (error: any) {
        return console.error(`Ocorreu um problema ao iniciar o mecanismo, verifique se os arquivos estão no formato correto! ${error}`);
    }
}

async function processUndo(metadata: Metadata, logs: string[], tableName: string){
    // Determina o ponto de início do undo
    let startIdx = 0;
    const activeTransactions = new Set<string>();
    const commitedTransactions = new Set<string>();

    for (let i = logs.length - 1; i >= 0; i--) {
        const content = logs[i].slice(1, -1).toLowerCase(); // Remove angle brackets

        if (content.startsWith("end ckpt") && !activeTransactions.size) {
            startIdx = i; // Start recovery after the END CKPT
            break;
        } else if (content.startsWith("start ckpt")) {
            const transactions = (content.match(/\(([^)]+)\)/) || '')[1].split(',').map(t => t.trim());
            transactions.forEach(t => activeTransactions.add(t));
            startIdx = i;
            break;
        }
    }

    // Processa o log ao contrário e atualiza o banco
    for (let i = logs.length - 1; i >= startIdx; i--) {
        const content = logs[i].slice(1, -1);
        const parts = content.split(',').map(part => part.trim());
        const controlParts = content.toLowerCase().split(' ').map(part => part.trim());
        const transactionId = controlParts[1];

        if (controlParts.includes('commit') || (controlParts.includes('abort'))) {
            commitedTransactions.add(transactionId);
            activeTransactions.delete(transactionId);
        }

        if (!content.toLowerCase().startsWith("start ckpt")
            && (activeTransactions.has(transactionId) || !commitedTransactions.has(transactionId))) {
            if (parts.length === 4 && !commitedTransactions.has(parts[0].toLowerCase())) { // It's an operation entry
                const [_, id, columnName, value] = parts;

                if (metadata.table[columnName]) {
                    const result = await executeQuery(`SELECT ${columnName} FROM ${tableName} WHERE ${Object.keys(metadata.table)[0]} = ${id}`);

                    for (const row of result.rows) {
                        if (row[columnName.toLowerCase()].toString() !== parts[3]) {
                            const result = await executeQuery(`UPDATE ${tableName} SET ${columnName} = ${parts[3]} WHERE ${Object.keys(metadata.table)[0]} = ${id}`);
                            console.log(`Linha com ${Object.keys(metadata.table)[0]}: ${id} reverteu o valor de ${row[columnName.toLowerCase()]} para ${parts[3]} na Coluna ${columnName}`);
                        }
                    }
                }
            } else if (controlParts[0] === 'start' && !controlParts[1].startsWith('ckpt')) {
                console.log(`Transação ${transactionId.toUpperCase()} realizou UNDO`);
                activeTransactions.delete(transactionId);

                const log = `\n<abort ${(content.split(' ').map(part => part.trim()))[1]}>`;
                fs.appendFile('logs/entradaLog.txt', log, 'utf8', (err) => {
                    if (err) {
                        console.error('Erro ao adicionar transação como abortada:', err);
                    }
                });
            }
        }

        if (activeTransactions.size && i <= startIdx) {
            startIdx -= 1;
        }
    }

    console.log("Dados após conclusão do undo:\n", await fetchDataAndConstructStructure(tableName));
}