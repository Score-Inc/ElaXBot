import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot\'s speed and uptime');

export const command: string = '/ping';
export const example: string = '/ping';
export const permissions: string = 'everyone';
export async function execute(interaction: CommandInteraction) {
    const client = interaction.client;
    const uptime = {
        days: Math.floor(client.uptime / 86400000),
        hours: Math.floor(client.uptime / 3600000) % 24,
        minutes: Math.floor(client.uptime / 60000) % 60,
        seconds: Math.floor(client.uptime / 1000) % 60,
    };

    uptime.hours = uptime.hours > 24 ? 24 : uptime.hours;
    uptime.minutes = uptime.minutes > 60 ? 60 : uptime.minutes;
    uptime.seconds = uptime.seconds > 60 ? 60 : uptime.seconds;

    const ping = await interaction.reply({
        content: 'Ping pong',
        fetchReply: true
    })

    const embed = new EmbedBuilder()
        .setTitle('Pong!')
        .setDescription('Check PING')
        .addFields({
            name: 'Ping',
            value: `${interaction.client.ws.ping}ms`,
        })
        .addFields({
            name: 'API Ping',
            value: `${ping.createdTimestamp - interaction.createdTimestamp}ms`,
        })
        .addFields({
            name: 'Uptime',
            value: `${uptime.days}d ${uptime.hours}h ${uptime.minutes}m ${uptime.seconds}s`,
        })
        .addFields({
            name: 'Node Version',
            value: `${process.version}`,
        })
        .addFields({
            name: 'Discord.js Version',
            value: `${require('discord.js').version}`,
        })
        .setColor('Green')
        .setTimestamp(new Date())
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
            url: `https://discord.com/users/${interaction.user.id}`
        });
    await interaction.editReply({ content: null,embeds: [embed] });
}