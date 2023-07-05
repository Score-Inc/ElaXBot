import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver, CollectorFilter, ButtonInteraction } from 'discord.js';
import { apiRequest } from '../../../Utils/api'
import MongoDB from '../../../Utils/db'

const database = new MongoDB()

export const data = new SlashCommandBuilder()
    .setName('gm')
    .setDescription('Search for a ID in the GM Handbook')
    .addStringOption((option) =>
        option.setName('search')
            .setDescription('Search for a ID in the GM Handbook')
            .setRequired(true)
            .setAutocomplete(true),
    )
    .addStringOption((option) =>
        option.setName('category')
            .setDescription('The category of the ID')
            .setRequired(false)
            .addChoices(
                {
                    name: 'Avatars',
                    value: 'avatars',
                },
                {
                    name: 'Quest',
                    value: 'quest',
                },
                {
                    name: 'Items',
                    value: 'items',
                },
                {
                    name: 'Monsters',
                    value: 'monsters',
                },
                {
                    name: 'Scenes',
                    value: 'scenes',
                },
                {
                    name: 'Gadgets',
                    value: 'gadgets',
                },
                {
                    name: 'Achievements',
                    value: 'achievements',
                },
            ),
    )
    .addBooleanOption((option) =>
        option.setName('match')
            .setDescription('The match of the ID or name')
            .setRequired(false),
    );

export const command: string = '/gm <search> [category]';
export const example: string = '/gm search: Kamisato Ayaka category: Avatars';
export const permissions: string = 'everyone';

export async function autocomplete(interaction: AutocompleteInteraction) {
    try {
        const search = interaction.options.getString('search')
        const category = interaction.options.getString('category');
        const apiResult = await apiRequest('gm-autocomplete', {
            'search': search,
            'with_category': true,
            'category': category,
        });
        await interaction.respond(apiResult?.slice!(0, 25));
    } catch {
    }
}

