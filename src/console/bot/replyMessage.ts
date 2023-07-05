import { Client, NewsChannel, TextChannel } from "discord.js";

export const name: string = 'replyMessage';
export const description: string = 'Reply message to user';

export async function execute(args: string[], client: Client): Promise<string> {
        const serverId = args[0];
        const channelId = args[1];
        const messageId = args[2];
        const message = args.slice(3).join(' ');

        if (!serverId) {
            throw new Error('Server ID is not provided in the arguments');
        }

        if (!channelId) {
            throw new Error('Channel ID is not provided in the arguments');
        }

        if (!messageId) {
            throw new Error('Message ID is not provided in the arguments');
        }

        if (!message) {
            throw new Error('Message is not provided in the arguments');
        }

        const server = client.guilds.cache.get(serverId);

        if (!server) {
            throw new Error('Server not found');
        }

        const channel = server.channels.cache.get(channelId);

        if (!channel) {
            throw new Error('Channel not found');
        }

        if (!channel || !(channel instanceof TextChannel || channel instanceof NewsChannel)) {
            throw new Error('Text or News channel not found');
        }

        const messageObject = await channel.messages.fetch(messageId);

        if (!messageObject) {
            throw new Error('Message not found');
        }

        try {
            await messageObject.reply(message);
        }
        catch (error) {
            throw new Error(`Failed to reply to message: ${error}`);
        }

        return `Replied to ${messageObject.author.username}'s message in ${channel.name} of ${server.name} with message: ${message}`;
    };