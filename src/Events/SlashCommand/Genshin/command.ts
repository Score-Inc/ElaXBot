import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteractionOptionResolver, AutocompleteInteraction, ApplicationCommandOptionChoiceData, CommandInteraction, CacheType } from 'discord.js';
import fs from 'fs';
import readline from 'readline';
import { apiRequest } from '../../../Utils/api'
import MongoDB from '../../../Utils/db'
import { apply } from '../../../Utils/applyCommand';

async function getCommand(search: string, param: string, server: string) {
    try {
        const fileStream = fs.createReadStream('./src/data/command.txt');
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        const choices = [];
		let categoryName: string = ''
        for await (const line of rl) {
			if (line.startsWith("//") && line.replace("//", "").trim()) {
                categoryName = line.replace("//", "")?.trim();
				continue
            }
            const regex = RegExp(
                `${search.replace(/[[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`,
                'i',
            );
            const result = line.match(regex);
            if (result) {
				if (result === undefined || result === null) {
					continue;
				}
				if (categoryName.toLowerCase() !== server?.toLowerCase()) {
					continue;
				}
                if (param !== 'ac') {
                    if (result[0] !== result.input?.split(':')[0].trim()) {
                        continue;
                    }
                }
                choices.push({
                    name: result.input?.split(':')[0].trim(),
                    value: param === 'ac' ? result.input?.split(':')[0].trim() : result.input?.split(':')[1].trim()
                })
            }
        }
        return choices
    } catch (error) {
        console.error(error);
    }
}

export const data = new SlashCommandBuilder()
    .setName('command')
    .setDescription('Test command')
	.addStringOption((option) => option
		.setName('server')
		.setDescription('Type Server (GC|GIO)')
		.setRequired(true)
		.setAutocomplete(false)
		.addChoices(
			{
				name: 'GC',
				value: 'GC'
			},
			{
				name: 'GIO',
				value: 'GIO'
			}
		)
	)
    .addStringOption((option) => option
        .setName('string')
        .setDescription('String')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) => option
        .setName('id')
        .setDescription('Id of Avatars/Monsters/...')
        .setRequired(false)
        .setAutocomplete(true)
    )
	.addNumberOption((option) => option
		.setName('level')
		.setDescription('Level of Item, Weapon, or character')
		.setRequired(false)
		.setAutocomplete(true)
	)
	.addStringOption((option) => option
		.setName('custom_args')
		.setDescription('Set Custom Args such as x, lv, hp')
		.setRequired(false)
		.setAutocomplete(false)
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const serverType = interaction.options.getString('server') ?? 'gc';
    let string = interaction.options.getString('string') ?? '';
	const level = interaction.options.getNumber('level');
	const current = interaction.options.getFocused(true)
	console.log({current})
    const id = interaction.options.getString('id');
    if (current.name === 'string') {
		console.log('Called: String')
		const choices = await getCommand(string, 'ac', serverType);
        if (Array.isArray(choices)) {
			const choicesData = choices
				.slice(0, 25)
				.map(({ name, value }) => ({
					name: name as string,
					value: value as string
				})) as ApplicationCommandOptionChoiceData<string | number>[];
			await interaction.respond(choicesData);
        } else {
			await interaction.respond([{ name: 'No results found', value: 'No results' }]);
        }
    } else if (current.name === 'id') {
		console.log('Called: ID')
        try {
			let category = '';

			if (string.toLowerCase().includes('avatar') || string.toLowerCase().includes('character')) {
				category = 'Avatars';
			} else if (string.toLowerCase().includes('monster')) {
				category = 'Monsters';
			} else if (string.toLowerCase().includes('quest')) {
				category = "Quests"
			} else if (string.toLowerCase().includes('item')) {
				category = "Items"
			} else {
				await interaction.respond([{ name: 'Unknown', value: 'Unknown' }]);
				return;
			}
		
			const data = await apiRequest('gm-autocomplete', {
				search: id,
				category,
			});
		
			await interaction.respond(data.slice(0, 25));
        } catch (error) {
            console.error(error);
        }
    } else if (current.name === 'level') {
		console.log('Called: Level')
		try {
			let levelCurrent = []
			let number: number = 0;
			if (string.toLowerCase().includes('character') || string.toLowerCase().includes('avatars')) {
				if (level! > 90 ) {
					console.log('Passed number higher than 90')
					await interaction.respond([
						{ name: 'No level higher than ' + level, value: 0 }
					])
					return
				}
				if (level && level !== null) {
					number = level
				} else {
					number = 90
				}
			} else {
				await interaction.respond([
					{ name: 'There is no value here', value: 'No Value'}
				])
				return
			}
			console.log({number})
			console.log(number)
			if (number && level && number !== null) {
				await interaction.respond([
					{ name: `${number}`, value: `${number}`}
				])
				return
			}
			for (let i = 0; i < number; i++) {
				levelCurrent.push({
					name: `${i}`,
					value: `${i}`
				})
			}
			await interaction.respond(levelCurrent.slice(1, 26))
		} catch (error) {
			console.error(error)
		}
	}
}

export const command: string = '/command';
export const example: string = '/command id: Get Avatars';
export const permissions: string = 'everyone';

export async function execute(interaction: CommandInteraction) {
	const serverType = (interaction.options as CommandInteractionOptionResolver).getString('server') ?? 'gc'
    const string = (interaction.options as CommandInteractionOptionResolver).getString('string') ?? '';
    const id = (interaction.options as CommandInteractionOptionResolver).getString('id');
	const custom_args = (interaction.options as CommandInteractionOptionResolver).getString('custom_args') ?? '';
	const level = (interaction.options as CommandInteractionOptionResolver).getNumber('level') ?? 1;
    const command = await getCommand(string, 'find', serverType);
	let resultCommand: string = '';
    let idItem: string = '';
    
    if (id) {
		const { result } = await apiRequest('gm', {
			search: id,
		});
		idItem += result?.id;
    }
	if (command === undefined) {
		await interaction.reply({
			content: 'There is no result for command...'
		})
		return
	}
	resultCommand += `${command[0].value}`
    try {
		const Database = new MongoDB()
		const playerIsSet = await Database.findOne('setPlayer', {
			_id: interaction.user.id,
		});
		let buttonEnabled = false;
		if (playerIsSet !== null) {
			buttonEnabled = true;
		}
		const button = new ButtonBuilder()
			.setLabel('Apply Command')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('✅')
			.setCustomId('apply_command')
			.setDisabled(!buttonEnabled);
		const row = new ActionRowBuilder().addComponents(button).toJSON();
		if (custom_args.length > 0) {
			resultCommand += ` ${custom_args}`
		}
		const replyOption: object = {
			content: idItem.length > 0 ? resultCommand.replace('<id>', idItem).replace('<level>', `${level}`) : resultCommand.replace('<level>', `${level}`),
			components: [row]
		};
		await interaction.reply(replyOption);
		const filter = (i: any) => i.user.id === interaction.user.id;
		const collector = interaction.channel?.createMessageComponentCollector({
			filter,
			time: 60000,
		});
		collector?.on('collect', async (i) => {
			const applyTheCommand = await apply(playerIsSet?.uid, playerIsSet?.code, playerIsSet?.server, resultCommand);
			try {
				await i.deferReply();
				await i.editReply({
					content: `${applyTheCommand.msg}`,
					components: [],
				});
			} catch (error) {
		  		// do nothing
			}
		});
    } catch (error) {
		console.error(error);
    }
}