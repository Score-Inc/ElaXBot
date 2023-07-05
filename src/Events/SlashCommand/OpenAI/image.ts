import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js'
import { OpenAIApi, Configuration } from 'openai'
import { OPENAI } from '../../../../config.json'

export const data = new SlashCommandBuilder()
    .setName('image')
    .setDescription('Generate image')
    .addStringOption((option) => option
        .setName('imagine')
        .setDescription('Imagine you want to drew')
        .setRequired(true)
    )

const openai = new OpenAIApi(new Configuration({
    apiKey: OPENAI.API_KEY
}))

export async function execute(interaction: CommandInteraction) {
    const imagine = (interaction.options as CommandInteractionOptionResolver).getString('imagine')
    if (!imagine) {
        await interaction.reply({
            content: 'Please enter a prompt to generate image'
        });
        return
    }
    await interaction.deferReply()
    const result = await openai.createImage({
        prompt: imagine,
        n: 1,
        size: '512x512'
    })
    interaction.editReply({
        
    })
}