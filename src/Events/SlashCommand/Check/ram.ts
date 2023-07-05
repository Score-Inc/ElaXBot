import { CommandInteraction, EmbedBuilder } from 'discord.js';
import os from 'os';


export const data = {
    name: 'ram',
    description: 'Check RAM Usage',
};
export const command: string = '/ram';
export const example: string = '/ram';
export const permisisons: string = 'everyone';

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const embed = new EmbedBuilder()
        .setTitle('RAM Usage')
        .setDescription('Check RAM Usage')
        .addFields({
            name: 'Bot RAM Usage',
            value: `${Math.round(used * 100) / 100} MB`,
        })
        .addFields({
            name: 'CPU Core Count',
            value: `${(os.cpus().length)*2}`,
        })
        .addFields({
            name: 'Free Memory',
            value: `${Math.round((os.freemem() / 1024 / 1024) * 100) / 100} MB`,
        })
        .addFields({
            name: 'Used Memory',
            value: `${Math.round(((os.totalmem() - os.freemem()) / 1024 / 1024) * 100) / 100} MB`,
        })
        .addFields({
            name: 'Percentage Used',
            value: `${Math.round((((os.totalmem() - os.freemem()) / os.totalmem()) * 100) * 100) / 100}%`,
        })
        .addFields({
            name: 'Percentage Free',
            value: `${Math.round(((os.freemem() / os.totalmem()) * 100) * 100) / 100}%`,
        })
        .addFields({
            name: 'Total Memory',
            value: `${Math.round((os.totalmem() / 1024 / 1024) * 100) / 100} MB`,
        })
        .setColor('Green')
        .setTimestamp(new Date())
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
            url: `https://discord.com/users/${interaction.user.id}`
        });
    await interaction.editReply({ embeds: [embed] });
};
