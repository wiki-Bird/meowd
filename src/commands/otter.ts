import Command from '../types/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const otter: Command = {
    data: new SlashCommandBuilder()
	.setName('otter')
	.addNumberOption(option =>
		option.setName('number')
			.setDescription("The number of the Otter you would like (OPTIONAL)")
			.setRequired(false)
			.setMinValue(1)
		)	
	.setDescription('Sends an otter image 🦦'),
    execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		// const days = Math.floor((Date.now() - new Date("1/20/2022").getTime()) / (1000 * 3600 * 24));
		const days = 452; // As we've only got 452 otters, this is the max number. This is a temporary fix.
		const randomDay = Math.floor(Math.random() * days + 1);

		await interaction.deferReply();
		const number = interaction.options.getNumber("number");

		const embed = new MessageEmbed()
			.setColor("#00f2ff");

		if (number === null) {
			embed.setAuthor({ name: "Random Otter - Otter " + randomDay, iconURL: "https://media.discordapp.net/attachments/590667063165583409/1089047115315032125/icon.png"})
				.setImage("https://raw.githubusercontent.com/DailyOttersBot/otters/main/otter%20(" + randomDay + ").jpg");
		} else if (number <= days) {
			embed.setAuthor({ name: "Otter " + number, iconURL: "https://media.discordapp.net/attachments/590667063165583409/1089047115315032125/icon.png"})
				.setImage("https://raw.githubusercontent.com/DailyOttersBot/otters/main/otter%20(" + number + ").jpg");
		} else {
			embed.setAuthor({ name: "Latest possible Otter, Otter " + days, iconURL: "https://media.discordapp.net/attachments/590667063165583409/1089047115315032125/icon.png"})
				.addFields({ name: "Otter " + number + " is not yet available.", value: "Today's otter is Otter " + days + "!"})
				.setImage("https://raw.githubusercontent.com/DailyOttersBot/otters/main/otter%20(" + days + ").jpg");
		}
		await interaction.editReply({ embeds: [embed] });
    }
}

export default otter;