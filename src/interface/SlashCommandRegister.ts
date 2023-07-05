import { SlashCommandBuilder } from "discord.js";

export interface SlashCommandRegister {
    data: SlashCommandBuilder | object;
}