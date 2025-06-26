const { Events } = require('discord.js');
const { rolesChannelId } = require('../config.json');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {

    console.log(`✅ Bot gestartet als ${client.user.tag}`);

    try {
      const channel = await client.channels.fetch(rolesChannelId);
      if (!channel || !channel.isTextBased()) {
        console.warn('❌ Rollen-Channel ist ungültig oder kein Textkanal.');
        return;
      }

      // Alle Nachrichten (z. B. bis 100) abrufen, um Cache zu füllen
      const messages = await channel.messages.fetch({ limit: 100 });
      console.log(`📥 ${messages.size} Nachrichten im Rollen-Channel wurden gecacht.`);

    } catch (error) {
      console.error('❌ Fehler beim Vorladen der Rollen-Nachrichten:', error.message);
    }
  }
}
