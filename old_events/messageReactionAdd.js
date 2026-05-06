const { Events } = require('discord.js');
const { rolesChannelId } = require('../config.json');

const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {

    if (user.bot) return;

    // Handle partials FIRST before accessing properties
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }

    if (reaction.message.partial) {
      try { await reaction.message.fetch(); } catch { return; }
    }

    if (!reaction.message) return;
    if (reaction.message.channelId !== rolesChannelId) return;
    if (!reaction.message.guild) return;
    if (!reaction.message.author || !reaction.message.author.bot) return;
    if (!reaction.message.content || !reaction.message.content.startsWith('> ###')) return;

    const rolesPath = path.join(__dirname, '../data/roles.json');
    let rolesData;
    try {
      rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
    } catch (err) {
      console.error('❌ Fehler beim Laden von roles.json:', err.message);
      return;
    }

    const categoryMatch = reaction.message.content.match(/^> ### (.+)/);
    if (!categoryMatch) return;

    const categoryName = categoryMatch[1].trim();
    const categoryRoles = rolesData[categoryName];
    if (!categoryRoles) return;

    const emojiKey = reaction.emoji.id || reaction.emoji.name;
    const roleEntry = categoryRoles.find(r => r.emoji === emojiKey);
    if (!roleEntry || !roleEntry.id) return;

    try {
      if (!reaction.message.guild) return;
      const member = await reaction.message.guild.members.fetch(user.id);
      if (member.roles.cache.has(roleEntry.id)) return;

      await member.roles.add(roleEntry.id);
      console.log(`✅ Rolle "${roleEntry.name}" (${roleEntry.id}) an ${user.tag} vergeben.`);
    } catch (err) {
      console.warn(`❌ Konnte Rolle nicht vergeben:`, err.message);
    }
  }
}
