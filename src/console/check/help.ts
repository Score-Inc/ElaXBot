import path from 'path';
import fs from 'fs';
import { Client } from 'discord.js';

export const name: string = 'help';
export const description: string = 'Get all available command console or terminal';
export async function execute(_args: string[], _client: Client): Promise<string> {
    const commands = fs.readdirSync(path.resolve(__dirname, '../'));
    let results = '';
    for (const folder of commands) {
        const files = fs.readdirSync(path.resolve(__dirname, `../${folder}`));
        for (const file of files) {
            const command = require(`../${folder}/${file}`);
            results += `${command.name} - ${command.description}\n\n`;
        }
    }
    return results;
};