import Command from '../types/Command';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const roll: Command = {
	data: new SlashCommandBuilder()
		.setName('roll')
        .addNumberOption(option =>
			option.setName("max")
				.setDescription("The maximum number to roll, 1 to this number (inclusive)")
				.setRequired(true)
			)
		.setDescription('Roll a die or flip a coin.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {

        const maxNumber = interaction.options.getNumber("max") ?? 2;
        if (isNaN(maxNumber)) {
            await interaction.reply({ content: `Invalid number.`, ephemeral: true });
            return;
        }

        const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
        await interaction.reply({ content: `${interaction.user} rolled a ${randomNumber}!` });
	}
}

export default roll;