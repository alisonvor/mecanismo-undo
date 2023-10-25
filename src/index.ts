import {connectToDatabase, disconnectFromDatabase } from './config/database';
import { initiateUndo } from "./services/undoService";

async function main() {
    await connectToDatabase();

    await initiateUndo();

    await disconnectFromDatabase();
}

main().then();
