const fs = require('fs');
const path = require('path');
const playdl = require('play-dl');
const {
    createAudioPlayer,
    joinVoiceChannel,
    createAudioResource,
    NoSubscriberBehavior,
    AudioPlayerStatus,
} = require('@discordjs/voice');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { OWNER_ID } = require('../../../config.json');

// Load the queue from the JSON file
const queueFilePath = path.join(__dirname, '../../../queue.json');
let queue = {};
if (fs.existsSync(queueFilePath)) {
    const queueFileContent = fs.readFileSync(queueFilePath);
    queue = JSON.parse(queueFileContent);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('song')
        .setDescription('Plays a song in the voice channel you are in')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('play')
                .setDescription('Play a song')
                .addStringOption((option) =>
                    option.setName('link').setDescription('The link to the song').setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('stop').setDescription('Stops the music'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('pause').setDescription('Pauses the music'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('resume').setDescription('Resumes the music'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('queue_delete').setDescription('Deletes the queue'),
        ),
    command: '/song play|stop|pause|resume',
    example: '/song play link:https://www.youtube.com/watch?v=QH2-TGUlwu4',
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     * @retusn {Promise<void>}
     */
    async execute(interaction, { song } = {}) {
        // check if the user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({
                content: 'You are not in a voice channel!',
            });
        }

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: 'This command is currently under development!',
            });
        }

        try {
            // check if the bot already deferred the reply
            if (!interaction.deferred) {
                await interaction.deferReply();
            }
            const connection = await joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                },
            });

            const handleSongEnd = async () => {
                await interaction.followUp({
                    content: 'Song ended',
                });

                // If there are no more songs in the queue, destroy the connection
                if (queue[interaction.member.voice.channel.id]?.length === 0) {
                    connection.destroy();
                    delete queue[interaction.member.voice.channel.id];
                    fs.writeFileSync(queueFilePath, JSON.stringify(queue));
                } else {
                    // Otherwise, remove the current song from the queue and play the next one
                    queue[interaction.member.voice.channel.id].shift();
                    fs.writeFileSync(queueFilePath, JSON.stringify(queue));
                    const nextLink = queue[interaction.member.voice.channel.id][0];
                    if (!nextLink) {
                        // delete the file queue
                        fs.unlinkSync(queueFilePath);
                        return;
                    }
                    const stream = await playdl.stream(nextLink, {
                        discordPlayerCompatibility: true,
                        quality: 5,
                        precache: true,
                        seek: 0,
                        highWaterMark: 1 << 25,
                        htmldata: false,
                        language: 'en',
                    });
                    const videoDetails = await playdl.video_info(nextLink);
                    const { title, channel, thumbnails, durationRaw } = videoDetails.video_details;
                    const resource = createAudioResource(stream.stream, {
                        inputType: stream.type,
                        inlineVolume: true,
                        metadata: {
                            title: title,
                            url: nextLink,
                            duration: durationRaw,
                            thumbnail: thumbnails[0].url,
                            channel: channel.name,
                        },
                    });
                    player.play(resource);
                }
            };

            let link = song || interaction.options.getString('link');
            if (!link) {
                // get the song link from queue.json file channel id
                link = queue[interaction.member.voice.channel.id]?.[0];
                if (!link) {
                    return interaction.followUp({
                        content: 'There is no song in the queue',
                    });
                }
            }

            const stream = await playdl.stream(link, {
                discordPlayerCompatibility: true,
                quality: 5,
                precache: true,
                seek: 0,
                highWaterMark: 1 << 25,
                htmldata: false,
                language: 'en',
            });

            const videoDetails = await playdl.video_info(link);
            const { type, title, channel, thumbnails, durationRaw } = videoDetails.video_details;

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true,
                metadata: {
                    title: title,
                    url: link,
                    duration: durationRaw,
                    thumbnail: thumbnails[0].url,
                    channel: channel.name,
                },
            });

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setURL(link)
                .setImage(thumbnails[0].url)
                .addFields({
                    name: 'Type',
                    value: type === 'video' ? 'Video' : 'Playlist' || 'Unknown',
                })
                .addFields({
                    name: 'Duration',
                    value: `${durationRaw || 'Unknown'}`,
                })
                .addFields({
                    name: 'Channel',
                    value: `${channel.name || 'Unknown'}`,
                })
                .addFields({
                    name: 'Ping',
                    value: `${connection.ping.udp || connection.ping.ws ?
                        `${connection.ping.udp || connection.ping.ws}ms` :
                        'Unknown'}`,
                })
                .setTimestamp()
                .setColor('Random');
            player.on(AudioPlayerStatus.Idle, handleSongEnd);

            player.on(AudioPlayerStatus.Playing, async () => {
                await interaction.editReply({
                    content: 'Playing...',
                    embeds: [embed],
                });
            });

            player.on(AudioPlayerStatus.Buffering, async () => {
                await interaction.followUp({
                    content: 'Buffering...',
                });
            });

            player.on(AudioPlayerStatus.Paused, async () => {
                await interaction.followUp({
                    content: 'Paused',
                });
            });

            player.on('error', (error) => {
                console.error(error);
                interaction.followUp({
                    content:
                        'An error occurred while playing the song.\n' + error.message,
                });
                connection.destroy();
                // clear the queue when an error occurs
                delete queue[interaction.member.voice.channel.id];
                fs.writeFileSync(queueFilePath, JSON.stringify(queue));
            });

            connection.on('error', (error) => {
                console.error(error);
                interaction.followUp({
                    content:
                        'An error occurred while playing the song.\n' + error.message,
                });
                connection.destroy();
                // clear the queue when an error occurs
                delete queue[interaction.member.voice.channel.id];
                fs.writeFileSync(queueFilePath, JSON.stringify(queue));
            });

            // check which subcommand was used
            switch (interaction.options.getSubcommand()) {
            case 'play':
                try {
                    // If there is already a queue for the channel, add the song to the queue
                    if (queue[interaction.member.voice.channel.id]) {
                        // check if the player is already playing, if not, add the song to the queue
                        if (player.state.status !== AudioPlayerStatus.Playing) {
                            queue[interaction.member.voice.channel.id].push(link.trim());
                            fs.writeFileSync(queueFilePath, JSON.stringify(queue));
                            return interaction.editReply({
                                content: 'Added the song to the queue!',
                            });
                        } else if (player.state.status === AudioPlayerStatus.Playing) {
                            return interaction.editReply({
                                content: 'The player is already playing!',
                            });
                        }
                    }

                    connection.subscribe(player);
                    player.play(resource);

                    // If there is no queue for the channel, create one and save it to a .json file
                    queue[interaction.member.voice.channel.id] = [link.trim()];
                    fs.writeFileSync(queueFilePath, JSON.stringify(queue));

                    return interaction.editReply({
                        content: 'Playing the song!',
                    });
                } catch (error) {
                    console.error(error);
                    interaction.followUp({
                        content: 'An error occurred while playing the song.',
                    });
                }
                break;
            case 'stop':
                try {
                    connection.destroy();
                    // clear the queue when stopping the music
                    delete queue[interaction.member.voice.channel.id];
                    fs.writeFileSync(queueFilePath, JSON.stringify(queue));
                    return interaction.editReply({
                        content: 'Stopped the music!',
                    });
                } catch (error) {
                    console.error(error);
                    return interaction.followUp({
                        content: 'An error occurred while stopping the music.',
                    });
                }
                break;
            case 'pause':
                try {
                    player.pause();
                    return interaction.editReply({
                        content: 'Paused the music!',
                    });
                } catch (error) {
                    console.error(error);
                    return interaction.followUp({
                        content: 'An error occurred while pausing the music.',
                    });
                }
                break;
            case 'resume':
                try {
                    player.unpause();
                    // check if success for
                    if (player.state.status === AudioPlayerStatus.Playing) {
                        return interaction.editReply({
                            content: 'Resumed the music!',
                        });
                    } else if (player.state.status === AudioPlayerStatus.Paused) {
                        return interaction.editReply({
                            content: 'Failed to resume the music!',
                        });
                    } else {
                        return interaction.editReply({
                            content: 'No music to resume!',
                        });
                    }
                } catch (error) {
                    console.error(error);
                    return interaction.followUp({
                        content: 'An error occurred while resuming the music.',
                    });
                }
                break;
            case 'queue_delete':
                try {
                    // clear the queue when deleting the queue
                    delete queue[interaction.member.voice.channel.id];
                    fs.writeFileSync(queueFilePath, JSON.stringify(queue));
                    return interaction.editReply({
                        content: 'Deleted the queue!',
                    });
                } catch (error) {
                    console.error(error);
                    return interaction.followUp({
                        content: 'An error occurred while deleting the queue.',
                    });
                }
                break;
            default:
                // Handle invalid subcommand
                return interaction.followUp({
                    content: 'Invalid subcommand provided!',
                });
            }
        } catch (error) {
            console.error(error);
            return interaction.followUp({
                content: 'An error occurred while playing the song.',
            });
        }
    },
};

module.exports.queue = queue;
