const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const { OWNER_ID } = require('../../../config.json');
const { apiGenshin } = require('../../Utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command')
        .addStringOption((option) => option
            .setName('type')
            .setDescription('Type')
            .setAutocomplete(true)
            .setRequired(true))
        .addStringOption((option) => option
            .setName('name')
            .setDescription('Name')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    /**
     * @param {import("discord.js").AutocompleteInteraction} interaction
     * @returns {Promise<void>}
     */
    command: '/test',
    example: '/test',
    async autocomplete(interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.respond([{
                name: 'This command is only for the owner to test a feature or something before apply to certain command',
                value: 'This command is only for the owner to test a feature or something before apply to certain command',
            }]);
        }
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');
        const choices = [];
        let search;
        // if type is not undefined, then result: "characters"
        // if name is undefined but type is not, then result: "nilou"
        // if name is not undefined and type is not, then result: "characters/nilou"
        search = type ? type : '';
        search = name ? search + '/' + name : search;
        console.log(search);
        const result = await apiGenshin(search);
        console.log(result);
        if (!result) return interaction.respond([]);
        if (result.types) {
            result.types.forEach((typeResult) => {
                choices.push({
                    name: typeResult,
                    value: typeResult,
                });
            });
        }
        else {
            result.forEach((character) => {
                choices.push({
                    name: character,
                    value: character,
                });
            });
        }
        // console.log(choices)
        interaction.respond(choices?.slice(0, 25));
    },
    /**
     *
     * @param {import("discord.js").CommandInteraction} interaction
     * @returns
     */
    async execute(interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: 'This command is only for the owner to test a feature or something before apply to certain command',
                ephemeral: true,
            });
        }
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');
        let search;
        // if type is not undefined, then result: "characters"
        // if name is undefined but type is not, then result: "nilou"
        // if name is not undefined and type is not, then result: "characters/nilou"
        search = type ? type : '';
        search = name ? search + '/' + name : search;
        console.log(search);
        const result = await apiGenshin(search);
        console.log(result);
        if (type === 'characters') {
            const title = result.title;
            const vision = result.vision;
            const weapon = result.weapon;
            const gender = result.gender;
            const nation = result.nation;
            const affiliation = result.affiliation;
            const rarity = result.rarity;
            const constellation = result.constellation;
            const birthday = result.birthday;
            const description = result.description;
            const visionKey = result.vision_key;
            const weaponType = result.weapon_type;
            const embed = new EmbedBuilder()
                .setTitle('Genshin Impact Character Info')
                .setDescription(description)
                .addFields({
                    name: 'Title',
                    value: title,
                    inline: true,
                })
                .addFields({
                    name: 'Vision',
                    value: vision,
                    inline: true,
                })
                .addFields({
                    name: 'Weapon',
                    value: weapon,
                    inline: true,
                })
                .addFields({
                    name: 'Gender',
                    value: gender,
                    inline: true,
                })
                .addFields({
                    name: 'Nation',
                    value: nation,
                    inline: true,
                })
                .addFields({
                    name: 'Affiliation',
                    value: affiliation,
                    inline: true,
                })
                .addFields({
                    name: 'Rarity',
                    value: `${rarity}`,
                    inline: true,
                })
                .addFields({
                    name: 'Constellation',
                    value: `${constellation}`,
                    inline: true,
                })
                .addFields({
                    name: 'Birthday',
                    value: birthday,
                    inline: true,
                })
                .addFields({
                    name: 'Vision Key',
                    value: visionKey,
                    inline: true,
                })
                .addFields({
                    name: 'Weapon Type',
                    value: weaponType,
                    inline: true,
                })
                .setColor('Random');
            const buttonSkill = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel('Skill Talents')
                .setCustomId('skill');
            const buttonPassiveTalents = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Passive Talents')
                .setCustomId('passive');
            const buttonConstellation = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Constellation')
                .setCustomId('constellation');

            const row = new ActionRowBuilder()
                .addComponents(buttonSkill, buttonPassiveTalents, buttonConstellation);
            await interaction.reply({
                embeds: [embed],
                components: [row],
            });
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
            collector.on('collect', async (i) => {
                if (i.customId === 'skill') {
                }
            });
        }
    },
};
