import fs from 'fs';
import { Client, Partials, GatewayIntentBits, Collection, Events, ActivityType, ActivityOptions, PresenceStatusData, CommandInteractionOptionResolver, CommandInteraction, TextChannel, EmbedBuilder, GuildMember, ThreadChannel, DiscordAPIError, Message } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { TOKEN, RPC, OWNER_ID, Prefix } from '../config.json';
import readline from 'readline';
import path from 'path';
import { log } from './log/log'
import MongoDB from './Utils/db';
import { logger } from './Utils/logger';
import { MessageCreateInformation } from './interface/MessageCreate';

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection: ', error);
    if (error instanceof DiscordAPIError) {
        console.error(JSON.stringify(error.requestBody.json, null, 2))
    }
    // process.exit(1);
});

const database = new MongoDB()

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
];

const partials = [
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.Channel,
    Partials.GuildScheduledEvent,
];

interface CustomClient extends Client {
    commands: Collection<string, any>
}

export const client = new Client({
    intents,
    partials,
    allowedMentions: {
        parse: [],
        repliedUser: true,
    }
}) as CustomClient

client.commands = new Collection()
const commandFolders = fs.readdirSync('./src/Events/SlashCommand');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./src/Events/SlashCommand/${folder}`).filter((file) => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const command = require(`./Events/SlashCommand/${folder}/${file}`);
        client.commands.set(command.data?.name, command);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

client.on(Events.ClientReady, async () => {
    client.guilds.cache.forEach((guild) => {
        console.log(`Guild name: ${guild.name} (${guild.id}) | Total members: ${guild.memberCount}`);
    })
    console.log(`Total bot joined to server: ${client.guilds.cache.size}`);

    const guild = client.guilds.cache.get('964119462188040202');
    if (guild?.commands) {
        await guild?.commands.set([]);
    }

    database.dropCollection('OpenAIChatCache')

    console.log(`Logged in as ${client.user ? client.user.tag : 'We can\'t get bot name!'}`);

    const { Type: activiyTypeString, Details, Status} = RPC;
    const activityTypeMap: { [key: string]: ActivityType} = { 
        playing: ActivityType.Playing,
        listening: ActivityType.Listening,
        watching: ActivityType.Watching,
        streaming: ActivityType.Streaming,
        competing: ActivityType.Competing,
    };

    const activityType = activityTypeMap[activiyTypeString.toLowerCase()] || ActivityType.Playing;
    setInterval(() => {
        const name = Details[Math.floor(Math.random() * Details.length)];
        client.user?.setActivity({
            name: name.replace(/%d/g, client.user.username),
            type: activityType,
        } as ActivityOptions)
    }, 15000);
    client.user?.setStatus(Status as PresenceStatusData);

    rl.on('line', async (input) => {
        const [commandName, ...args] = input.trim().split(' ');
        if (commandName === '') {
            rl.prompt();
            return
        }
        if (commandName === 'exit' || commandName === 'bye' || commandName === 'stop') {
            process.exit(0);
        }

        let commandFilePath = null;
        const commandFoldersConsole = fs.readdirSync(path.join(__dirname, 'console'));
        for (const folder of commandFoldersConsole) {
            const commandFiles = fs.readdirSync(path.join(__dirname, 'console', folder));
            for (const file of commandFiles) {
                if (!file.endsWith('.ts')) {
                    continue;
                };
                const command = require(path.join(__dirname, 'console', folder, file));
                if (command.name === commandName) {
                    commandFilePath = path.join(__dirname, 'console', folder, file);
                    break;
                }
            }
        }

        if (commandFilePath !== null) {
            try {
                const command = require(commandFilePath);
                await command.execute(args, client).then((output: any) => {
                    console.log(output);
                    rl.prompt()
                });
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error while executing command: ${error.message}`)
                } else {
                    console.error(`Error while executing command: ${error}`);
                }
            }
        } else {
            console.log(`No commands are available for '${commandName}'`);
            rl.prompt();
        }

        rl.prompt();
    })
});

async function isUserBlocked(user: string, command: string) {
    const result = await database.findOne('blockedUser', { _id: user });
    return result ? result.commands.includes(command) ? true : false : false;
}

