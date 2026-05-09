const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpoll')
    .setDescription('Umfragen für das Bau-Event erstellen.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const categories = [
      'Kreativität',
      'Ästhetik',
      'Details',
      'Aufwand',
      'Thema',
    ];

    await interaction.reply({
      content: 'Die Umfragen werden erstellt...',
      ephemeral: true,
    });

    for (const category of categories) {
      await interaction.channel.send({
        poll: {
          question: {
            text: category,
          },
          answers: [
            {
              text: '5',
            },
            {
              text: '4',
            },
            {
              text: '3',
            },
            {
              text: '2',
            },
            {
              text: '1',
            },
          ],
          allowMultiselect: false,
          duration: 1,
        },
      });
    }
  },
};
