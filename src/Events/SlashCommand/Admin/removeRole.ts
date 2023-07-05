import { CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionsBitField } from 'discord.js';

export const data = {
        name: 'removerole',
        description: 'Remove a role from a user',
        options: [
            {
                name: 'user',
                description: 'The user to remove the role from',
                type: 6,
                required: true,
            },
            {
                name: 'role',
                description: 'The role to remove from the user',
                type: 8,
                required: true,
            },
        ],
};
export const command: string = '/removerole <user> <role>';
export const example: string = '/removerole @user @role';
export const permissions: string = 'certain';

export async function execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser('user');
    if (!user) {
        await interaction.reply({
            content: 'Please provide a user',
            ephemeral: true
        });
        return;
    }
    const role = (interaction.options as CommandInteractionOptionResolver).getRole('role');
    const member = interaction.guild?.members.cache.get(user.id);

    if (!role) {
        await interaction.reply({
            content: 'Please provide a role',
            ephemeral: true
        });
        return;
    }

    if (!member) {
        await interaction.reply({
            content: 'Please provide a valid user',
            ephemeral: true
        });
        return
    }

    if (!(interaction.member instanceof GuildMember)) {
        return;
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        await interaction.reply({ content: 'You don\'t have permission to manage roles', ephemeral: true });
        return
    }
    if (!member.roles.cache.has(role.id)) {
        await interaction.reply({ content: 'This user doesn\'t have this role', ephemeral: true });
        return
    }
    if (!interaction.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        await interaction.reply({ content: 'I don\'t have permission to manage roles', ephemeral: true });
        return
    }
    member.roles.remove(role.id).then(async () => {
        await interaction.reply({ content: `Removed role ${role.name} from ${user.tag}` });
    }).catch( async (error) => {
        await interaction.reply({
            content: `Error: ${error.message}`,
        });
    });
};
