import { Client } from 'pg';
import { Metadata } from '../models/MetadataInterface';
import { determineType } from "../utils/typeHelper";

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    database: 'undo_mechanism',
    password: 'postgres',
    port: 5432,
});

export async function connectToDatabase() {
    await client.connect();
}

export async function disconnectFromDatabase() {
    await client.end();
}

export async function populateDatabaseWithMetadata(metadata: Metadata, tableName: string) {
    await client.query(`DROP TABLE IF EXISTS ${tableName}`);

    const columns = Object.keys(metadata.table);
    const columnDefinitions = columns.map(column => {
        const type = determineType(metadata.table[column][0]);
        return `${column.toLowerCase()} ${type}`;
    }).join(', ');

    await client.query(`CREATE TABLE ${tableName} (${columnDefinitions})`);

    const values = metadata.table[columns[0]].map((_, rowIndex) => (
        '(' + columns.map(column => `'${metadata.table[column][rowIndex]}'`).join(', ') + ')'
    )).join(', ');

    await client.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values}`);

    return {

    }
}

export async function fetchDataAndConstructStructure(tableName: string): Promise<Metadata> {
    const result = await client.query(`SELECT * FROM ${tableName}`);
    const { rows } = result;

    // Construct the structure dynamically
    const structure: Metadata = {
        table: {}
    };

    for (const row of rows) {
        for (const column in row) {
            if (row.hasOwnProperty(column)) {
                if (!structure.table[column]) {
                    structure.table[column] = [];
                }

                structure.table[column].push(row[column]);
            }
        }
    }

    return structure;
}

export async function executeQuery(query: string) {
    return client.query(query);
}