function hasPermissionToExecuteCommand(command: { permissions: string, roles: string[] }, user: string) {
    switch (command.permissions) {
    case 'owner':
        return OWNER_ID.includes(user);
    case 'certain':
        // TODO: add certain permissions
        return false;
    case 'everyone':
        return true;
    default:
        return true;
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return
        }
        try {
            await command.autocomplete(interaction);
            const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand(false);
            const commandString = `/${interaction.commandName}${subcommand ? ` ${subcommand}` : ''}`
            log({
                interaction: commandString,
                description: 'Autocomplete was executed',
                color: 'Green',
                thumbnail: interaction.user.displayAvatarURL(),
                fields: [
                    { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                    { name: 'Channel', value: `${(interaction.channel as TextChannel).name} (${interaction.channel?.id})`, inline: false },
                    { name: 'Guild', value: `${interaction.guild?.name} (${interaction.guild?.id})`, inline: false },
                ]
            })
        } catch (error) {
            logger.error(error);
            await interaction.respond([
                { name: 'There was an error while executing autocomplete', value: 'Error' }
            ])
            log({
                interaction: `/${interaction.commandName}`,
                description: 'Autocomplete was executed',
                color: 'Red',
                thumbnail: interaction.user.displayAvatarURL(),
                fields: [
                    { name: 'Error output', value: `${error}`, inline: false },
                    { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                    { name: 'Channel', value: `${(interaction.channel as TextChannel).name} (${interaction.channel?.id})`, inline: false },
                    { name: 'Guild', value: `${interaction.guild?.name} (${interaction.guild?.id})`, inline: false },
                ]
            })
        }
    } else if (interaction.isCommand()) {
        if (!interaction.guild) {
            await interaction.reply({
                content: 'This command can only be used in a Server or Guild!',
            })
            return
        }

        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
            return
        }

        const command = client.commands.get(interaction.commandName)
        if (!command) {
            return;
        }

        if (!hasPermissionToExecuteCommand(command, interaction.user.id)) {
            await interaction.reply({
                content: 'You do not have permission to use this command',
                ephemeral: true
            });
            return
        }

        if (await isUserBlocked(interaction.user.id, interaction.commandName)) {
            await interaction.reply({
                content: `You have been blocked from using command '/${interaction.commandName}'`
            });
            return
        }

        try {
            await command.execute(interaction);
            const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand(false);
            const commandString = `/${interaction.commandName}${subcommand ? ` ${subcommand}` : ''}`
            log({
                interaction: commandString,
                description: 'Slash command was executed!',
                color: 'Green',
                thumbnail: interaction.user.displayAvatarURL(),
                fields: [
                    { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                    { name: 'Channel', value: `${(interaction.channel as TextChannel).name} (${interaction.channel?.id})`, inline: false },
                    { name: 'Guild', value: `${interaction.guild.name} (${interaction.guild.id})`, inline: false },
                ]
            })
        } catch (error) {
            const content = `There was an error while executing this command!\n\nIf this error persists, please contact the bot owner.\n\nError: ${error}`;
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({
                    content,
                });
            }
            else {
                await interaction.reply({
                    content,
                    ephemeral: true,
                });
            }
            console.error(error);
            log({
                interaction: `/${interaction.commandName}`,
                color: 'Red',
                description: 'Error while executing command',
                content: `<@${OWNER_ID}>`,
                thumbnail: interaction.user.displayAvatarURL(),
                fields: [
                    { name: 'Error output', value: `${error}`, inline: false },
                    { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                    { name: 'Channel', value: `${(interaction.channel as TextChannel).name} (${interaction.channel?.id})`, inline: false },
                    { name: 'Guild', value: `${interaction.guild.name} (${interaction.guild.id})`, inline: false },
                ],
            });
        }
    } else if (interaction.isModalSubmit()) {
        const modalFolder = fs.readdirSync('./src/Events/Modal');
        for (const folder of modalFolder) {
            const modal = fs.readdirSync(`./src/Events/Modal/${folder}`).filter((file) => file.endsWith('.ts'));
            for (const file of modal) {
                const modalCommand = require(`./Events/Modal/${folder}/${file}`);
                if (interaction.customId === modalCommand.name) {
                    await modalCommand.execute(interaction);
                }
            }
        }
    }
})

interface FilesExecuteFunction {
    command: MessageCreateInformation;
    execute: (message: Message) => Promise<void>;
}

client.on(Events.MessageCreate, async (message) => {
    if (!message.member?.guild.members.me?.permissions.has(PermissionsBitField.Flags.SendMessages)) {
        return;
    }

    const messageCreateFiles = fs.readdirSync('./src/Events/MessageCreate')
        .filter((file) => file.endsWith('.ts'));
    for (const file of messageCreateFiles) {
        const code: FilesExecuteFunction = require(`./Events/MessageCreate/${file}`);

        if (!code) {
            return;
        }

        try {
            const checkCommand: MessageCreateInformation = code.command;
            if (checkCommand.isCommand === true) {
                if (!message.content.startsWith(Prefix + checkCommand.name)) {
                    continue
                }
            }
            if (checkCommand.permissions === 'owner') {
                if (!OWNER_ID.includes(message.author.id)) {
                    if (checkCommand.isCommand === true) {
                        await message.reply({
                            content: 'You do not have permission to use this command!'
                        });
                    }
                    continue;
                }
            }
            if (checkCommand.enable === false) {
                if (checkCommand.isCommand === true) {
                    await message.reply({
                        content: `This command currently disabled!\n\nReason: ${checkCommand.reason || 'No reason provided'}`
                    });
                }
                continue;
            }
            await code.execute(message);
        } catch (error) {
            if (error instanceof Error) {
                logger.error(error.stack);
            } else {
                logger.error(error);
            }
            // log error to webhook
            log({
                interaction: `${code.command.name}`,
                color: 'Red',
                description: 'Error while executing command',
                fields: [
                    { name: 'Error output', value: `${error}`, inline: false },
                    { name: 'User', value: `${message.author.tag} (${message.author.id})`,inline: false },
                    { name: 'Channel', value: `<#${message.channel.id}> (${message.channel.id})`, inline: false },
                    { name: 'Guild', value: `${message.guild?.name} (${message.guild?.id})`, inline: false }
                ],
            });
        }
    }
})

