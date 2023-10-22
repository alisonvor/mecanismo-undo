export function determineType(value: any) {
    if (typeof value === 'number') return 'INTEGER';
    if (typeof value === 'string') return 'TEXT';
    if (typeof value === 'boolean') return 'BOOLEAN';

    return 'TEXT';
}