export async function execute(interaction: CommandInteraction) {
    if (!interaction.guild || !interaction.channel) {
        await interaction.reply({
            content: 'This command only can execute in guild or server!'
        })
        return
    }
    const search = (interaction.options as CommandInteractionOptionResolver).getString('search') || '';
    const category = (interaction.options as CommandInteractionOptionResolver).getString('category') || '';
    const match = (interaction.options as CommandInteractionOptionResolver).getBoolean('match') || false;
    await interaction.deferReply({
        fetchReply: true
    });
    let searchID;
    const keywords = ['Avatars', 'Quest', 'Items', 'Monsters', 'Scenes', 'Gadgets', 'Achievements'];
    const index = keywords.findIndex((keyword) => search?.includes(` | (${keyword})`));
    if (index !== -1) {
        searchID = search.split(` | (${keywords[index]})`)[0];
    } else {
        searchID = search;
    }

    const apiResult = await apiRequest('gm', {
        'search': searchID,
        'category': category,
        'match': match,
    });
    const image = apiResult?.image || 'https://static.thenounproject.com/png/1400397-200.png';

    let resultsName;
    if (searchID?.includes(' : ')) {
        resultsName = searchID.split(' : ')[1];
    } else {
        resultsName = searchID
    }
    const whiteList = [
        "987879230585069609",
        "987875574083117056"
    ]
    if (interaction.guild.id === '964119462188040202' && !whiteList.includes(interaction.channel.id)) {
        await interaction.editReply({
            content: `This channel is not allowed to use this command. However, the ID of ${resultsName} is "${apiResult.result.id}". Please note that if you continue to use this command in this channel, you will be blocked from using the \`/gm\` command in the future.\nYou should use the \`/gm\` command in the <#987879230585069609> channel.`,
        });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('Search Result')
        .setColor('Red')
        .setTimestamp(new Date())
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
            url: `https://discord.com/users/${interaction.user.id}`
        });
    if (apiResult.result?.id === 'Not Found') {
        embed.setDescription(`Not found for ${resultsName} ${category ? `in ${category}` : ''}`);
        await interaction.editReply({
            embeds: [embed],
        });
        return;
    } else if (apiResult.result.id === 'Error') {
        embed.setDescription(`Error while find id ${resultsName}`);
        await interaction.editReply({
            embeds: [embed],
        });
        return;
    } else if (apiResult.result.name === 'Typo or not found') {
        embed.setDescription(`Did you mean "${apiResult.result.id}"?`);
        await interaction.editReply({
            embeds: [embed],
        });
        return;
    }
    const messageForPeopleNotSetPlayerData = '\n\nApplying the command is disabled, If you want to apply the command after found ID, you can set your player data using the command `/player set` by following your UID, Server, and Code.'
    const randomDescriptions = [
        'Powered by [api.elaxan.com](https://api.elaxan.com)',
        'This request using api from [api.elaxan.com](https://api.elaxan.com)',
        'Data retrieved from [api.elaxan.com](https://api.elaxan.com)',
        'Information sourced from [api.elaxan.com](https://api.elaxan.com)',
        'Fueled by [api.elaxan.com](https://api.elaxan.com) API',
        'Retrieved from [api.elaxan.com](https://api.elaxan.com)',
        'Data provided by [api.elaxan.com](https://api.elaxan.com)',
    ];

    const checkPlayerData = await database.findOne('setPlayer', { _id: interaction.user.id })
    let isGIO: boolean;
    let isButtonEnabled: boolean;
    if (checkPlayerData === null) {
        isButtonEnabled = false
    } else if (checkPlayerData?.server === 'eu2-gio1') {
        isGIO = true
        isButtonEnabled = true
    } else {
        isGIO = false
        isButtonEnabled = true
    }

    function generateRandomDescription(name: string) {
        const randomIndex = Math.floor(Math.random() * randomDescriptions.length);
        return randomDescriptions[randomIndex].replace('%NAME%', name);
    }

    const description = generateRandomDescription(apiResult.result.name);
    const embedSearchResult = new EmbedBuilder();
    embedSearchResult.setTitle('Search Result');
    embedSearchResult.setURL('https://api.elaxan.com');
    embedSearchResult.setDescription(`${description}${isButtonEnabled === false ? messageForPeopleNotSetPlayerData : ''}`);
    embedSearchResult.setColor('Green');
    embedSearchResult.setThumbnail(image);
    embedSearchResult.setTimestamp(new Date());
    embedSearchResult.addFields({
        name: '🆔 ID',
        value: apiResult.result.id,
        inline: true,
    });
    embedSearchResult.addFields({
        name: '🔖 Name',
        value: apiResult.result.name,
    });
    embedSearchResult.addFields({
        name: '🗃️ Category',
        value: apiResult.result.category,
    });
    embedSearchResult.setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
        url: `https://discord.com/users/${interaction.user.id}`
    });
    const button = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Commands GC')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('commands_gc'),
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('Commands GIO')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('commands_gio'),
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('Apply The Command')
                .setStyle(ButtonStyle.Success)
                .setCustomId('apply_command')
                .setDisabled(!isButtonEnabled)
        );
    await interaction.editReply({ embeds: [embedSearchResult], components: [button] });
    const filter: CollectorFilter<[ButtonInteraction | any]> = (i: ButtonInteraction) => (i.customId === 'commands_gc' || i.customId === 'commands_gio' || i.customId === 'apply_command') && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 20000 });
    collector.on('collect', async (i) => {
        try {
            if (i.customId === 'commands_gc' || i.customId === 'commands_gio') {
                const embedCollector = new EmbedBuilder()
                embedCollector.setTitle(`Commands ${i.customId === 'commands_gc' ? 'GC' : 'GIO'}`);
                embedCollector.setURL('https://api.elaxan.com');
                embedCollector.setDescription(`List of commands for ${apiResult.result?.category} category`);
                embedCollector.setColor('Green');
                embedCollector.setThumbnail(image);
                embedCollector.setTimestamp();
                embedCollector.setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL(),
                    url: `https://discord.com/users/${interaction.user.id}`
                });

                if (i.customId === 'commands_gc') {
                    const gcCommands = apiResult.commands.gc;
                    const gcFields = Object.keys(gcCommands).map((key) => {
                        const { name, value } = gcCommands[key];
                        return { name, value };
                    });
                    if (await database.findOne('GMCommandsCache', { _id: interaction.user.id })) {
                        await database.newOne('GMCommandsCache', { _id: interaction.user.id }, {
                            gcFields,
                        });
                    }
                    else {
                        await database.insertOne('GMCommandsCache', { _id: interaction.user.id, gcFields });
                    }
                    embedCollector.addFields(gcFields);
                } else if (i.customId === 'commands_gio') {
                    const gioCommands = apiResult.commands.gio;
                    const gioFields = Object.keys(gioCommands).map((key) => {
                        const { name, value } = gioCommands[key];
                        return { name, value };
                    });
                    if (await database.findOne('GMCommandsCache', { _id: interaction.user.id })) {
                        await database.newOne('GMCommandsCache', { _id: interaction.user.id }, {
                            gioFields,
                        });
                    }
                    else {
                        await database.insertOne('GMCommandsCache', { _id: interaction.user.id, gioFields });
                    }
                    embedCollector.addFields(gioFields);
                }
                try {
                    await i.deferUpdate();
                    await interaction.editReply({
                        embeds: [embedCollector],
                        components: []
                    })
                } catch {

                }
            } else if (i.customId === 'apply_command') {
                if (checkPlayerData === null) {
                    await interaction.followUp({
                        content: 'Before you can use this command, we need your player data. Please use the `/player set` command followed by your UID, code, and server information to set up your player data. Once you have set up your player data, you can proceed to apply the command.',
                        ephemeral: true,
                        components: [],
                    });
                    return;
                }

                // const EU2_GIO1_SERVER = 'eu2-gio1';

                // const serverName = checkPlayerData?.server;
                // const isEU2GIO1 = serverName === EU2_GIO1_SERVER;

                // const commands = apiResult.commands;
                // const fields = Object.keys(commands).map((key) => {
                //     const { name, value } = commands[key];
                //     return { name, value };
                // });

                // try {
                //     const cacheDocument = await findOne('GMCommandsCache', { _id: interaction.user.id });
                //     const cacheFields = cacheDocument?.gcFields || cacheDocument?.gioFields;

                //     if (isEU2GIO1) {
                //         cacheFields.gioFields = fields;
                //     } else {
                //         cacheFields.gcFields = fields;
                //     }

                //     if (cacheDocument) {
                //         await newOne('GMCommandsCache', { _id: interaction.user.id }, cacheFields);
                //     } else {
                //         await insertOne('GMCommandsCache', { _id: interaction.user.id, ...cacheFields });
                //     }
                // } catch (error) {
                //     // Do nothing for now
                // }

                if (checkPlayerData?.server !== 'eu2-gio1') {
                    const gcCommands = apiResult.commands.gc;
                    const gcFields = Object.keys(gcCommands).map((key) => {
                        const { name, value } = gcCommands[key];
                        return { name, value };
                    });
                    if (await database.findOne('GMCommandsCache', { _id: interaction.user.id })) {
                        await database.newOne('GMCommandsCache', { _id: interaction.user.id }, {
                            gcFields,
                        });
                    }
                    else {
                        await database.insertOne('GMCommandsCache', { _id: interaction.user.id, gcFields });
                    }
                } else {
                    const gioCommands = apiResult.commands.gio;
                    const gioFields = Object.keys(gioCommands).map((key) => {
                        const { name, value } = gioCommands[key];
                        return { name, value };
                    });
                    if (await database.findOne('GMCommandsCache', { _id: interaction.user.id })) {
                        await database.newOne('GMCommandsCache', { _id: interaction.user.id }, {
                            gioFields,
                        });
                    }
                    else {
                        await database.insertOne('GMCommandsCache', { _id: interaction.user.id, gioFields });
                    }
                }


                function createTextInput(label: string, placeholder: string, required: boolean = false): TextInputBuilder {
                    return new TextInputBuilder()
                        .setCustomId(`${category.toLowerCase()}_${label.toLowerCase().replace(/\s/g, '_')}`)
                        .setPlaceholder(placeholder)
                        .setStyle(TextInputStyle.Short)
                        .setLabel(label)
                        .setRequired(required);
                }
                function addTextInputsToModal(modal: ModalBuilder, textInputs: TextInputBuilder[]): void {
                    textInputs.forEach(textInput => {
                        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
                        modal.addComponents(actionRow);
                    });
                }
                const modal = new ModalBuilder()
                    .setTitle('Apply The Command')
                    .setCustomId('gm');
                const { category } = apiResult.result;
                if (category === 'Avatars') {
                    if (isGIO) {
                        const level = createTextInput('Level of the character', '90');
                        const constellation = createTextInput('Constellation of the characters', '6');
                        addTextInputsToModal(modal, [level, constellation]);
                
                        await i.showModal(modal);
                    }
                    else if (!isGIO) {
                        const id = createTextInput('ID of the character', apiResult.commands.gio.commands_1.value.replace('avatar add', '').trim() + ' (Don\'t change this)');
                        addTextInputsToModal(modal, [id]);
                
                        await i.showModal(modal);
                    }
                }
                else if (category === 'Items') {
                    if (!isGIO) {
                        const level = createTextInput('Level of the item', '90');
                        const amount = createTextInput('Amount of the item', '1');
                        const refinement = createTextInput('Refinement of the item', '1');
                        addTextInputsToModal(modal, [level, amount, refinement]);
                
                        await i.showModal(modal);
                    }
                    else if (isGIO) {
                        const amount = createTextInput('Amount of the item', '50');
                        addTextInputsToModal(modal, [amount]);

                        await i.showModal(modal);
                    }
                }
                else if (category === 'Quests') {
                    if (isGIO) {
                        const addRemoveQuest = createTextInput('Set 1 to add the quest, 2 to remove the quest', '1', true);
                        addTextInputsToModal(modal, [addRemoveQuest]);
                
                        await i.showModal(modal);
                    }
                    else if (!isGIO) {
                        const addRemoveAcceptQuest = createTextInput('1: Add the quest | 2: Remove the quest | 3: Accept the quest', '1', true);
                        addTextInputsToModal(modal, [addRemoveAcceptQuest]);
                
                        await i.showModal(modal);
                    }
                }
                else if (category === 'Monsters') {
                    if (!isGIO) {
                        const amount = createTextInput('Amount of the monster', '1');
                        const level = createTextInput('Level of the monster', '200');
                        const healthPoint = createTextInput('Health point of the monster', '100000');
                        addTextInputsToModal(modal, [amount, level, healthPoint]);
                
                        await i.showModal(modal);
                    }
                }
            }
        } catch {

        } finally {
            await interaction.editReply({
                components: []
            });
            collector.stop();
        }
    })
    collector.on('end', async () => {
        await interaction.editReply({
            components: []
        })
        return;
    })
}