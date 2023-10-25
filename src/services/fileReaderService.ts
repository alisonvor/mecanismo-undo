import fs from 'fs';
import path from 'path';

export function readFileContent(fileName: string, dir: string = '.'): string | null {
    const filePath = path.join(dir, fileName);

    if (!fs.existsSync(filePath)) {
        console.error(`Arquivo não encontrado: ${filePath}`);
        return null;
    }

    return fs.readFileSync(filePath, 'utf8');
}
