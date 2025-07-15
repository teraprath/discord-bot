const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { rulesChannelId } = require('../../config.json');

const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updaterules')
    .setDescription('Aktualisiere die Regeln.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    try {

      const rulesPath = path.join(__dirname, '../../data', 'rules.txt');
      const rulesText = fs.readFileSync(rulesPath, 'utf8');

      const channel = await interaction.client.channels.fetch(rulesChannelId);
      const fetchedMessages = await channel.messages.fetch({ limit: 1 });
      const existingMessage = fetchedMessages.find(msg => msg.author.id === interaction.client.user.id);

      if (existingMessage) {
        await existingMessage.edit(rulesText);
        await interaction.reply({ content: '✏️ Regelnachricht wurde aktualisiert.', flags: 1 << 6 });
      } else {
        const sentMessage = await channel.send(rulesText);
        await interaction.reply({ content: '📜 Regelnachricht wurde erfolgreich gesendet.', flags: 1 << 6 });
      }

    } catch (error) {
      console.error('Fehler beim Senden/Aktualisieren der Regeln:', error);
      await interaction.reply({ content: '❌ Fehler beim Senden/Aktualisieren der Regelnachricht.', flags: 1 << 6 });
    }
  },
}
