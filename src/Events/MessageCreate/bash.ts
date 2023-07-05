// Description: This is the bash command, it allows you to run bash commands with the bot
//
// Dependencies:
// - config.json
// - child_process
// - log
//

import { Message } from "discord.js";
import { BlockedCommandShell } from '../../../config.json';
import { MessageCreateInformation } from '../../interface/MessageCreate'

// use enableFeature with some information about this command, name, permissions, and enable, or even reason if needed
export const command: MessageCreateInformation = {
    name: 'bash',
    permissions: "owner",
    enable: false,
    reason: 'This command is dangerous, it can be used to delete files, and other things.',
    isCommand: true
}

export async function execute(message: Message) {
    // Get the config
    // Check if command contains a blocked command
    if (BlockedCommandShell.some((word) => message.content.toLowerCase().includes(word))) return message.reply({ content: 'You can\'t use that command!' });
    // Get the child_process
    const { exec } = require('child_process');
    // Run the command
    exec(message.content.slice(command.name.length + 2), (error: { message: any; }, stdout: string, stderr: any) => {
        // Check if there is an error
        if (error) {
            // Send the error
            message.reply({ content: `\`\`\`bash\nerror:\n${error.message}\`\`\`` });
            return;
        }
        // Check if there is stderr
        if (stderr) {
            // Send the stderr
            message.reply({ content: `\`\`\`bash\nstderr:\n${stderr}\`\`\`` });
            return;
        }
        // Check if the output is too long
        if (stdout.length > 500) {
            // Send the output as a file
            message.channel.send(
                {
                    content: 'Output too long, sending as file',
                    files: [
                        {
                            attachment: Buffer.from(stdout),
                            name: 'output.txt',
                        },
                    ],
                },
            );
        }
        else {
            // Check if the output is empty
            if (stdout === '') {
                // Send the output as a success message
                message.reply({ content: '```Success!```' });
                // log the command
                return;
            }
            // Send the output as a message
            message.reply({ content: `\`\`\`${stdout}\`\`\`` }).catch(console.error);
        }
    });
};