import { Message } from "discord.js";
import { BlockedCommandShell } from '../../../config.json';
import { MessageCreateInformation } from '../../interface/MessageCreate'

export const command: MessageCreateInformation = {
    name: 'listbc',
    permissions: "everyone",
    enable: false,
    isCommand: true
}

export async function execute(message: Message) {
    let listblockc;
    for (let i = 0; i < BlockedCommandShell.length; i++) {
        if (i === 0) {
            listblockc = `${i + 1}. ${BlockedCommandShell[i]}\n`;
        }
        else {
            listblockc += `${i + 1}. ${BlockedCommandShell[i]}\n`;
        }
        if (i + 1 === BlockedCommandShell.length) {
            message.reply({ content: `\`\`\`\n${listblockc}\n\`\`\`` });
        }
    }
};