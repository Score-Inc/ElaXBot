import { Message } from "discord.js";
import { MessageCreateInformation } from '../../interface/MessageCreate'

export const command: MessageCreateInformation = {
    name: 'eval',
    enable: false,
    permissions: 'owner',
    reason: 'This command is dangerous, it can running Typescript code and execute it.',
    isCommand: true
}

export async function execute(message: Message) {
    try {
        const code = message.content.slice(6);
        // eslint-disable-next-line no-unused-vars
        const output = await eval(code);
    }
    catch (err) {
        message.reply({ content: `\`\`\`js\nError:\n${err}\`\`\`` });
    }
};