import { readFileContent } from './fileReaderService';
import {Metadata} from "../models/MetadataInterface";
import { populateDatabaseWithMetadata } from "../config/database";
import {validateMetadata} from "../utils/metadataValidator";
import { validateLog } from "../utils/logsValidator";

export async function processUndo() {
    const metadataFile = readFileContent('metadado.json', 'metadata');
    const logsFile = readFileContent('entradaLog.txt', 'logs');

    if (!metadataFile || !logsFile) {
        return console.error('Verifique os arquivos de entrada, um ou mais não foi encontrado!');
    }

    try {
        const logs = logsFile.split(/\r?\n/).filter(line => line.trim().length > 0);
        const metadata: Metadata = JSON.parse(metadataFile);

        if (!validateMetadata(metadata) || !validateLog(logs, metadata)) {
            return console.error('Parando execução');
        }

        await populateDatabaseWithMetadata(metadata, 'metadados');

        console.log({ logs });
        console.log({ metadata });

        for (const log of logs) {
            if (log.startsWith('<start')) {
                const transaction = log.split(' ')[1];
                console.log(`Testando identificação, Transação: ${transaction}`);
            }
        }
    }
    catch (error: any) {
        console.error(`Ocorreu um problema ao iniciar o mecanismo, verifique se os arquivos estão no formato correto! ${error}`);
    }
}