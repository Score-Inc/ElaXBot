import { Client } from "discord.js";
import { client } from '../../index'

export const name: string = 'command';
export const description: string = 'Lists all available commands Slash Command';

export async function execute(_args: string [], _client: Client): Promise<string> {
    // Argument of type 'string' is not assignable to parameter of type 'never'.ts(2345)
    const results = client.commands.reduce((acc: string[] | any, cmd: { command: string, data: { name: string, description: string }} ) => {
        const commandExample = cmd.command === undefined ? 'Commands description/example are not set' : cmd.command;
        acc.push(`- ${cmd.data.name}\n  Description: ${cmd.data.description}\n  Example: ${commandExample}\n`);
        return acc;
    }, []);
    const output = `List of available commands:\n\n${results.join('\n')}`;
    return output;
};