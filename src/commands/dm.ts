import Command from '../types/Command';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import validateUser from '../functions/validateUser';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const dm: Command = {
	data: new SlashCommandBuilder()
		.setName('dm')
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to message, ID or @.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to send.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator)
		.setDescription('Message the user as the bot.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {

        var user = interaction.options.getString("user", true);
        const message = interaction.options.getString("message", true);

        if (!interaction.guild) {return;}

        var isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }
        var {userGuildMember, userNamed, userID} = isValidUser;

        if (userGuildMember === null) {
            interaction.reply({ content: "You must specify a user to message.", ephemeral: true });
            return;
        }

        userGuildMember.user.send(message);

        interaction.reply({ content: `Message sent to ${userGuildMember.user.tag}`, ephemeral: true });

    }
}

export default dm;