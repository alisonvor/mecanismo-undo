import fs from 'fs';
import path from 'path';

export function readFileContent(fileName: string, dir: string = '.'): string | null {
    const filePath = path.join(dir, fileName);

    console.log({filePath});

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }

    return fs.readFileSync(filePath, 'utf8');
}
