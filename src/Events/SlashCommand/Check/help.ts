import { AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { client } from '../../../index'

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help Command')
    .addStringOption((option) => option
        .setName('command')
        .setDescription('Get help for a command')
        .setRequired(false)
        .setAutocomplete(true));
export const command: string = '/help [command]';
export const example: string = '/help';
export const permissions: string = 'everyone';
export async function autocomplete(interaction: AutocompleteInteraction) {
const getAllCommand = client.commands.map((cmd) => cmd.data.name);
    try {
        const getCommand = interaction.options.getString('command');
        const command = [];
        for (const cmd of getAllCommand) {
            if (cmd.toLowerCase().startsWith(getCommand?.toLowerCase())) {
                command.push({
                    name: cmd,
                    value: cmd,
                });
            } else if (getCommand?.toLowerCase().startsWith(cmd.toLowerCase())) {
                command.push({
                    name: cmd,
                    value: cmd,
                });
            }
        }
    
        await interaction.respond(command);
    } catch {
        // annoying error!
    }
};

export async function execute(interaction: CommandInteraction) {
    const command = (interaction.options as CommandInteractionOptionResolver).getString('command');
    const commands = client.commands;
    const embed = new EmbedBuilder()
        .setTitle('Help');
    await interaction.deferReply();
    if (command) {
        const cmd = commands.get(command);
        if (!cmd) {
            embed.setDescription(`Command \`${cmd.command}\` not found`);
            embed.setColor('Red');
            await interaction.editReply({ embeds: [embed] });
            return
        }
        embed.setColor('Green');
        embed.setDescription(`Command: \`${cmd.command}\``);
        embed.addFields({
            name: 'Description',
            value: cmd.description,
        });
        embed.addFields({
            name: 'Example',
            value: cmd.example,
        });
    } else {
        embed.setDescription('List of commands');
        embed.setColor('Green');
        embed.addFields({
            name: 'Commands',
            value: commands.map((cmd) => `\`${cmd.command}\``).join('\n'),
        });
    }
    await interaction.editReply({ embeds: [embed] });
    return
};
