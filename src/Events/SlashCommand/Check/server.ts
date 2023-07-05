import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, CommandInteractionOptionResolver } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('Check server info')
    .addSubcommand((subcommand) => subcommand
        .setName('info')
        .setDescription('Check server info')
    )
    .addSubcommand((subcommand) => subcommand
        .setName('roles')
        .setDescription('Check server info for roles')
    )

export const command: string = '/server info/roles';
export const example: string = '/server info | /server roles';
export const permisisons: string = 'everyone';

export async function execute(interaction: CommandInteraction) {
    const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand();
    switch (subcommand) {
    case 'info':
        const roleCount = interaction.guild?.roles.cache.size;
        const id = interaction.guild?.id;
        const name = interaction.guild?.name;
        const description = interaction.guild?.description;
        const icon = interaction.guild?.iconURL({ size: 2048 }) || null;
        const memberCount = interaction.guild?.memberCount;
        const memberOnline = interaction.guild?.members.cache.filter((member) => member.presence?.status || !member.presence?.status).size;
        const memberIsBot = interaction.guild?.members.cache.filter((member) => member.presence?.member?.user.bot).size
        const boosterCount = interaction.guild?.premiumSubscriptionCount;
        const owner = interaction.guild?.ownerId;
        let totalText = 0;
        interaction.guild?.channels.cache.filter((channel) => {
            if (channel.isTextBased() && !channel.isThread()) totalText += 1;
        });
        let totalVoice = 0;
        interaction.guild?.channels.cache.filter((channel) => {
            if (channel.isVoiceBased()) totalVoice += 1;
        });
        let totalThread = 0;
        interaction.guild?.channels.cache.filter((channel) => {
            if (channel.isThread()) totalThread += 1;
        })
        const verificationLevel = interaction.guild?.verificationLevel;
        const embed = new EmbedBuilder()
            .setTitle('Server Info')
            .setThumbnail(icon)
            .addFields({
                name: '📛Server Name',
                value: `${name}`,
                inline: false,
            })
            .addFields({
                name: '🆔Server ID',
                value: `${id}`,
                inline: false,
            })
            .addFields({
                name: '📝Server Description',
                value: `${description}`,
                inline: false,
            })
            .addFields({
                name: '👑Server Owner',
                value: `<@${owner}>`,
                inline: true,
            })
            .addFields({
                name: '👥Member' + `(${memberCount})`,
                value: `**Online**: ${memberOnline} | **Bot**: ${memberIsBot} | **Boosters**: ${boosterCount}`,
                inline: true,
            })
            .addFields({
                name: '💬Channel (' + (totalText + totalVoice) + ')',
                value: `**Text**: ${totalText} | **Voice**: ${totalVoice}`,
                inline: true,
            })
            .addFields({
                name: '🧵Total Thread',
                value: `${totalThread}`,
                inline: true,
            })
            .addFields({
                name: '🔐Verification Level',
                value: `${verificationLevel}`,
                inline: true,
            })
            .addFields({
                name: '📢Role (' + roleCount + ')',
                value: 'Use `/server roles` to check all roles name in this server',
                inline: false,
            })
            .setColor('Random')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        break;
    case 'roles':
        const roleCount2 = interaction.guild?.roles.cache.size;
        const roleName2 = interaction.guild?.roles.cache.map((role) => role.name !== '@everyone' ? role.name : '').join(', ').replace(/^,\s*/, '');
        const iconServer = interaction.guild?.iconURL({ size: 2048 }) || null;
        const guild = interaction.guild?.name;
        const embed2 = new EmbedBuilder()
            .setTitle('Server Roles')
            .addFields({
                name: '📛Server Name',
                value: `${guild}`,
                inline: true,
            })
            .addFields({
                name: '📢Role (' + roleCount2 + ')',
                value: `${roleName2 || 'No role'}`,
                inline: false,
            })
            .setThumbnail(iconServer)
            .setColor('Random')
            .setTimestamp();
        await interaction.reply({ embeds: [embed2] });
        break;
    }
}