import { SlashCommandBuilder, ChannelType, CommandInteraction, CommandInteractionOptionResolver, TextChannel, GuildMember } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('send')
    .setDescription('Send message to channel')
    .addStringOption((option) => option
        .setName('message')
        .setDescription('Message to send')
        .setRequired(true))
    .addChannelOption((option) => option
        .addChannelTypes(ChannelType.GuildText)
        .setName('channel')
        .setDescription('Channel to send message')
        .setRequired(false));

export async function execute(interaction: CommandInteraction) {
    const message = (interaction.options as CommandInteractionOptionResolver).getString('message');
    const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel') as TextChannel ?? interaction.channel;
    if (!message) {
        await interaction.reply({ content: 'Message is required', ephemeral: true });
        return;
    }
    if (!(interaction.member instanceof GuildMember)) return;
    if (!interaction.member?.permissionsIn(channel).has('SendMessages')) {
        await interaction.reply({ content: `You don't have permission to send message in ${channel}`, ephemeral: true });
        return
    }
    if (!interaction.guild?.members.me?.permissionsIn(channel).has('SendMessages')) {
        await interaction.reply({ content: `I don't have permission to send message in ${channel}`, ephemeral: true });
        return
    }
    await channel.send(message);
    await interaction.reply({ content: `Message sent to ${channel}`, ephemeral: true });
};
