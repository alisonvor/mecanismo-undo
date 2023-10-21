import { Client } from 'pg';

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
