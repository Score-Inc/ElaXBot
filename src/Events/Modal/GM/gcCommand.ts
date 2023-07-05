import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";

import { apply } from '../../../Utils/applyCommand';
import MongoDB from '../../../Utils/db';
import { log } from "../../../log/log";

export const name: string = 'gm';

const database = new MongoDB()

export async function execute(interaction: ModalSubmitInteraction) {
    const fields = interaction.fields.fields;
    const value = fields.map((field) => field.value);
    const customId = fields.map((field) => field.customId);
    // convert name "avatars_level" to "avatars" as category
    const categoryName = customId[0]?.split('_')[0];
    const result = await database.findOne('GMCommandsCache', {
        _id: interaction.user.id,
    });
    const commandsGC = result?.gcFields || result?.gioFields;
    if (!commandsGC) {
        await interaction.reply({
            content: 'Error: No commands found'
        });
        return
    }
    let commandResult;
    if (categoryName === 'avatars') {
        if (commandsGC[0].value?.startsWith('avatar')) {
            commandResult = commandsGC[0].value;
        }
        else if (commandsGC[0].value?.startsWith('/give')) {
            const commandLevel = value[0] ? ' lv' + value[0] : '';
            const commandConstellation = value[1] ? ' c' + value[1] : '';
            const combine = commandLevel + commandConstellation;
            commandResult = commandsGC[0].value?.replace('/give', 'give') + combine;
        }
    }
    else if (categoryName === 'items') {
        if (commandsGC[0].value?.startsWith('/give')) {
            const commandLevel = value[0] ? ' lv' + value[0] : '';
            const commandAmount = value[1] ? ' x' + value[1] : '';
            const commandRefinenment = value[2] ? ' r' + value[2] : '';
            const combine = commandLevel + commandAmount + commandRefinenment;
            commandResult = `${commandsGC[1].value?.replace('/give', 'give')?.replace(' x<amount>', '') + combine}`.trim();
        }
        else if (commandsGC[0].value?.startsWith('item')) {
            const commandAmount = value[0] ? ' ' + value[0] : '';
            commandResult = `${commandsGC[0].value?.replace(' <amount>', '') + commandAmount}`.trim();
        }
    }
    else if (categoryName === 'quests') {
        if (commandsGC[0].value?.startsWith('/q')) {
            const command = parseInt(value[0]);
            if (command < 1 || command > 2) {
                await interaction.deferReply();
                await interaction.editReply({
                    content: 'Error: Invalid argument (Please choose 1 or 2)',
                });
                return
            }
            commandResult = command === 1 ? commandsGC[0].value?.replace('/q', 'q') : commandsGC[1].value?.replace('/q', 'q');
        }
        else if (commandsGC[0].value?.startsWith('quest')) {
            const command = parseInt(value[0]);
            if (command < 1 || command > 3) {
                await interaction.deferReply();
                await interaction.editReply({
                    content: 'Error: Invalid argument (Please choose 1 or 3)',
                });
                return
            }
            commandResult = command === 1 ? commandsGC[0].value?.replace(' <quest_id>', '') : command === 2 ? commandsGC[1].value?.replace(' <quest_id>', '') : commandsGC[2].value?.replace(' <quest_id>', '');
        }
    }
    else if (categoryName === 'monsters') {
        if (commandsGC[0].value?.startsWith('/spawn')) {
            const commandAmount = value[0] ? ' x' + value[0] : '';
            const commandLevel = value[1] ? ' lv' + value[0] : '';
            const commandHp = value[2] ? ' hp' + value[0] : '';
            const combine = commandAmount + commandLevel + commandHp;
            commandResult = `${commandsGC[0].value?.replace('/spawn', 'spawn') + combine}`.trim();
        }
        else if (commandsGC[0].value?.startsWith('monster')) {
            const commandAmount = value[0] ? ' ' + value[0] : '';
            const commandLevel = value[1] ? ' ' + value[1] : '';
            const combine = commandAmount + commandLevel;
            commandResult = `${commandsGC[0].value?.replace(' <amount>', '')?.replace(' <level>', '') + combine}`.trim();
        }
    }
    else if (categoryName === 'achievements') {
        const command = parseInt(value[0]);
        if (command < 1 || command > 2) {
            await interaction.deferReply();
            await interaction.editReply({
                content: 'Error: Invalid argument (Please choose 1 or 2)',
            });
            return
        }
        commandResult = command === 1 ? commandsGC[0].value?.replace('/am', 'am') : commandsGC[1].value?.replace('/am', 'am');
    }
    try {
        await interaction.deferReply();
        const json = await database.findOne('setPlayer', { _id: interaction.user.id });
        const result = await apply(json?.uid, json?.code, json?.server, commandResult);
        if (result) {
            let message: { text: string, tips?: string };
            const resultOfAPI = result.msg + '\n\nStatus Code: ' + result.code;
            const embed = new EmbedBuilder()
                .setTitle('Apply the Command')
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setFooter({
                    text: `${commandResult}`
                })
                .setTimestamp(new Date())
                .setURL('https://api.elaxan.com/gm');
            if (result.code === 617)  {
                embed.setColor('Red')
                message = {
                    text: `${resultOfAPI}`,
                    tips: `Check if your inventory is full or if you have too many items.`
                }
            } else if (result.code === 201) {
                embed.setColor('Yellow')
                message = {
                    text: `${resultOfAPI}`,
                    tips: `> 1. Check that you are online in the game to apply this command.\n> 2. Double-check that the \`/player set\` command has been correctly set with your UID and server.`
                }
            } else if (result.code === 4) {
                embed.setColor('Yellow')
                message = {
                    text: `${resultOfAPI}`,
                    tips: `Check that the \`code\` has been entered correctly in the \`/player set\` command. You can set up your UID, server, and code again to fix this error.\n\nIf this error persists, please report it to the server administrator.`
                }
            } else if (result.code === -1) {
                embed.setColor('Red')
                message = {
                    text: `${resultOfAPI}`,
                    tips: `Looks like the command has been rejected or response failed.`
                }
            } else {
                embed.setColor('Random')
                message = {
                    text: resultOfAPI,
                }
            }
            embed.setDescription(message.text)
            if (message.tips) {
                embed.addFields([
                    { name: 'Tips', value: message.tips }
                ])
            }
            await interaction.editReply({
                embeds: [embed],
            })
        }
        else {
            if (result === null) {
                await interaction.editReply({
                    content: `Error: Something went wrong.\nResult: ${result}\nCommand: ${commandResult}\n\nThis error is from Takina itself and has been reported to the bot owner.`,
                    components: []
                });
                log({
                    interaction: `/gm apply_command`,
                    description: 'Error while executing `Apply the command`',
                    color: 'Red',
                    content: '<@506212044152897546>',
                    fields: [
                        { name: 'Error output', value: `${result}`, inline: false }
                    ]
                })
            } else {
                await interaction.editReply({
                    content: `Error: Failed send request command to <https://ps2.yuuki.me/command>\nResult: ${result}`,
                    components: []
                })
            }
            return
        }
    }
    catch (error) {
        console.log(error);
    }
};