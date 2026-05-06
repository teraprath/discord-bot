const { Events } = require('discord.js');
const { User } = require('../database.js');
const { levelChannelId } = require('../config.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {

    if (message.author.bot) return;

    if (!message.guild) return;

    let user = await User.findOne({ where: { id: message.author.id } });

    if (!user) {
      try {
        user = await User.create({ id: message.author.id, coins: 0, xp: 0, level: 0 });
      } catch {
        return;
      }
    }

    // Coins
    const balance = user.coins ? user.coins : 0;
    const randomCoins = Math.floor(Math.random() * 5) + 1;

    // XP
    const level = user.level ?? 0;
    let xp = user.xp ?? 0;

    // Zufällige XP pro Nachricht
    const gainedXp = Math.floor(Math.random() * 11) + 15;
    xp += gainedXp;

    // Bessere Progression:
    // Level 0-20 schnell, 20-50 normal, 50-100 schwer aber fair
    const xpNeeded = Math.floor(
      80 +
      (level * 35) +
      Math.pow(level, 1.6) * 12
    );

    let newLevel = level;
    let newXp = xp;

    // Mehrfaches Level Up prüfen (falls viele XP auf einmal kommen)
    while (newXp >= Math.floor(80 + (newLevel * 35) + Math.pow(newLevel, 1.6) * 12) && newLevel < 100) {
      const nextXpNeeded = Math.floor(
        80 +
        (newLevel * 35) +
        Math.pow(newLevel, 1.6) * 12
      );

      newXp -= nextXpNeeded;
      newLevel += 1;
    }

    if (newLevel > level) {

      const levelChannel = message.guild.channels.cache.get(levelChannelId)
        || await message.guild.channels.fetch(levelChannelId).catch(() => null);

      if (levelChannel) {
        levelChannel.send(
          `🎉 ${message.author} ist jetzt Level **${newLevel}**!`
        );
      }
    }

    if (newLevel >= 100) {
      newLevel = 100;
      newXp = 0;
    }

    try {
      await user.update({ coins: balance + randomCoins, xp: newXp, level: newLevel });
    } catch {
      return;
    }
  },
};
