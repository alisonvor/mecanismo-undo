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
        return `${column} ${type}`;
    }).join(', ');

    console.log({ columnDefinitions })

    await client.query(`CREATE TABLE ${tableName} (${columnDefinitions})`);

    const values = metadata.table[columns[0]].map((_, rowIndex) => (
        '(' + columns.map(column => `'${metadata.table[column][rowIndex]}'`).join(', ') + ')'
    )).join(', ');

    console.log(values);

    await client.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values}`);

    await client.end();

    return {

    }
}
