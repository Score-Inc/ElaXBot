import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import { apply } from '../../../Utils/applyCommand';
import MongoDB from '../../../Utils/db'

const database = new MongoDB()

export const data = new SlashCommandBuilder()
    .setName('player')
    .setDescription('Set player data')
    .addSubcommand((subcommand) => subcommand
        .setName('set')
        .setDescription('Set player data')
        .addStringOption((option) => option
            .setName('uid')
            .setDescription('Your UID')
            .setRequired(true)
        )
        .addStringOption((option => option
            .setName('server')
            .setRequired(true)
            .setDescription('Server (eu1-gc1/eu2-gc1/sg1-gc/id1-gc1)')
            .addChoices(
                {
                    name: 'Europe 1 (GC)',
                    value: 'eu1-gc1',
                },
                {
                    name: 'Europe 2 (GC)',
                    value: 'eu2-gc1',
                },
                {
                    name: 'Europe 2 (GIO)',
                    value: 'eu2-gio1',
                },
                {
                    name: 'Asia 1 (GC)',
                    value: 'sg1-gc1',
                },
                {
                    name: 'Japan 1 (GC)',
                    value: 'jp1-gc1'
                },
                {
                    name: 'Indonesia (GC HomePC)',
                    value: 'id1-gc1',
                }
            ))
        )
        .addStringOption((option) => option
            .setName('code')
            .setDescription('Your code (/remote on) | set as 1 if GIO')
            .setRequired(true)
        ),
    )
    .addSubcommand((subcomamnd) => subcomamnd
        .setName('remove')
        .setDescription('Remove player data')
    );

export const command: string = '/player <set|remove> uid: <uid> server: <server> code: <code>';
export const example: string = '/player set uid: 1234567890 server: eu2-gc1 code: 1234567890\n/player remove';
export const permissions: string = 'everyone';

export async function execute(interaction: CommandInteraction) {
    const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand()
    switch (subcommand) {
    case 'set':
        const uid = (interaction.options as CommandInteractionOptionResolver).getString('uid');
        const server = (interaction.options as CommandInteractionOptionResolver).getString('server');
        const code = (interaction.options as CommandInteractionOptionResolver).getString('code');
        if (!code) {
            await interaction.reply({
                content: 'Please enter your code, if you are on GIO server, you can enter random code.',
                ephemeral: true,
            });
            return
        }
        let description = '';
        try {
            const obj = {
                _id: interaction.user.id,
                uid: uid,
                server: server,
                code: code,
            };
            let hideCode;
            try {
                hideCode = code.charAt(0) + '*'.repeat(Math.max(code?.length - 2)) + code.substring(code.length - 1);
            } catch {
                hideCode = '****'
            }
            await interaction.deferReply({
                ephemeral: true,
            });
            let commandApply;
            if (server === 'eu2-gio1') {
                commandApply = 'item add 202 1';
            } else {
                commandApply = 'give 202 x1';
            }
            const result = await apply(uid, code, server, commandApply);
            if (result) {
                if (result.code === 200) {
                    await database.insertOne('setPlayer', obj)
                    await interaction.editReply({
                        content: `Success to send a Mora with amount 1 to your inventory as a test. Your player data has been set as:\n\`\`\`UID: ${uid}\nCode: ${hideCode}\nServer: ${server}\`\`\``,
                    });
                    description = 'Success to set player data';
                } else if (result.code === 201) {
                    await interaction.editReply({
                        content: `The player is not online, or you have entered the wrong UID, code, or server. Please verify that the information below is correct and try again:\n\n\`\`\`\nUID: ${uid}\nCode: ${hideCode}\nServer: ${server}\n\`\`\`\n\nIf any of the information is incorrect, please update it using the \`/player set\` command.`,
                    })
                    description = 'Error: The player is not online, or have entered the wrong UID, code, or server';
                } else if (result.code === 403) {
                    await database.insertOne('setPlayer', obj).then(() => {
                        console.log('Inserted document:', result);
                    });
                    await interaction.editReply({
                        content: `Error: ${result.msg}. But we have save your data to database with following data:\n\`\`\`UID: ${uid}\nCode: ${hideCode}\nServer: ${server}\`\`\``,
                    });
                    description = `Error: ${result.msg}, but player data has been set`;
                } else {
                    await interaction.editReply({
                        content: result.msg,
                    });
                    description = `Unknown error: ${result.msg}`;
                }
            } else {
                description = 'Error: something went wrong!';
                await interaction.editReply({
                    content: description,
                })
            }
            return
        } catch (error) {
            console.log(error);
            await interaction.editReply({
                content: `There was an error.\n${error}`
            });
        }
        break;
    case 'remove':
        await interaction.deferReply({
            ephemeral: true,
        });
        const check = await database.findOne('setPlayer', { _id: interaction.user.id });
        if (!check) {
            await interaction.editReply({
                content: 'Error: You don\'t have any player data saved to our database!'
            })
            return
        }
        const result = await database.deleteOne('setPlayer', { _id: interaction.user.id });
        if (result) {
            await interaction.editReply({
                content: 'Success to remove your player data\nData:\n\`\`\`' + JSON.stringify(check, null, 2) + '\`\`\`',
            });
        } else {
            await interaction.editReply({
                content: 'Error: something went wrong!',
            })
        }
    }
}