// create a Set to store message IDs that have already been sent to the starboard channel
let starboardedMessages = new Set();

// load the Set from a file if it exists
if (fs.existsSync('starboarded-messages.json')) {
    const data = fs.readFileSync('starboarded-messages.json', 'utf-8');
    starboardedMessages = new Set(JSON.parse(data));
}

client.on(Events.MessageReactionAdd, async (reaction) => {
    // get the message that has been reaction with emoji star (⭐) 3 times, then send it to starboard channel with id 1016712994299838516
    if (reaction.emoji.name === '⭐' && reaction.count! >= 3) {
        const channel = reaction.message.guild?.channels.cache.get('1016712994299838516'); // replace with your starboard channel ID
        if (!channel) {
            return;
        }

        if (reaction.message.channel.id === channel.id) {
            return;
        }

        if (starboardedMessages.has(reaction.message.id)) {
            return;
        }
        // send message to starboard with embed and normal message
        const embed = new EmbedBuilder();
        embed.setColor('Random');
        embed.setAuthor({
            name: reaction.message.author?.tag || 'No username',
            iconURL: reaction.message.author?.displayAvatarURL(),
        });
        embed.setDescription(`${reaction.message.content?.slice(0, 1000) || '[NO MESSAGE]'}\n\n[Jump to message](https://discord.com/channels/${reaction.message.guild?.id}/${reaction.message.channel.id}/${reaction.message.id})`);
        const image = reaction.message.attachments.map((a) => a.url)[0];
        if (image) {
            embed.setImage(image);
        }
        embed.setTimestamp(new Date());
        if (!(channel instanceof GuildMember)) {
            return
        }
        const starBoardMessage = await channel.send({
            content: `⭐ **${reaction.count}** | <#${reaction.message.channel.id}>`,
            embeds: [embed],
        });

        // add the message ID to the Set so it won't be sent to the starboard channel again
        starboardedMessages.add(reaction.message.id);

        const starboardedObject = await (channel as TextChannel).messages.fetch(starBoardMessage.id);
        await starboardedObject.react('⭐');

        const data = JSON.stringify(Array.from(starboardedMessages));
        fs.writeFileSync('starboarded-messages.json', data);
    }
});

const GUILD_ID = '964119462188040202';
const SOLVED_TAG_ID = '1048877201296207882';

client.on('threadUpdate', async (_oldThread, newThread) => {
    if (newThread.guildId !== GUILD_ID) return;

    if (newThread.archived) {
        if (!newThread.ownerId) return;
        const user = await client.users.fetch(newThread.ownerId);
        try {
            const title = 'Thread Closed';
            const fields = [
                { name: 'Thread Name', value: newThread.name },
                { name: 'Link to Thread', value: `[Click Here](${newThread.url})` },
                { name: 'Is Locked', value: newThread.locked ? 'Yes' : 'No' },
                {
                    name: 'Description',
                    value: newThread.appliedTags.includes(SOLVED_TAG_ID) ?
                        'Your thread closed as the problem has been solved.' :
                        'Your thread has been closed, but the problem is not solved.',
                },
            ];

            const embed = new EmbedBuilder()
                .setTitle(title)
                .addFields(fields)
                .setColor(newThread.appliedTags.includes(SOLVED_TAG_ID) ? 'Green' : 'Red')
                .setTimestamp();

            await user.send({ embeds: [embed] });
            log({
                interaction: 'Thread Closed',
                color: 'Green',
                description: 'Closed thread and sent message to user',
                thumbnail: newThread.client.user.displayAvatarURL(),
                fields: [
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
                    { name: 'Thread', value: `${newThread.name} (${newThread.id})`, inline: false },
                    { name: 'Guild', value: `${newThread.guild?.name} (${newThread.guild?.id})`, inline: false },
                ],
            });
        }
        catch (error) {
            log({
                interaction: 'Thread Closed',
                color: 'Red',
                description: 'Closed thread but couldn\'t send message to user',
                thumbnail: newThread.client.user.displayAvatarURL(),
                fields: [
                    { name: 'Error output', value: `${error}`, inline: false },
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
                    { name: 'Thread', value: `${newThread.name} (${newThread.id})`, inline: false },
                    { name: 'Guild', value: `${newThread.guild?.name} (${newThread.guild?.id})`, inline: false },
                ],
            });
        }
    }
});

client.on('error', (error) => {
    console.error(error.stack)
})

async function main() {
    await client.login(TOKEN);
}

main()
