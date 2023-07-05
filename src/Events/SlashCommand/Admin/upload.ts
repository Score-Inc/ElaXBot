import { CommandInteraction, CommandInteractionOptionResolver } from "discord.js";
import process from 'process'
import fs from 'fs'
import { OWNER_ID } from '../../../../config.json';
import path from 'path';

export const data = {
    name: 'upload',
    description: 'Upload a file to the server',
    options: [
        {
            name: 'file',
            description: 'File to upload',
            type: 3,
            required: true,
        },
    ],
};
export const command: string = '/upload <file>';
export const example: string = '/upload /home/user/file.txt';
export const permissions: string = 'owner';
export async function execute(interaction: CommandInteraction) {
    const file = (interaction.options as CommandInteractionOptionResolver).getString('file');
    if (!file) {
        await interaction.reply({ content: 'File not found.', ephemeral: true });
        return
    }
    const basename = path.basename(file);
    const getPath = path.dirname(file);
    const getSizeOfFile = fs.statSync(file).size;

    if (!OWNER_ID.includes(interaction.user.id)) {
        await interaction.reply({ content: 'You are not the owner of this bot.', ephemeral: true });
        return
    }

    if (!fs.existsSync(file)) {
        await interaction.reply({ content: 'File not found.', ephemeral: true });
        return
    }
    if (getPath === '.') {
        const getPath = process.cwd();
        await interaction.reply(
            {
                content: `Uploading ${basename}`,
            },
        );
        await interaction.editReply(
            {
                content: `\`\`\`\nName : ${basename}\nDirectory : ${getPath}\nSize : ${getSizeOfFile} bytes\`\`\``,
                files: [
                    file,
                ],
            },
        );
        return
    }
    await interaction.reply(
        {
            content: `Uploading ${basename}`,
        },
    );
    await interaction.editReply(
        {
            content: `\`\`\`\nName : ${basename}\nDirectory : ${getPath}\nSize : ${getSizeOfFile} bytes\`\`\``,
            files: [
                file,
            ],
        },
    );
};
