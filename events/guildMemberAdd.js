const { Events } = require('discord.js');
const { memberRoleId } = require('../config.json');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      await member.roles.add(memberRoleId);
    } catch (error) {
      console.error(`Failed to add role to ${member.user.tag}:`, error);
    }
  },
};
