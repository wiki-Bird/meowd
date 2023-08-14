import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command from '../types/Command';
import { ref } from '..';

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
        let title = "";
        let description = "";

        // get rules from database
        // ref -> config -> guildID -> rules
        // if no rules, return error

        const rules = await ref.child("config").child(interaction.guildId).child("rules").get();
        if (rules.exists() && rules.val() !== null) {
            title = "Rule " + ruleNumber;
            // description = rules.child(ruleNumber.toString()).toString();
            const rulesRef = ref.child("config").child(interaction.guildId).child("rules");
            await rulesRef.child(ruleNumber.toString()).once('value', function(snapshot) {
                const ruleValue = snapshot.val();
                if (ruleValue !== null) {
                    description = ruleValue;
                }
                else {
                    description = "Rule not found.";
                }
              });
        } else {
            title = `Rule ${ruleNumber} not found.`;
        }
        

        const embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor('#00f2ff')

        await interaction.reply({ embeds: [embed] });
	}
}

export default rule;