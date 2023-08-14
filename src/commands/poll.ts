import Command from '../types/Command';
import { CommandInteraction, MessageEmbed, Message } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const poll: Command = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.addStringOption(option =>
			option.setName("title")
				.setDescription("The title of the poll")
				.setRequired(true)
			)
		.addStringOption(option =>
			option.setName("options")
				.setDescription("The options for the poll, seperated with commas")
			)
		.setDescription('Creates a poll.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		const Title = interaction.options.getString("title");
		const Options = interaction.options.getString("options");

		const embed = new MessageEmbed();
		embed.setTitle(Title!)
		.setFooter({ text: `Poll created by ${interaction.user.tag} with /poll` })
		.setColor("#00f2ff");

		if (Options === null) {
			const replied = await interaction.reply({ embeds: [embed], fetchReply: true });
			if (replied instanceof Message) {
				await replied.react('👍');
				await replied.react('👎');
				await replied.react('🤷');
			} else {
				await interaction.reply({ content: `Stinky poopy`, ephemeral: true });
			}
		} 
		else {
			const OptionsArray = Options!.split(",");
			if (OptionsArray.length > 20) {
				await interaction.reply({ content: `Too many options! The maximum number of options is 20.`, ephemeral: true });
			}

			// A - T (20 emojis)
			const emojiList = ["🇦", "🇧", "🇨", "🇩", "🇪",
			"🇫", "🇬", "🇭", "🇮", "🇯",
			"🇰", "🇱", "🇲", "🇳", "🇴",
			"🇵", "🇶", "🇷", "🇸", "🇹"];

			let optionsText = "";
			for (let i = 0; i < OptionsArray.length; i++) {
				optionsText += `${emojiList[i]} ${OptionsArray[i]}` + "\n\n";
			}
			embed.setDescription(optionsText);
			const replied = await interaction.reply({ embeds: [embed], fetchReply: true });

			if (replied instanceof Message) {
				for (let i = 0; i < OptionsArray.length; i++) {
					await replied.react(emojiList[i]);
				}
			} else {
				await interaction.reply({ content: `Stinky poopy`, ephemeral: true });
			}
		}
	}
}

export default poll;