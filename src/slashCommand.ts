import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10'
import { CLIENT_ID, TOKEN } from '../config.json';
import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommandRegister } from './interface/SlashCommandRegister'

const commands: any[] = [];

const commandFolders = fs.readdirSync('./src/Events/SlashCommand');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./src/Events/SlashCommand/${folder}`).filter((file) => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const command: SlashCommandRegister = require(`./Events/SlashCommand/${folder}/${file}`);
        if (command.data === undefined) {
            continue;
        }

        if (command.data instanceof SlashCommandBuilder) {
            commands.push(command.data.toJSON())
        } else {
            commands.push(command.data);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`)

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully registered ${commands.length} slash command(s) globally.`)
        console.log(`Use ${'https://discord.com/api/oauth2/authorize?client_id=' + CLIENT_ID + '&permissions=8&scope=bot'} to get started.`)
        process.exit(0);
    } catch (error) {
        console.error(error);
    }
})();