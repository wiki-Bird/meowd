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
        await interaction.deferReply();


        const user = interaction.options.getString("user", true);

        let reason = interaction.options.getString("reason", false);
        if (reason === null) { reason = "No reason given."; }
        if (!interaction.guild) {return;}

        const isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }
        const {userGuildMember, userID} = isValidUser;

        if (userGuildMember === null) {
            interaction.editReply({ content: "You must specify a user to unmute." });
            return;
        }

        // if member timeout is not set, set it to 0
        if (userGuildMember.timeout === null) {
            interaction.editReply({ content: "User is not timed out." });
            return;
        }

        userGuildMember.timeout(null, reason);

        const embed = new MessageEmbed()
            .setTitle("User Unmuted:")
            .setDescription("<@!" + userID + `> (` + userID + `) has been unmuted by ${interaction.user.tag} for the following reason:`)
            .addFields({ name: "Reason:", value: reason, inline: true })
            .setColor("#3cff00")
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });

    }
}

export default unmute;