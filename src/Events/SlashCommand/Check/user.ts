import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildMember, Role, SlashCommandBuilder, User } from "discord.js";

function getUserInfoEmbed(user: User, guildMember: GuildMember | undefined, embed: EmbedBuilder) {
    const createdAtTimestamp = Math.floor(user.createdTimestamp / 1000);
    const joinedToServerTimestamp: number | null = guildMember?.joinedTimestamp ? Math.floor(
        guildMember.joinedTimestamp / 1000
    ) : null;

    return embed
        .setTitle('User Info')
        .setDescription(`User info of <@${user.id}>`)
        .setThumbnail(user.displayAvatarURL({ size: 2048 }))
        .addFields(
            { name: '👤 Username', value: user.tag, inline: true },
            { name: '🆔 ID', value: user.id, inline: true },
            { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
            {
                name: '📅 Created At',
                value: `<t:${createdAtTimestamp}:F>`,
                inline: true,
            },
            {
                name: '📅 Joined To Server',
                value: joinedToServerTimestamp ? `<t:${joinedToServerTimestamp}:F>` : 'User not joined to server',
                inline: true,
            },
            {
                name: '🎭 Roles',
                value: guildMember === undefined || guildMember.roles.cache.size === 1 ?
                    'User not have any roles' :
                    `\`\`\`\n${guildMember.roles.cache.map((role: Role) => role.name).join(', ').replace(', @everyone', '')}\`\`\``,
                inline: false,
            },
            {
                name: '🔒 Permissions',
                value: guildMember?.permissions.toArray().length === 0 ?
                    'User not have any permissions' :
                    `\`\`\`\n${guildMember?.permissions.toArray().join(', ')}\`\`\``,
                inline: false,
            },
        );
}


function getUserAvatarEmbed(user: User, embed: EmbedBuilder) {
    const avatarUrl = user.displayAvatarURL({ size: 2048 });

    return embed
        .setTitle('Profile Picture')
        .setColor('Random')
        .setDescription(`<@${user.id}>'s profile picture\n\n[Avatar URL](${avatarUrl})`)
        .setImage(avatarUrl);
}

export const data = new SlashCommandBuilder()
    .setName('user')
    .setDescription('Check user info')
    .addSubcommand((subcommand) => subcommand
        .setName('info')
        .setDescription('Check user info')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User')
            .setRequired(true)),
    )
    .addSubcommand((subcommand) => subcommand
        .setName('avatar')
        .setDescription('Check user avatar')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('User')
            .setRequired(true)),
    );
export const command: string =  '/user <info|avatar> <user>';
export const example: string =  '/user info user: 506212044152897546\n/user avatar user: 506212044152897546';
export const permissions: string =  'everyone';

export async function execute(interaction: CommandInteraction) {
    const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand();
    const user = interaction.options.getUser('user');
    if (!user) {
        await interaction.reply({
            content: 'No user was found!',
            ephemeral: true
        });
        return;
    }
    if (!interaction.guild) {
        await interaction.reply({
            content: 'No guild was found!',
            ephemeral: true
        })
        return
    }
    const fetchedUser = await interaction.client.users.fetch(user.id);
    const guildMember = interaction.guild.members.cache.get(user.id);
    const commonEmbed = new EmbedBuilder()
        .setTimestamp()
        .setAuthor({
            name: fetchedUser.tag,
            iconURL: fetchedUser.displayAvatarURL({ size: 2048 }),
        });
    switch (subcommand) {
    case 'info':
        if (guildMember !== undefined) {
            await interaction.reply({
                embeds: [
                    getUserInfoEmbed(fetchedUser, guildMember, commonEmbed),
                ],
            });
        }
        break;
    case 'avatar':
        await interaction.reply({
            embeds: [getUserAvatarEmbed(fetchedUser, commonEmbed)],
        });
    }
};