const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Zeige Server-Informationen an.'),
  execute(interaction) {
    const guild = interaction.guild;
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(guild.name)
      .setDescription(`${guild.description}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Mitglieder', value: `${guild.memberCount}`, inline: true },
        { name: 'Kanäle', value: `${guild.channels}`, inline: true },
      )
    interaction.reply({ embeds: [exampleEmbed], flags: 1 << 6 },);
  },
}
