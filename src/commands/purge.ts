import Command from '../types/Command';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from "../index";
import { PermissionFlagsBits } from 'discord-api-types/v9';

const purge: Command = {
	data: new SlashCommandBuilder()
	.setName('purge')
	.addIntegerOption(option =>
		option.setName('amount')
			.setDescription('The number of messages to remove.')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(99)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.Administrator)
	.setDescription('Removes a given number of messages from the channel.'),
		// .addStringOption(option =>
		// 	option.setName('user')
		// 		.setDescription('The user to remove messages from. Leave blank to remove all messages.')
		// 		.setRequired(false)
		// ),
	
	execute: async function (interaction) {
		// await interaction.deferReply();

		const amount = interaction.options.getInteger('amount', true);
		const user = interaction.options.getString('user');

		if (!interaction.guild) { return; }
		const guildID = interaction.guild.id;

		const channel = client.channels.cache.get(interaction.channelId);
		if (!channel) { return; }
		if (channel.type !== "GUILD_TEXT") { return; }

		// if (user) {
		// } else {
		// 	// interaction.channel?.messages.fetch({ limit: amount })
		// 	// .then(messages => {
		// 	// 	const userMessages = messages.filter(message => message.author.id === user);
		// }

		if (interaction.channel !== null) {
			try {
				await interaction.channel.messages.fetch({ limit: amount + 1 })
					.then(messages => {
						interaction.channel?.bulkDelete(messages);
					})
					.catch(console.error);
			} catch (error) {
				console.error(error);
				interaction.reply({ content: `Error: ${error}`, ephemeral: true });
				return;
			}
		}

		await interaction.reply({ content: `Purged ${amount} messages from ${channel.name}.`, ephemeral: false });
	}
}


export default purge;