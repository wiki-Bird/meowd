import { REST } from '@discordjs/rest';
import { Routes, RESTPostAPIApplicationCommandsJSONBody as RawSlashCommand } from 'discord-api-types/v9';
import Command from './types/Command';
import fs from 'node:fs';

import { token } from '../config.json';

const commands: RawSlashCommand[] = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = '994046329678463026';
// const guildId = '521856622998323202';

for (const file of commandFiles) {
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
