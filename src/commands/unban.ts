import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const configRef = ref.child("config");
const unban: Command = {
	data: new SlashCommandBuilder()
		.setName('unban')
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to unban, ID.")
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("The reason for the unban.")
                    .setRequired(false)
            )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.Administrator)
		.setDescription('Unban a user from the server.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        await interaction.deferReply();
        const user = interaction.options.getString("user", true);
        let reason = interaction.options.getString("reason");
        if (reason === null) {
            reason = "No reason given.";
        }
        const moderator = interaction.user;

        let userID = "";
        if (user.match(/^[0-9]+$/)) {
            // if theres a banned user with that ID
            const bannedUsers = await interaction.guild?.bans.fetch();
            if (bannedUsers === null) {
                interaction.editReply("Error: Could not fetch banned users.");
                return;
            }
            const bannedUser = bannedUsers?.find(bannedUser => bannedUser.user.id === user);
            if (bannedUser === undefined) {
                interaction.editReply("Error: User is not banned.");
                return;
            }
            userID = user;
        }
        else {
            interaction.editReply("Error: Invalid user ID.");
            return;
        }

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
        .setTitle("User Unbanned:")
        .setDescription("<@!" + userID + `> (` + userID + `) has been unbanned by ${moderator.tag} for the following reason:`)
        .addField("Reason:", reason, true)
        .addField("Date:", currentDate.toLocaleDateString(), true)
        .setColor("#3cff00")
        .setTimestamp();


        try {
            await interaction.guild.members.unban(userID, reason);
        } catch (e) {
            interaction.editReply(`Error: Could not unban user.`);
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
                    type: "unban",
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
                type: "unban",
                duration: "N/A",
                case_number: caseno
            });
    
            await serverConfigRef.child(userID).child("cases").set(caseno);
        }

        try {
            // await interaction.editReply({ content: `<@${userID}> has been banned.`, embeds: [embed] });
            await interaction.reply({ content: `<@${userID}> has been unbanned.`, embeds: [embed] });
        }
        catch (err) {
            // await interaction.editReply({ content: `Could not DM the banned information to ${userNamed.tag}.`, embeds: [embed] });
            await interaction.editReply({ content: `<@${userID}> has been unbanned.`, embeds: [embed] });
        }
    }
}

export default unban;