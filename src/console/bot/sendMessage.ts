import { Client, NewsChannel, TextChannel } from "discord.js";

export const name: string = 'sendMessage';
export const description: string = 'Send a message to a channel';

export async function execute(args: string[], client: Client): Promise<string> {
    const serverId = args[0];
    const messageId = args[1];
    const message = args.slice(2).join(' ');

    if (!serverId) {
        throw new Error('Server ID is not set');
    }
    else if (!messageId) {
        throw new Error('Message ID is not set');
    }
    else if (!message) {
        throw new Error('Message is not set');
    }

    const server = client.guilds.cache.get(serverId);
    if (!server) {
        throw new Error('Server not found');
    }

    const channel = server.channels.cache.get(messageId);
    if (!channel) {
        throw new Error('Channel not found');
    }
    if (!channel || !(channel instanceof TextChannel || channel instanceof NewsChannel)) {
        throw new Error('Text or News channel not found');
    }
    try {
        await channel.send(message);
    }
    catch (error) {
        throw new Error(`Error sending message: ${error}`);
    }
    return `Message sent to ${channel.name} in ${server.name}: ${message}`;
};