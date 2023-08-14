import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import muteUser from '../functions/muteUser';
import Command from '../types/Command';
import { PermissionFlagsBits } from 'discord-api-types/v9';


const mute: Command = {
	data: new SlashCommandBuilder()
		.setName('mute')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to mute, ID or @.")
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("time")
                    .setDescription("The time to mute the user for, eg: 3m, 3hr, 3d.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("The reason for the mute.")
                    .setRequired(false)
            )
          .setDefaultMemberPermissions(0)
		.setDescription('Mutes a user in the server.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        await interaction.deferReply();
        const user = interaction.options.getString("user", true);
        let reason = interaction.options.getString("reason");
        const time = interaction.options.getString("time", true);
        if (reason === null) {
            reason = "No reason given.";
        }
        const moderator = interaction.user;

        await muteUser(interaction, user, reason, time, moderator);

    }
}

export default mute;