import { getPlayer, getImage } from '../../../Utils/enka'
import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, CommandInteractionOptionResolver, CacheType } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('enka')
    .setDescription('Check player data')
    .addSubcommand((subcommand) => subcommand
        .setName('info')
        .setDescription('Check player info')
        .addNumberOption((option) => option
            .setName('uid')
            .setRequired(true)
            .setDescription('You\'re UID from Official Server')
        )
    );

export async function execute(interaction: CommandInteraction) {
    const subcommand = (interaction.options as CommandInteractionOptionResolver<CacheType>).getSubcommand();
    switch (subcommand) {
    case 'info':
        const uid = (interaction.options as CommandInteractionOptionResolver).getNumber('uid');
        if (!uid) {
            await interaction.reply({
                content: 'Please enter your UID first!'
            })
            return;
        }
        try {
            const result = await getPlayer(uid);
            let characterList = '';
            result.player.showcase.forEach((item) => {
                return characterList += `${item.name} - ${item.level}\n`;
            });
            let nameCardList = '';
            result.player.namecardsList.forEach((item) => {
                return nameCardList += `${item.name} - ${item.id}\n`;
            });
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: 'Enka',
                    iconURL: 'https://enka.network/favicon.png',
                    url: 'https://enka.network'
                })
                .setTitle(`${result.player.username} (${result.uid})`)
                .setDescription(`${result.player.signature ?? 'None'}`)
                .setThumbnail(getImage(result.player.profilePicture.assets.icon))
                .addFields({
                    name: 'Rank',
                    value: `WL: ${result.player.levels.world} | Rank: ${result.player.levels.rank}`,
                    inline: true
                })
                .addFields({
                    name: 'Abyss',
                    value: `Floor: ${result.player.abyss.floor} | Chamber: ${result.player.abyss.chamber}`,
                    inline: true
                })
                .addFields({
                    name: 'Namecard',
                    value: `Name: ${result.player.namecard.name}\nID: ${result.player.namecard.id} | [Icon](${getImage(result.player.namecard.assets.icon)})`,
                    inline: true
                })
                .addFields({
                    name: 'Achievement',
                    value: `Total: ${result.player.achievements}`,
                    inline: true,
                })
                .addFields({
                    name: 'Character Showcase',
                    value: `\`\`\`${characterList}\`\`\``,
                })
                .addFields({
                    name: 'Namecard List',
                    value: `\`\`\`${nameCardList}\`\`\``,
                })
                .setColor('Random');
            await interaction.reply({
                embeds: [embed]
            });
        } catch (error) {
            console.log(error);
        }
        break;
    }
}