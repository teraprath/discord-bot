const { Events } = require('discord.js');
const { User } = require('../database.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {

    if (message.author.bot) return;

    const user = await User.findOne({ where: { id: message.author.id } });
    const balance = user.coins ? user.coins : 0;
    const random = Math.floor(Math.random() * 5) + 1;
    user.update({ coins: balance + random }, { where: { id: message.author.id } });
  },
};
