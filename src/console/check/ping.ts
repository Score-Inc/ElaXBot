import { Client } from 'discord.js';
import MongoDB from '../../Utils/db';

export const name: string = 'ping';
export const description: string = 'Check ping';

const database = new MongoDB()

export async function execute(args: string[], _client: Client): Promise<string> {
    if (args[0] === 'mongo') {
        const result = await database.ping();
        return `MongoDB Ping: ${result ? result.ok === 1 ? 'OK' : 'Error' : 'Error'}`;
    }
    else {
        return 'No Args Given';
    }
};
