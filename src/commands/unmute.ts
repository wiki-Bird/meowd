import Command from '../types/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import validateUser from '../functions/validateUser';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const unmute: Command = {
    data: new SlashCommandBuilder()
    .setName('unmute')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to unmute, ID or @.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("The reason for unmuting.")
                .setRequired(false)
        )
		.setDescription('Unmutes a user'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {

        var user = interaction.options.getString("user", true);
        var reason = interaction.options.getString("reason", false);

        if (reason === null) {
            reason = "No reason given.";
        }

        if (!interaction.guild) {return;}

        var isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }
        var {userGuildMember, userNamed, userID} = isValidUser;

        if (userGuildMember === null) {
            interaction.reply({ content: "You must specify a user to unmute.", ephemeral: true });
            return;
        }

        // if member timeout is not set, set it to 0
        if (userGuildMember.timeout === null) {
            interaction.reply({ content: "User is not timed out.", ephemeral: true });
            return;
        }

        userGuildMember.timeout(null, reason);

        var embed = new MessageEmbed()
            .setTitle("User Unmuted:")
            .setDescription("<@!" + userID + `> (` + userID + `) has been unmuted by ${interaction.user.tag} for the following reason:`)
            .addField("Reason:", reason, true)
            .setColor("#00f2ff")
            .setTimestamp();

        interaction.reply({ embeds: [embed] });

    }
}

export default unmute;