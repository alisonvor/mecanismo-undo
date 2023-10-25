import { Metadata } from "../models/MetadataInterface";

export function validateLog(logs: string[], metadata: Metadata): boolean {
    const startedTransactions = new Set<string>();
    let withinCheckpoint = false;

    for (const line of logs) {
        if (!line.startsWith('<') || !line.endsWith('>')) {
            console.error(`Linha em um formato inválido: ${line}`);
            return false;
        }

        const content = line.slice(1, -1);
        const parts = content.split(',').map(part => part.trim());
        const controlParts = content.split(' ').map(part => part.trim());

        // Controle de transações
        if (controlParts[0].toLowerCase() === 'start') {
            startedTransactions.add(controlParts[1]);
        } else if (controlParts[0].toLowerCase() === 'commit' || controlParts[0].toLowerCase() === 'abort') {
            if (!startedTransactions.has(controlParts[1])) {
                console.error(`Commit ou abort para uma transação inexistente: ${line}`);
                return false;
            } else {
                startedTransactions.delete(controlParts[1]);
            }
        }

        // Validação de checkpoints
        if (content.toLowerCase().startsWith('start ckpt') || (controlParts[0].toLowerCase() === 'start' && withinCheckpoint)) {
            if (withinCheckpoint) {
                console.error(`Start dentro de um checkpoint: ${line}`);
                return false;
            }
            withinCheckpoint = true;
            continue;
        } else if (content.toLowerCase() === 'end ckpt') {
            if (!withinCheckpoint) {
                console.error(`End CKPT sem um Start CKPT correspondente: ${line}`);
                return false;
            }
            withinCheckpoint = false;
            continue;
        }

        // Valida o controle de transações
        if (controlParts.length === 2 && ['start', 'commit', 'abort', 'end'].includes(controlParts[0].toLowerCase())) {
            continue;
        }

        if (parts.length !== 4) {
            console.error(`Linha com dados inválidos: ${line}`);
            return false;
        }

        const [, , columnName] = parts;

        if (!metadata.table[columnName]) {
            console.error(`Coluna inválida: ${columnName}, Linha: ${line}`);
            return false;
        }
    }

    return true;
}
