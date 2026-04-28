const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Zeige Statistiken von Benutzern an.'),
  async execute(interaction) {

    const user = await User.findOne({ where: { username: interaction.user.tag } });

    const statsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Statistiken')
        .setDescription(`Hier sind die aktuellen Statistiken von **${interaction.user.displayName}**!`)
        .addFields(
            { name: 'Benutzer', value: `👤 ${interaction.user.username}`, inline: true },
            { name: 'Coins', value: `💰 ${user.coins}`, inline: true },
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()

    // Sende das Embed anstelle des normalen Replies
    await interaction.reply({ embeds: [statsEmbed] });

  },
}
