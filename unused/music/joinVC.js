module.exports = {
    data: {
        name: 'joinvc',
        description: 'Joins the voice channel you are in',
        options: [],
    },
    commad: '/joinvc',
    example: '/joinvc',
    /**
     * @param {import("discord.js").CommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const { joinVoiceChannel } = require('@discordjs/voice');

        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        if (connection) {
            interaction.reply({
                content: 'Joined voice channel!',
                ephemeral: true,
            });
        } else {
            interaction.reply({
                content: 'Failed to join voice channel!',
                ephemeral: true,
            });
        }
    },
};
