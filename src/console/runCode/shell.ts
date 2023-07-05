import { exec } from 'child_process';
import { Client } from 'discord.js';

export const name: string = 'bash';
export const description: string = 'Run bash script';

export async function execute(args: string[], _client: Client): Promise<string> {
    // Run shell script code
    const executeCommand = exec(args.join(' '));
    let output = '';
    // listen for stdout data
    executeCommand.stdout?.on('data', (data) => {
        output += data.toString();
    });
    // listen for stderr data
    executeCommand.stderr?.on('data', (data) => {
        console.error(`Error: ${data}`);
    });
    // return a promise that resolves when the command is complete
    return new Promise((resolve, reject) => {
        executeCommand.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`\nCommand failed with exit code ${code}`));
            }
            else {
                resolve(output.trim());
            }
        });
    });
};