import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { search } from '../../../Utils/searchAnime';

export const data = {
    name: 'myanimelist',
    description: 'Search for an anime',
    options: [
        {
            name: 'search',
            description: 'Search for an anime',
            type: 3,
            required: true,
        },
    ],
};
export const command: string = '/anime <search>';
export const example: string = '/anime search: Naruto';
export const permissions: string = 'everyone';
export async function execute(interaction: CommandInteraction, page: number = 0, isDefered: boolean = false, isDeferUpdate: boolean = false) {
    // ambil nama anime dari opsi
    const anime = (interaction.options as CommandInteractionOptionResolver).getString('search');
    if (!anime) {
        await interaction.reply({
            content: 'Please provide anime name!',
        });
        return
    }
    // kirim balasan sebelum mencari anime "(nama bot) is thinking..."
    if (!isDefered) {
        await interaction.deferReply();
    }
    // cari anime
    const result = await search(anime, page);
    // jika tidak ada anime yang ditemukan, kirim balasan "No anime found"
    if (result === null || result === undefined) {
        // bikin embed
        const embed = new EmbedBuilder()
            // set judul embed
            .setTitle(anime)
            // set deskripsi embed
            .setDescription('No anime found')
            // set warna embed ke merah
            .setColor('Red')
            // set footer embed dengan API yang digunakan
            .setAuthor({ name: 'Powered by Kitsu API', iconURL: 'https://avatars.githubusercontent.com/u/7648832?s=200&v=4' });
        await interaction.editReply({ embeds: [embed] });
        return
    }
    const embed = new EmbedBuilder()
        // set judul embed
        .setTitle(result.title || 'No Title found')
        // set deskripsi embed (background)
        .setDescription(result.background?.slice(0, 250) + '...') // ambil 250 karakter pertama dari background
        // set warna embed ke hijau
        .setColor('Green')
        // tambahkan field
        .addFields(
            {
                name: 'Genres',
                value: `${result.genres}`,
            },
            {
                name: 'Status',
                value: `${result.status}`,
            },
            {
                name: 'Episodes',
                value: `${result.episodes}`,
            },
            {
                name: 'Age Rating',
                value: `${result.ageRating}`,
            },
            {
                name: 'Type',
                value: `${result.type}`,
            },
            {
                name: 'Score',
                value: `${result.score}`,
            },
            {
                name: 'Streaming',
                value: `${result.streaming}`,
            },
            {
                name: 'NSFW',
                value: `${result.nsfw}`,
            },
        )
        // set gambar thumbnail sebagai gambar anime
        .setThumbnail(result.images || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP4lvgAbU3yQHtSKMleA0zGa4TFcFlrFss76jF4EvmjQ&s")
        .setTimestamp()
        // set footer embed dengan API yang digunakan
        .setAuthor({ name: 'Powered by Kitsu API', iconURL: 'https://avatars.githubusercontent.com/u/7648832?s=200&v=4' });
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(result.previous === null ? true : false),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(result.next === null ? true : false),
        );
    await interaction.editReply({ embeds: [embed], components: [row] });
    const collector = interaction.channel?.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 60000,
    });
    collector?.on('collect', async (i) => {
        if (i.customId === 'next') {
            page++;
            if (!isDeferUpdate) {
                await i.deferUpdate();
            }
            execute(interaction, page, true, true);
        }
        else if (i.customId === 'previous') {
            page--;
            if (!isDeferUpdate) {
                await i.deferUpdate();
            }
            execute(interaction, page, true, true);
        }
    });
    collector?.on('end', async (i) => {
        await interaction.editReply({ components: [] });
    });
};
