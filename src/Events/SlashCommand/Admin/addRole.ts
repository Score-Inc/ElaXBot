import { CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionsBitField } from "discord.js";
import { OWNER_ID } from '../../../../config.json';
import { InteractionCreateInformation } from '../../../interface/InteractionCreate'

export const data = {
    name: 'addrole',
    description: 'Add a role to a user',
    options: [
        {
            name: 'user',
            description: 'The user to add the role to',
            type: 6,
            required: true,
        },
        {
            name: 'role',
            description: 'The role to add to the user',
            type: 8,
            required: true,
        },
    ],
};

export const command: InteractionCreateInformation = {
    name: data.name,
    command: '/addrole <user> <role>',
    permissions: "everyone",
    example: '/addrole @ElaXan @Admin',
    enable: true,
}

export async function execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const role = (interaction.options as CommandInteractionOptionResolver).getRole('role');
    if (!user) {
        await interaction.reply({ content: 'You must specify a user to add the role to', ephemeral: true });
        return
    }
    if (!role) {
        await interaction.reply({ content: 'You must specify a role to add to the user', ephemeral: true });
        return
    }
    const member: GuildMember | undefined = interaction.guild?.members.cache.get(user.id);

    if (!member) {
        await interaction.reply({ content: 'That user does not exist', ephemeral: true });
        return
    }

    if (!(interaction.member instanceof GuildMember)) {
        await interaction.reply({ content: 'You must be a member of the server to use this command', ephemeral: true });
        return
    }
    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        await interaction.reply({ content: 'You don\'t have permission to manage roles', ephemeral: true });
        return
    }
    if (member.roles.cache.has(role.id)) {
        await interaction.reply({ content: `<@${user.id}> already has the role ${role.name}`, allowedMentions: { repliedUser: false, parse: [] } });
        return
    }
    if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        await interaction.reply({ content: 'I don\'t have permission to manage roles' });
        return
    }
    member.roles.add(role.id).then(() => {
        interaction.reply({ content: `Added role ${role.name} to ${user.tag}` });
    }).catch(() => {
        interaction.reply({ content: 'I don\'t have permission to add roles to this user' });
    });
};
