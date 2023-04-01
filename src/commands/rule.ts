import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import validateUser from '../functions/validateUser';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const rule: Command = {
	data: new SlashCommandBuilder()
		.setName('rule')
        .addNumberOption(option =>
            option.setName("number")
                .setDescription("The rule number to get")
                .setRequired(true)
                .setMinValue(1)
            )
		.setDescription('Shows the specified rule.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		const ruleNumber = interaction.options.getNumber("number") ?? 1;
        var title = "";
        var description = "";

        // get rules from database
        // ref -> config -> guildID -> rules
        // if no rules, return error

        var rules = await ref.child("config").child(interaction.guildId).child("rules").get();
        if (rules.exists() && rules.val() !== null) {
            title = "Rule " + ruleNumber;
            description = rules.child(ruleNumber.toString()).toString();
        } else {
            title = `Rule ${ruleNumber} not found.`;
        }
        

        var embed = new MessageEmbed()

        .setTitle(title)
        .setDescription(description)
        .setColor('#1847bf')

        const messageId = await interaction.reply({ embeds: [embed] });

	}
}

export default rule;