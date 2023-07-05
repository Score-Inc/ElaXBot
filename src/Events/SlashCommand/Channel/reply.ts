import { SlashCommandBuilder, ChannelType, CommandInteraction, CommandInteractionOptionResolver, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('reply')
    .setDescription('Replies with a message.')
    .addStringOption((option) => option
        .setName('message_id')
        .setDescription('The message ID to reply to.')
        .setRequired(true))
    .addStringOption((option) => option
        .setName('message')
        .setDescription('The message to send.')
        .setRequired(true))
    .addChannelOption((option) => option
        .addChannelTypes(ChannelType.GuildText)
        .setName('channel')
        .setDescription('The channel to send the message to.')
        .setRequired(false)
    )
    .addBooleanOption((option) => option
        .setName('mention')
        .setDescription('Sends the message as a mention.')
        .setRequired(false)
    );
export const permissions: string = 'everyone';
export async function execute(interaction: CommandInteraction) {
    const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel', false);
    const messageID = (interaction.options as CommandInteractionOptionResolver).getString('message_id', true);
    const message = (interaction.options as CommandInteractionOptionResolver).getString('message', true);
    const mention = (interaction.options as CommandInteractionOptionResolver).getBoolean('mention', false) || false;
    
    const textChannel = channel as TextChannel ?? interaction.channel;

    if(!(interaction.member instanceof GuildMember)) {
        return;
    }
    const isUserHavePermission = interaction.member.permissionsIn(textChannel).has('SendMessages');
    if (!isUserHavePermission) {
        await interaction.reply({
            content: `You do not have permission to send messages in ${textChannel}.`,
            ephemeral: true,
        });
        return
    }

    if (!interaction.guild?.members.me?.permissionsIn(textChannel).has('SendMessages')) {
        await interaction.reply({
            content: `I do not have permission to send messages in ${textChannel}.`,
            ephemeral: true,
        });
        return
    }

    const msg = await textChannel.messages.fetch(messageID);
    await msg.reply({
        content: `${message}\n\n- ${interaction.user.tag}`,
        allowedMentions: {
            repliedUser: mention,
        },
    });
    await interaction.reply({
        content: `Sent a reply to ${messageID} in ${textChannel}.`,
        ephemeral: true,
    });
};