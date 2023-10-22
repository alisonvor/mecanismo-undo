import { Metadata } from "../models/MetadataInterface";

export function validateLog(logs: string[], metadata: Metadata): boolean {
    for (const line of logs) {
        if (!line.startsWith('<') || !line.endsWith('>')) {
            console.error(`Linha em um formato inválido: ${line}`);
            return false;
        }

        const content = line.slice(1, -1); // Remove angle brackets
        const parts = content.split(',').map(part => part.trim());
        const controlParts = content.split(' ').map(part => part.trim());

        console.log({ content, parts, controlParts });

        // Valida o controle de transações
        if (controlParts.length === 2 && ['start', 'commit', 'abort', 'end'].includes(controlParts[0].toLowerCase())) {
            continue;
        }

        if (parts.length !== 4) {
            console.error(`Linha com dados inválidos: ${line}`);
            return false;
        }

        const [transactionId, id, columnName, value] = parts;

        if (!metadata.table[columnName]) {
            console.error(`Coluna inválida: ${columnName}`);
            return false;
        }
    }

    return true;
}
