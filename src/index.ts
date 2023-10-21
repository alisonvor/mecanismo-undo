import { connectToDatabase, disconnectFromDatabase } from './config/database';
import { processUndo } from "./services/undoService";

async function main() {
    await connectToDatabase();

    await processUndo();

    await disconnectFromDatabase();
}

main().then();
