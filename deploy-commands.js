const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Lese Umgebungsvariable NODE_ENV
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

console.log(`\n[Deploy] Starting in ${env.toUpperCase()} mode...\n`);

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.warn(`[WARNING] Missing "data" or "execute" in ${filePath}`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		if (isDev) {

			// 🧹 Alte globale Befehle löschen
			await rest.put(Routes.applicationCommands(clientId), { body: [] });

			// 📥 Registriere lokal für Test-Guild
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: commands,
			});
			console.log(`✅ [DEV] Registered ${commands.length} guild commands for guild ${guildId}`);
		} else {
			// 🧹 Alte Guild-Befehle löschen
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });

			// 🌍 Registriere global
			await rest.put(Routes.applicationCommands(clientId), {
				body: commands,
			});
			console.log(`✅ [PROD] Registered ${commands.length} global commands`);
			console.log('⏳ Global commands may take up to 1 hour to appear.');
		}
	} catch (error) {
		console.error('❌ Error during command deployment:', error);
	}
})();
