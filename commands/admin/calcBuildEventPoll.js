const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calcpoll')
    .setDescription('Berechne die Bau-Event Umfrage-Ergebnisse.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({
      flags: ['Ephemeral'],
    });

    const categories = [
      'Kreativität',
      'Ästhetik',
      'Details',
      'Aufwand',
      'Thema',
    ];

    const messages = await interaction.channel.messages.fetch({ limit: 100 });

    const pollMessages = messages.filter(m => m.poll);

    if (pollMessages.size === 0) {
      return interaction.editReply({ content: 'Es wurden keine Umfragen gefunden.' });
    }

    const stats = {};
    for (const c of categories) {
      stats[c] = { votes: 0, points: 0 };
    }

    for (const [, message] of pollMessages) {
      const fetchedMessage = await interaction.channel.messages.fetch(message.id);
      const poll = fetchedMessage.poll;
      if (!poll?.answers) continue;

      const category = (poll.question?.text || '').trim();
      if (!stats[category]) continue;

      const answers = Array.from(poll.answers.values());
      if (answers.length === 0) continue;

      for (const answer of answers) {
        const answerText = answer.text ?? answer.pollMedia?.text ?? answer.answer?.text;
        if (!answerText) continue;

        const points = Number(answerText);
        if (Number.isNaN(points)) continue;

        const voteCount = answer.voteCount ?? answer.count ?? answer.vote_count ?? 0;

        stats[category].votes += voteCount;
        stats[category].points += points * voteCount;
      }
    }

    const formatBar = (avg) => {
      const rounded = Math.round(avg);
      const filled = '█'.repeat(rounded);
      const empty = '▒'.repeat(5 - rounded);
      return filled + empty;
    };

    let totalScore = 0;
    let lines = [];

    for (const c of categories) {
      const { votes, points } = stats[c];
      const avg = votes === 0 ? 0 : points / votes;
      totalScore += avg;

      lines.push(`${c}: ${formatBar(avg)}`);
    }

    let finalScore = parseFloat(totalScore.toFixed(2)).toString().replace('.', ',');

    lines.push(`\nErgebnis: **${finalScore}**/25 Punkte`);

    await interaction.channel.send({
      content: lines.join('\n'),
    });

    await interaction.editReply({
      content: 'Die Ergebnisse wurden berechnet.',
    });
  },
};
