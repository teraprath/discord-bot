const { Events } = require('discord.js');
const { memberRoleId } = require('../config.json');
const { User } = require('../database.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      if (member.user.bot) return;
      await member.roles.add(memberRoleId);
    } catch (error) {
      console.error(`Failed to add role to ${member.user.tag}:`, error);
    }
  },
};
