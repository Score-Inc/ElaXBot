import { SlashCommandBuilder, AttachmentBuilder, CommandInteraction, CommandInteractionOptionResolver, CacheType } from 'discord.js';
import fs from 'fs';
import qr from 'qrcode';

export const data = new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('Generate QR Code')
    .addStringOption((option) => option
        .setName('text')
        .setDescription('Text to bee converted to QR Code')
        .setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const text = (interaction.options as CommandInteractionOptionResolver<CacheType>).getString('text');
    if (!text) {
        await interaction.reply({
            content: 'No text provided',
            ephemeral: true
        })
        return
    }
    const pathFile = `./src/cache/qrcode/${interaction.user.id}.png`;
    await qr.toFile(pathFile, text);
    if (!fs.existsSync(pathFile)) {
        await interaction.reply({
            content: 'Something went wrong!',
            ephemeral: true,
        })
        return
    }
    const attachment = new AttachmentBuilder(pathFile);
    await interaction.reply({
        content: `Here is QRCode: ${text}`,
        files: [attachment]
    });
    fs.unlinkSync(pathFile);
}