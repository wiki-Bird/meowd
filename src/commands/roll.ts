import Command from '../types/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const data = new SlashCommandBuilder() 
	.setName('roll')
	.setDescription('Roll some dice.');


data.addSubcommand(addSubcommand =>
	addSubcommand
		.setName("simple")
		.setDescription("Easily roll some dice.")
		.addNumberOption(option =>
			option.setName("max")
				.setDescription("The maximum number to roll, 1 to this number (inclusive)")
				.setRequired(true)
		)
		.addNumberOption(option =>
			option.setName("count")
			.setDescription("The number of dice to roll")
			.setRequired(false)
			.setMaxValue(24)
		)
		.addStringOption(option =>
			option.setName("modifier")
				.setDescription("The modifier to add to the roll, e.g. +2, -1, x3")
				.setRequired(false)
		)
)
data.addSubcommand(addSubcommand =>
	addSubcommand
		.setName("advanced")
		.setDescription("Advanced dice rolling.")
		.addStringOption(option =>
			option.setName("formula")
				.setDescription("The formula to use, e.g. 2d6+1, 3d4-2, 1d20x2")
				.setRequired(true)
		)
)


const roll: Command = {

	data,

	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "simple") {	
			const maxNumber = interaction.options.getNumber("max") ?? 2;
			if (isNaN(maxNumber)) {
				await interaction.reply({ content: `Invalid number.`, ephemeral: true });
				return;
			}

			
			const count = interaction.options.getNumber("count") ?? 1;

			const modifier = interaction.options.getString("modifier") ?? "";
			let modifierNumber = 0;


			const embed = new MessageEmbed()
				.setColor("#00f2ff")
				.setTitle(`🎲 ${interaction.user.username} rolled ${count} d${maxNumber} dice`)
			
			let firstChar;
			if (modifier !== "") {
				firstChar = modifier.charAt(0);
				if (
					firstChar !== "+" && 
					firstChar !== "-" && 
					firstChar !== "x" && firstChar !== "X" && firstChar !== "*" &&
					firstChar !== "/" &&
					firstChar !== "%" &&
					firstChar !== "^"
					) {
					await interaction.reply({ content: "Invalid modifier, must start with `+, -, *, /, % or ^`.", ephemeral: true });
					return;
				}

				const restOfModifier = modifier.substring(1);
				if (isNaN(Number(restOfModifier))) {
					await interaction.reply({ content: `Invalid modifier, must end with an integer.`, ephemeral: true });
					return;
				}

				modifierNumber = Number(restOfModifier);
				embed.setFooter({ text: `Between 1 & ${maxNumber}, with a ${modifier} modifier` });
			} 
			else {
				embed.setFooter({ text: `Between 1 & ${maxNumber}` });
			}

			for (let i = 0; i < count; i++) {
				const randomNumber = Math.floor(Math.random() * maxNumber + 1);
				let modifiedNumber = randomNumber; // By default, if there's no modifier.

				if (modifier) {
					switch (firstChar) {
						case '+':
							modifiedNumber = randomNumber + modifierNumber;
							break;
						case '-':
							modifiedNumber = randomNumber - modifierNumber;
							break;
						case 'x':
						case 'X':
						case '*':
							modifiedNumber = randomNumber * modifierNumber;
							break;
						case '/':
							await interaction.reply({ content: `Division is not supported yet. Sorry.`, ephemeral: true });
							return;

							// if (modifierNumber === 0) {
							// 	await interaction.reply({ content: `Cannot divide by zero.`, ephemeral: true });
							// 	return;
							// }
							// modifiedNumber = randomNumber / modifierNumber;
							// break;
						case '%':
							modifiedNumber = randomNumber % modifierNumber;
							break;
						case '^':
							modifiedNumber = Math.pow(randomNumber, modifierNumber);
							break;
						default:
							// You've already handled invalid modifiers, so this shouldn't really happen.
							await interaction.reply({ content: "Unexpected error occurred.", ephemeral: true });
							return;
					}
				}

				embed.addFields({ name: ` `, value: `**Die ${i + 1}:** ` + String(modifiedNumber) });
			}

			await interaction.reply({ embeds: [embed] });
		}
		else if (subcommand === "advanced") {
			const formula = interaction.options.getString("formula") ?? "";
		
			const embed = new MessageEmbed()
				.setColor("#00f2ff")
				.setTitle(`🎲 ${interaction.user.username} rolled some dice`)
				.setFooter({ text: `Formula: ${formula}` });
		
			const formulas = formula.split(", ");
			for (let i = 0; i < formulas.length; i++) {
				// Split the formula into base dice and modifier
				// eslint-disable-next-line prefer-const
				let [dice, modifier] = formulas[i].split(/([+\-x*/%^]\d+)/);
				if (!dice || !modifier) {
					modifier = '';  // No modifier provided
				}
		
				const formulaArray = dice.split("d");
				if (formulaArray.length !== 2) {
					await interaction.reply({ content: `Invalid formula ${formulas[i]}.`, ephemeral: true });
					return;
				}
		
				const count = Number(formulaArray[0]);
				const maxNumber = Number(formulaArray[1]);
		
				// validations
				if (isNaN(count) || isNaN(maxNumber)) {
					await interaction.reply({ content: `Invalid formula ${formulas[i]}.`, ephemeral: true });
					return;
				}

				if (count < 1 || count > 24) {
					await interaction.reply({ content: `Invalid formula ${formulas[i]}. Count must be between 1 and 24.`, ephemeral: true });
					return;
				}

				if (maxNumber < 1 || maxNumber > 1000000) {
					await interaction.reply({ content: `Invalid formula ${formulas[i]}. Max number must be between 1 and 1,000,000.`, ephemeral: true });
					return;
				}
		
				let totalResult = "";
				for (let j = 0; j < count; j++) {
					let singleRoll = Math.floor(Math.random() * maxNumber) + 1;
		
					if (modifier !== "") {
						console.log(modifier);
						const operation = modifier[0];
						const value = Number(modifier.slice(1));

						console.log("Operation:", operation);
						console.log("Value:", value);
					
						switch(operation) {
							case '+':
								singleRoll += value;
								break;
							case '-':
								singleRoll -= value;
								break;
							case 'x':  
							case '*':
								singleRoll *= value;
								break;
							case '/':
								await interaction.reply({ content: `Division is not supported yet. Sorry.`, ephemeral: true });
								return;
								// if (value === 0) {
								// 	await interaction.reply({ content: `Cannot divide by zero.`, ephemeral: true });
								// 	return;
								// }
								// singleRoll = Math.floor(singleRoll / value);
								// break;
							case '%':
								singleRoll %= value;
								break;
							case '^':
								singleRoll = Math.pow(singleRoll, value);
								break;
						}
					}
					totalResult += singleRoll + ", ";
				}
				embed.addFields({ name: ` `, value: `**Dice ${i + 1} (d${maxNumber}):** ` + totalResult.slice(0, -2) });
				// Add totalResult to embed or however you wish to use it...
			}
		
			// Send the embed..
			await interaction.reply({ embeds: [embed] });
		}		
	}
}

export default roll;