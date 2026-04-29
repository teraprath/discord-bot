const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Zeige Statistiken von Benutzern an.'),
  async execute(interaction) {

    const user = await User.findOne({ where: { id: interaction.user.id } });

    const level = user.level ?? 0;
    const xp = user.xp ?? 0;

    const xpNeeded = Math.floor(
      80 +
      (level * 35) +
      Math.pow(level, 1.6) * 12
    );

    let progressBar = '██████████';
    let progressText = 'Max';

    if (level < 100) {
      const percent = Math.max(0, Math.min(1, xp / xpNeeded));
      const filled = Math.round(percent * 10);
      const empty = 10 - filled;

      progressBar = '█'.repeat(filled) + '▒'.repeat(empty);
      progressText = `${xp} / ${xpNeeded} XP`;
    }

    const statsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Statistiken')
        .setDescription(`Hier sind die aktuellen Statistiken von **${interaction.user.displayName}**!`)
        .addFields(
            { name: 'Benutzer', value: `👤 ${interaction.user.username}`, inline: true },
            { name: 'Coins', value: `💰 ${user.coins}`, inline: true },
            { name: 'Fortschritt', value: `🏆 Level **${level}** ${progressBar} ${progressText}`, inline: false },
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()

    // Sende das Embed anstelle des normalen Replies
    await interaction.reply({ embeds: [statsEmbed] });

  },
}
