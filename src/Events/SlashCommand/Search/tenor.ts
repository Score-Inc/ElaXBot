import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { Tenor } from '../../../../config.json';
import axios from 'axios';

async function tenorGif(query: string | number, type: string) {
    const result = await axios.get(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${Tenor.API_KEY}&limit=1`);
    if (type === 'gif') {
        return result.data.results[0].media_formats.gif.url;
    }
    else if (type === 'mp4') {
        return result.data.results[0].media_formats.mp4.url;
    }
}

export const data = new SlashCommandBuilder()
    .setName('tenor')
    .setDescription('Search for GIFs/mp4 on Tenor')
    .addSubcommand((subcommand) => subcommand
        .setName('gif')
        .setDescription('Search for GIFs on Tenor')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('Search query')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) => subcommand
        .setName('mp4')
        .setDescription('Search for mp4 on Tenor')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('Search query')
            .setRequired(true),
        ),
    );
export const command: string = '/tenor <gif|mp4> query: <query>';
export const example: string = '/tenor gif query: Keqing\n/tenor mp4 query: Keqing';
export const permissions: string = 'everyone';

export async function execute(interaction: CommandInteraction) {
    const query = (interaction.options as CommandInteractionOptionResolver).getString('query');
    if (!query) {
        await interaction.reply({
            content: 'Please provide anime name or title!'
        })
        return;
    }
    switch ((interaction.options as CommandInteractionOptionResolver).getSubcommand()) {
    case 'gif':
        const gif = await tenorGif(query, 'gif');
        const embed = new EmbedBuilder()
            .setTitle(`Tenor GIF: ${query}`)
            .setImage(gif)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor('Random');
        await interaction.reply({ embeds: [embed] });
        break;
    case 'mp4':
        const mp4 = await tenorGif(query, 'mp4');
        const embed2 = new EmbedBuilder()
            .setTitle(`Tenor mp4: ${query}`)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor('Random');
        const attachment = new AttachmentBuilder(mp4);
        await interaction.reply({ embeds: [embed2] });
        await interaction.followUp({ files: [attachment] });
    }
};