import Command from '../types/Command';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from "../index";

const ping: Command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Shows bot latency.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		await interaction.reply('Ping...');
		await interaction.editReply(`Pong! Command latency is currently ${Date.now() - interaction.createdTimestamp}ms, and API Latency is currently ${Math.round(client.ws.ping)}ms.`);
	}
}

export default ping;