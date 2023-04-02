import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import validateUser from '../functions/validateUser';
import validateDuration from '../functions/validateDuration';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const configRef = ref.child("config");
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
                    .setDescription("The time to mute the user for, eg: 3min, 3hr, 3d.")
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
        var reason = interaction.options.getString("reason");
        var time = interaction.options.getString("time", true);
        if (reason === null) {
            reason = "No reason given.";
        }
        const moderator = interaction.user;
        var isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }
        var {userGuildMember, userNamed, userID} = isValidUser;


        var isValidTime = await validateDuration(time, interaction);
        if (!isValidTime) {
            return;
        }
        var {timeInMS, timeString} = isValidTime;

        if (!interaction.guild) {return;}

        var guildID = interaction.guild.id;

        if (timeInMS >= 2419200000) {
            await interaction.editReply("You can't mute for more than 28 days.");
            return;
        }

        const serverConfigRef = configRef.child(guildID);
        if (serverConfigRef === null) {
            console.log("new server")
            await configRef.child(guildID).set({ // empty
            });
        }

        const currentDate = new Date();

        const embed = new MessageEmbed()
        .setTitle("User Muted:")
        .setDescription("<@!" + userID + `> (` + userID + `) has been muted by ${moderator.tag} for the following reason:`)
        .addField("Reason:", reason, true)
        .addField("Date:", currentDate.toLocaleDateString(), true)
        .addField("Duration:", timeString)
        .setColor("#00f2ff")
        .setTimestamp();

        // if user's role is higher than mine, I can't mute them
        if(userGuildMember.roles.highest.comparePositionTo(interaction.guild.me!.roles.highest) >= 0) {
            interaction.editReply("<@!" + userID + "> has a higher role than me, I cannot mute them.");
            return;
        }

        try {
            userGuildMember.timeout(timeInMS, reason);
        } catch (e) {
            interaction.editReply(`Error: Could not mute user.`);
            console.log(e);
            return;
        }

        const userConfig = await getUserConfig(userID, guildID);
        if (userConfig === null) {
            await configRef.child(userID).set({
                warnings: [{
                    reason: reason,
                    date: currentDate.toUTCString(),
                    moderator: moderator.id,
                    type: "mute",
                    duration: timeInMS,
                    case_number: 1
                }],
                cases: 1
            });
        }
        else {
            var caseno = await serverConfigRef.child(userID).child("cases").get();
            if (caseno.exists()) { // increment caseno
                caseno = caseno.val() + 1;
                await serverConfigRef.child(userID).child("cases").set(caseno);
            }
    
            await configRef.child(userID).child("warnings").push({
                reason: reason,
                date: currentDate.toUTCString(),
                moderator: moderator.id,
                type: "mute",
                duration: timeInMS,
                case_number: caseno
            });
    
            await configRef.child(userID).child("cases").set(caseno);
        }

        try {
            await interaction.editReply({ content: `<@${userID}> has been muted.`, embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `Could not DM the kick information to ${userNamed.tag}.`, embeds: [embed] });
        }



    }
}

export default mute;