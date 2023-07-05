import { OWNER_ID } from '../../../../config.json';
import { blockUser } from '../../../Utils/block';
import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder } from 'discord.js';

export const data = {
    name: 'blockuser',
    description: 'Block a user from using the bot with specific commands',
    options: [
        {
            name: 'user',
            description: 'The user to block',
            type: 6,
            required: true,
        },
        {
            name: 'commands',
            description: 'The commands to block',
            type: 3,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for blocking the user',
            type: 3,
            required: false,
        },
    ],
};
export const command: string = '/blockuser <user> <commands> [reason]';
export const example: string = '/blockuser @user gm reason';
export const permissions: string = 'owner';
export async function execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser('user');
    const commands = (interaction.options as CommandInteractionOptionResolver).getString('commands');
    const embed = new EmbedBuilder();
    if (!user) {
        await interaction.reply({ content: 'You need to specify a user!', ephemeral: true });
        return
    }
    if (!commands) {
        await interaction.reply({ content: 'You need to specify a commands!', ephemeral: true });
        return
    }
    embed.setTitle('Block User');
    embed.setTimestamp();
    // Check if the user is the owner
    if (!OWNER_ID.includes(interaction.user.id)) {
        // Send a message
        embed.setDescription('You are not the owner of this Bot!');
        embed.setColor('Red');
        await interaction.reply({ embeds: [embed] });
        return
    }
    // get result from the function
    const blocked = await blockUser(user.id, commands);
    // Check if the user is already blocked
    if (blocked === null) {
        // Send a message
        embed.setDescription(`${user} already blocked from command ${commands}`);
        embed.setColor('Yellow');
        await interaction.reply({ embeds: [embed] });
        return
    }
    // Check if the user is successfully blocked
    if (blocked) {
        // Send a message
        embed.setDescription(`Success block ${user} to use command ${commands}`);
        embed.setColor('Green');
        await interaction.reply({ embeds: [embed] });
        return
    }
    else {
        // Send a message
        embed.setDescription(`Failed block ${user} to use command ${commands}\nReason: ${blocked}`);
        embed.setColor('Red');
        await interaction.reply({ embeds: [embed] });
        return
    }
};