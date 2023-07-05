// eslint-disable-next-line no-unused-vars
import { EmbedBuilder, WebhookClient, Colors, ColorResolvable, EmbedField, EmbedFooterOptions } from 'discord.js';
import { WEBHOOK_URL, logWebhook } from '../../config.json';
import { logger } from '../Utils/logger';

interface LogOptions {
    interaction: string,
    color?: ColorResolvable,
    description: string,
    content?: string,
    thumbnail?: string,
    footer?: EmbedFooterOptions[],
    fields?: EmbedField[],
}

/**
 * Sends a log message to the configured webhook
 * @param {LogOptions} options - Options for the log.
 * @example
 * const { log } = require("./log.js")
 * // OR
 * const log = require("./log.js").log
 * log({
 *      interaction: "ping",
 *      color: "Red",
 *      description: "test",
 *      fields: [
 *          {
 *              name: "test",
 *              value: "test",
 *              inline: true
 *          },
 *          {
 *              name: "test1",
 *              value: "test2",
 *              inline: true
 *          }
 *      ]
 *  })
 */
export async function log(options: LogOptions) {
    const webhook = new WebhookClient({ url: WEBHOOK_URL });
    const color = options.color || 'Green';
    const embed = new EmbedBuilder()
        .setTitle('Log')
        .setDescription(options.description)
        .setColor(color)
        .setFooter({
            text: options.interaction,
        })
        .setTimestamp();

    if (Array.isArray(options.fields)) {
        for (const field of options.fields) {
            const { name, value, inline } = field;
            embed.addFields({ name, value, inline });
        }
    }

    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }

    await webhook.send({
        content: options.content,
        username: logWebhook.name,
        embeds: [embed],
        avatarURL: logWebhook.avatarUrl,
    }).catch((err) => {
        logger.error(`Error while sending log to webhook: ${err}`);
    });
};