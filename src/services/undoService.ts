import { readFileContent } from './fileReader';

export async function processUndo() {
    const logs = (readFileContent('entradaLog.txt', 'logs') || '').split(/\n/);

    console.log({ logs });

    for (const log of logs) {
        if (log.startsWith('<start')) {
            const transaction = log.split(' ')[1];
            console.log(`Testando identificação, Transação: ${transaction}`);
        }
    }
}