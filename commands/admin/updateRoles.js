const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { rolesChannelId } = require('../../config.json');

const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updateroles')
    .setDescription('Aktualisiere die Rollen.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: 1 << 6 });

      const rolesPath = path.join(__dirname, '../../data/roles.json');
      const rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));

      const rolesChannel = await interaction.guild.channels.fetch(rolesChannelId);
      if (!rolesChannel || !rolesChannel.isTextBased()) {
        return interaction.editReply({ content: 'Rollen-Channel nicht gefunden oder ungültig.' });
      }

      const existingMessages = await rolesChannel.messages.fetch({ limit: 100 });

      // --- Einleitungsnachricht prüfen oder senden
      const introText = `# 🎭 Rollen\n\nTrifft etwas auf dich zu? Dann kannst du mit dem entsprechenden Emoji reagieren, um dir selbst die passende Rolle zu geben.`;
      const introMessage = existingMessages.find(msg =>
        msg.author.id === interaction.client.user.id &&
        msg.content.startsWith('# 🎭 Rollen')
      );
      if (!introMessage) {
        await rolesChannel.send(introText);
        console.log('Einleitungsnachricht gesendet.');
      }

      // --- Existierende Kategorie-Nachrichten identifizieren
      const validCategories = Object.keys(rolesData);
      const categoryMessages = existingMessages.filter(msg =>
        msg.author.id === interaction.client.user.id &&
        msg.content.startsWith('> ### ')
      );

      // --- Entfernte Kategorien löschen
      for (const msg of categoryMessages.values()) {
        const match = msg.content.match(/^> ### (.+)/);
        if (match) {
          const categoryName = match[1].trim();
          if (!validCategories.includes(categoryName)) {
            try {
              await msg.delete();
              console.log(`Kategorie "${categoryName}" wurde entfernt – Nachricht gelöscht.`);
            } catch (err) {
              console.warn(`❌ Konnte Nachricht für entfernte Kategorie "${categoryName}" nicht löschen:`, err.message);
            }
          }
        }
      }

      // --- Kategorien aktualisieren oder erstellen
      for (const categoryKey of validCategories) {
        const categoryArray = rolesData[categoryKey];

        let messageContent = `> ### ${categoryKey}\n`;
        for (const roleObj of categoryArray) {
          const { name, emoji } = roleObj;
          messageContent += `> ${emoji} = ${name}\n`;
        }

        let targetMessage = existingMessages.find(msg =>
          msg.author.id === interaction.client.user.id &&
          msg.content.startsWith(`> ### ${categoryKey}`)
        );

        if (targetMessage) {
          await targetMessage.edit(messageContent);
          console.log(`Nachricht für Kategorie "${categoryKey}" wurde aktualisiert.`);
        } else {
          targetMessage = await rolesChannel.send(messageContent);
          console.log(`Neue Nachricht für Kategorie "${categoryKey}" wurde gesendet.`);
        }

        // Reaktionen hinzufügen
        for (const roleObj of categoryArray) {
          const emoji = roleObj.emoji;
          try {
            const existingReaction = targetMessage.reactions.cache.find(r => r.emoji.name === emoji);
            if (!existingReaction) {
              await targetMessage.react(emoji);
              console.log(`Reaktion mit ${emoji} hinzugefügt.`);
            }
          } catch (err) {
            console.warn(`❌ Konnte nicht mit ${emoji} reagieren:`, err.message);
          }
        }

        // Überflüssige Reaktionen entfernen
        const validEmojis = categoryArray.map(r => r.emoji);
        for (const [emojiKey, reaction] of targetMessage.reactions.cache) {
          if (!validEmojis.includes(reaction.emoji.name)) {
            try {
              await reaction.remove();
              console.log(`Reaktion ${reaction.emoji.name} entfernt, da sie nicht mehr gebraucht wird.`);
            } catch (err) {
              console.warn(`❌ Konnte Reaktion ${reaction.emoji.name} nicht entfernen:`, err.message);
            }
          }
        }
      }

      await interaction.editReply({ content: 'Rollen-Nachrichten wurden aktualisiert.' });

    } catch (error) {
      console.error('Fehler beim Verarbeiten der Rollen:', error);
      try {
        await interaction.editReply({ content: 'Fehler beim Aktualisieren der Rollen-Nachrichten.' });
      } catch (e) {
        console.warn('Konnte Fehlerantwort nicht senden:', e.message);
      }
    }
  }
}
