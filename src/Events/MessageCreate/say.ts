import { Message } from "discord.js";
import { MessageCreateInformation } from '../../interface/MessageCreate'

export const command: MessageCreateInformation = {
    name: 'say',
    permissions: "everyone",
    enable: true,
    isCommand: true
}

export async function execute(message: Message) {
    const args = message.content.slice(command.name.length + 2);
    if (args.length < 1) {
        return message.reply({ content: 'Please provide a message to say.' });
    }
    message.delete();
    message.channel.send({ content: args, allowedMentions: { parse: [], repliedUser: true } });
};