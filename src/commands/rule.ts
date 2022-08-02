import Command from '../types/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const rule: Command = {
	data: new SlashCommandBuilder()
		.setName('rule')
        .addNumberOption(option =>
            option.setName("number")
                .setDescription("The rule number to get")
                .setRequired(true)
                .setMaxValue(9)
                .setMinValue(1)
            )
		.setDescription('Shows the specified rule.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		const ruleNumber = interaction.options.getNumber("number");
        var title = "";
        var description = "";

        switch (ruleNumber) {
            case 1:
                title = "Discord's TOS:"
                description = "Follow all of Discord's ToS. This includes but is not limited to no calls to, glorification of, or promotion of violence."
                break;
            case 2:
                title = "No Discrimination:"
                description = "This includes, but is not limited to: racism, sexism, ableism, transphobia, Islamophobia, homophobia, anti-semitism, and misogyny. Please be conscious that other forms of discrimination exist and try not to engage in them."
                break;
            case 3:
                title = "No Harassment:"
                description = "Debates and arguments may become heated, but all should remain respectful of other users. Under no circumstances should any members feel they are being bullied, stalked, or unfairly targeted."
                break;
            case 4:
                title = "No slurs:"
                description = "In cases of quotation, please use appropriate reference words such as “f-word”, “n-word”, “t-word”, “r-word”."
                break;
            case 5:
                title = "No Spam/Trolling:"
                description = "Do not mic spam or intentionally create noise to annoy other members. Do not spam chats."
                break;
            case 6:
                title = "No NSFW Content:"
                description = "Keep it clean <3"
                break;
            case 7:
                title = "Do not circumvent moderation:"
                description = "Attempts to evade punishments will result in increased punishments."
                break;
            case 8:
                title = "Good Faith Argumentation:"
                description = " Try your best to engage with others in good faith. \n\n :small_blue_diamond: Do not flamebait (intentionally trying to provoke angry responses)\n:small_blue_diamond: Don't spread misinformation. \n:small_blue_diamond: Do not attempt to derail conversations (e.g. meta-comments are allowed as long as they are constructive and do not derail a thread) \n:small_blue_diamond: Be considerate on subject matter."
                break;
            case 9:
                title = "Moderation Requests:"
                description = ":small_blue_diamond: Please refrain from engaging in erroneous pings of the moderation team. If you ping one of these roles please include in your message context of what you need help with.\n:small_blue_diamond: If you need something that cannot be addressed via report or ping, please contact moderators or admins via DM.\n:small_blue_diamond: If you feel you were unfairly punished, contact an admin to appeal; do not use chat to complain."
                break;
        }

        var embed = new MessageEmbed()

        .setTitle(title)
        .setDescription(description)
        .setColor('#1847bf')

        const messageId = await interaction.reply({ embeds: [embed] });

	}
}

export default rule;