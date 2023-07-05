module.exports = {
    /**
     *
     * @param {import("discord.js").Message} message
     */
    async execute(message) {
        if (message.guild.id !== '964119462188040202') return;
        const fruitEmojis = {
            'alpukat': '🥑',
            'anggur': '🍇',
            'apel': '🍎',
            'avokad': '🥑',
            'belimbing': '🌟',
            'bluberi': '🫐',
            'buah naga': '🐉',
            'ceri': '🍒',
            'durian': '🥟',
            'jambu biji': '🍈',
            'jeruk nipis': '🍋',
            'kiwi': '🥝',
            'kelapa': '🥥',
            'lemon': '🍋',
            'leci': '🧑‍🚀',
            'manggis': '🍈',
            'markisa': '🌺',
            'melon': '🍈',
            'nanas': '🍍',
            'nangka': '🎣',
            'pepaya': '🥭',
            'pir': '🍐',
            'pisang': '🍌',
            'rambutan': '🦝',
            'salak': '🐒',
            'semangka': '🍉',
            'sirsak': '🐿️',
            'stroberi': '🍓',
            'terong': '🍆',
            'timun suri': '🥒',
        };

        const fruitNames = Object.keys(fruitEmojis);
        const messageUser = message.content?.toLowerCase();

        if (fruitNames.includes(messageUser)) {
            message.react(fruitEmojis[messageUser]);
        }
    },
};
