const { Events } = require('discord.js');
const { User } = require('../database.js');

module.exports = {
  name: Events.GuildMemberUpdate,
  // TODO: Check which role has been added
  async execute(member) {
    if (member.user.bot) return;
    await User.findOrCreate({where: {username: member.user.tag}});
  },
};
