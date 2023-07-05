import { CommandInteraction } from "discord.js";
import { EmbedBuilder } from 'discord.js';
import { version, author, license } from '../../../../package.json';
import { Prefix } from '../../../../config.json';
import fs = require('fs');


export const data = {
    name: 'about',
    description: 'About the bot',
};

export const command: string = '/about';
export const example: string = '/about';
export const permissions: string = 'everyone'

export async function execute(interaction: CommandInteraction) {
    const lastCommit = require('child_process').execSync('git log -1 --pretty=%B').toString().trim() || 'No commit found/No git repository found';
    const commitDate = (new Date(require('child_process').execSync('git log -1 --pretty=format:%ct').toString().trim() * 1000)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) || 'No commit found/No git repository found';
    const availableSlashCommands = await interaction.client.application.commands.fetch().then((command) => command.map((command) => command.name));
    const availablePrefixCommands = fs.readdirSync('./src/Events/MessageCreate').filter((file: string) => file.endsWith('.ts')).map((file: string | any[]) => file.slice(0, -3));
    const embed = new EmbedBuilder()
        .setTitle('About')
        .setDescription(`This bot is made by [${author.name}](${author.url}) and based on [Discord.js](https://discord.js.org) and [Node.js](https://nodejs.org/en/)\nUsing [Github](https://github.com) for source code management and Server (Ubuntu) for hosting`)
        .addFields({
            name: '👑 Author',
            value: `[${author.name}](${author.url}) (${author.email})`,
        })
        .addFields({
            name: '🪪 License',
            value: license,
        })
        .addFields({
            name: '⚙️ Version',
            value: version,
        })
        .addFields({
            name: '📌 Last Commit (' + commitDate + ')',
            value: lastCommit,
        })
        .addFields({
            name: '📔 Available Slash Commands (/)',
            value: availableSlashCommands.join(', '),
        })
        .addFields({
            name: `📓 Available Prefix Commands (${Prefix})`,
            value: availablePrefixCommands.join(', '),
        })
        .setColor('Green')
        .setTimestamp();
    await interaction.reply({ embeds: [embed] });
};