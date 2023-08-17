import { REST } from '@discordjs/rest';
import { Routes, RESTPostAPIApplicationCommandsJSONBody as RawSlashCommand } from 'discord-api-types/v9';
import Command from './types/Command';
import fs from 'node:fs';

// ESLint doesn't like this, but it's needed to fix yarn build
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token, clientId } = require('../config.json');
// import config from '../config.json';
// const { token, clientId } = config;

const commands: RawSlashCommand[] = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	// ESLint doesn't like dynamic imports, but ¯\_(ツ)_/¯
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const command = require(`./commands/${file}`) as Command;
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(clientId),
            //Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
