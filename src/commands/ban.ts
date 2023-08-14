import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import validateUser from '../functions/validateUser';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const configRef = ref.child("config");
const ban: Command = {
	data: new SlashCommandBuilder()
		.setName('ban')
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to ban, ID or @.")
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("The reason for the ban.")
                    .setRequired(false)
            )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator)
		.setDescription('Ban a user from the server.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        await interaction.deferReply();
        const user = interaction.options.getString("user", true);
        let reason = interaction.options.getString("reason");
        if (reason === null) {
            reason = "No reason given.";
        }
        const moderator = interaction.user;
        const isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }
        const {userGuildMember, userNamed, userID} = isValidUser;

        if (!interaction.guild) {return;}

        const guildID = interaction.guild.id;

        const serverConfigRef = configRef.child(guildID);
        if (serverConfigRef === null) {
            console.log("new server")
            await configRef.child(guildID).set({ // empty
            });
        }

        const currentDate = new Date();

        const embed = new MessageEmbed()
        .setTitle("User Banned:")
        .setDescription("<@!" + userID + `> (` + userID + `) has been banned by ${moderator.tag} for the following reason:`)
        .addField("Reason:", reason, true)
        .addField("Date:", currentDate.toLocaleDateString(), true)
        .setColor("#ff0000")
        .setTimestamp();

        // if user's role is higher than mine, I can't ban them
        if(userGuildMember.roles.highest.comparePositionTo(interaction.guild.me!.roles.highest) >= 0) {
            interaction.editReply("<@!" + userID + "> has a higher role than me, I cannot ban them.");
            return;
        }

        try {
            await userGuildMember.ban({reason: reason, days: 0});
        } catch (e) {
            interaction.editReply(`Error: Could not ban user.`);
            console.log(e);
            return;
        }

        const userConfig = await getUserConfig(userID, guildID);
        if (userConfig === null) {
            await serverConfigRef.child(userID).set({
                warnings: [{
                    reason: reason,
                    date: currentDate.toUTCString(),
                    moderator: moderator.id,
                    type: "ban",
                    duration: "N/A",
                    case_number: 1
                }],
                cases: 1
            });
        }
        else {
            let caseno = await serverConfigRef.child(userID).child("cases").get();
            if (caseno.exists()) { // increment caseno
                caseno = caseno.val() + 1;
                await serverConfigRef.child(userID).child("cases").set(caseno);
            }
    
            await serverConfigRef.child(userID).child("warnings").push({
                reason: reason,
                date: currentDate.toUTCString(),
                moderator: moderator.id,
                type: "ban",
                duration: "N/A",
                case_number: caseno
            });
    
            await serverConfigRef.child(userID).child("cases").set(caseno);
        }

        try {
            // await interaction.editReply({ content: `<@${userID}> has been banned.`, embeds: [embed] });
            await interaction.reply({ content: `<@${userID}> has been banned.`, embeds: [embed] });
        }
        catch (err) {
            // await interaction.editReply({ content: `Could not DM the banned information to ${userNamed.tag}.`, embeds: [embed] });
            await interaction.editReply({ content: `<@${userID}> has been banned.`, embeds: [embed] });
        }
        



    }
}

export default ban;