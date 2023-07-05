import { AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver } from "discord.js";

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { Anime } from '../../../../config.json';

const list = [
    'alarm', 'amazing', 'ask', 'baka', 'bite',
    'blush', 'blyat', 'boop', 'clap', 'coffee',
    'confused', 'cry', 'cuddle', 'cute', 'dance',
    'destroy', 'die', 'disappear', 'dodge', 'error',
    'facedesk', 'facepalm', 'fbi', 'fight', 'happy',
    'hide', 'highfive', 'hug', 'kill', 'kiss',
    'laugh', 'lick', 'lonely', 'love', 'mad',
    'money', 'nom', 'nosebleed', 'ok', 'party',
    'pat', 'peek', 'poke', 'pout', 'protect',
    'puke', 'punch', 'purr', 'pusheen', 'run',
    'salute', 'scared', 'scream', 'shame', 'shocked',
    'shoot', 'shrug', 'sip', 'sit', 'slap',
    'sleepy', 'smile', 'smoke', 'smug', 'spin',
    'stare', 'stomp', 'tickle', 'trap', 'triggered',
    'uwu', 'wasted', 'wave', 'wiggle', 'wink',
    'yeet',
];

export const data = new SlashCommandBuilder()
    .setName('anime')
    .setDescription('Get a random anime gif')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('gif')
            .setDescription('Get a random anime gif')
            .addStringOption((option) =>
                option
                    .setName('tag')
                    .setDescription('Tag for a gif')
                    .setAutocomplete(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('image')
            .setDescription('Get a random anime image')
            .addStringOption((option) =>
                option
                    .setName('tag_include')
                    .setDescription('Include tag for an image'),
            )
            .addStringOption((option) =>
                option
                    .setName('tag_exclude')
                    .setDescription('Exclude tag for an image'),
            ),
    );
export const command: string = '/anime gif/image [tag_include] [tag_exclude]';
export const example: string = '/anime gif tag: cute\n/anime image tag_include: waifu, raiden-shogun';
export const permission: string = 'everyone';
export async function autocomplete(interaction: AutocompleteInteraction) {
    try {
        const result: { name: string; value: string; }[] = [];
        const search = interaction.options.getFocused();
        // get the list of options and push them to the result
        list.filter((item) => item.toLowerCase().includes(search.toLowerCase())).forEach((item) => {
            result.push({
                name: item,
                value: item,
            });
        });
        // respond with the result
        if (search.length < 1) return interaction.respond(result.slice(0, 25));
        await interaction.respond(result.slice(0, 25));
    } catch {
        // annoying error
    }
};


export async function execute(interaction: CommandInteraction) {
    switch ((interaction.options as CommandInteractionOptionResolver).getSubcommand()) {
    case 'gif':
        let tag = (interaction.options as CommandInteractionOptionResolver).getString('tag');
        if (!tag) {
            // if no search is provided, return a random gif
            tag = list[Math.floor(Math.random() * list.length)];
        }
        const result = await axios.get(`https://kawaii.red/api/gif/${tag}/token=${Anime.API}`);
        const gif = result.data;
        if (!gif.response) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Anime GIF')
                        .setDescription('No gif found')
                        .addFields({
                            name: 'Tag',
                            value: tag,
                        })
                        .addFields({
                            name: 'Try one of these',
                            value: list.map((item) => `\`${item}\``).join(', '),
                        })
                        .setColor('Red'),
                ],
            });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('Anime GIF')
            .setDescription(`Tag: \`${tag}\``)
            .setImage(gif.response)
            .setColor('Green');
        await interaction.reply({ embeds: [embed] });
        break;
    case 'image':
        let include = (interaction.options as CommandInteractionOptionResolver).getString('tag_include');
        let exclude = (interaction.options as CommandInteractionOptionResolver).getString('tag_exclude');
        // if user includes tags, convert them to the API parameter format
        if (include) {
            include = include.replace(/\s+/g, '').split(',').map((tag: string | number | boolean) => `&included_tags=${encodeURIComponent(tag)}`).join('');
        } else {
            include = '';
        }

        if (exclude) {
            exclude = exclude.replace(/\s+/g, '').split(',').map((tag: string | number | boolean) => `&excluded_tags=${encodeURIComponent(tag)}`).join('');
        } else {
            exclude = '';
        }

        const url = 'https://api.waifu.im/search';
        const imageResult = await axios.get(`${url}?gif=false&${include}${exclude}`);
        const image = imageResult.data;
        const imageEmbed = new EmbedBuilder()
            .setTitle('Anime Image')
            .addFields({
                name: 'Include Tag',
                value: include ? include.split('&').map((item: string) => `\`${item.split('=')[1]}\``).join(', ') : 'None',
                inline: true,
            })
            .addFields({
                name: 'Exclude Tag',
                value: exclude ? exclude.split('&').map((item: string) => `\`${item.split('=')[1]}\``).join(', ') : 'None',
                inline: true,
            })
            .setColor('Green');
        if (image) {
            imageEmbed.setImage(image.images[0].url);
        }
        await interaction.reply({ embeds: [imageEmbed] });
    }
};