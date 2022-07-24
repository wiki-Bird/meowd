import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, Message, GuildMember } from 'discord.js';
import { getSystemErrorMap } from 'util';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import validateUser from '../functions/validateUser';
import { client } from "../index";
import guildCreate from '../events/guildCreate';

const configRef = ref.child("config");
const kick: Command = {
	data: new SlashCommandBuilder()
		.setName('kick')
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to kick, ID or @.")
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("The reason for the kick.")
                    .setRequired(false)
            )
          .setDefaultMemberPermissions(0)
		.setDescription('Kicks a user from the server.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        await interaction.deferReply();
        const user = interaction.options.getString("user", true);
        var reason = interaction.options.getString("reason");
        if (reason === null) {
            reason = "No reason given.";
        }
        const moderator = interaction.user;
        var isValidUser = await validateUser(user, interaction);
        if (!isValidUser) {
            return;
        }
        var {userGuildMember, userNamed, userID} = isValidUser;

        if (!interaction.guild) {return;}

        const currentDate = new Date();

        const embed = new MessageEmbed()
        .setTitle("User Kicked:")
        .setDescription("<@!" + userID + `> (` + userID + `) has been kicked by ${moderator.tag} for the following reason:`)
        .addField("Reason:", reason, true)
        .addField("Date:", currentDate.toLocaleDateString(), true)
        .setColor("#ff0000")
        .setTimestamp();

        // if user's role is higher than mine, I can't kick them
        console.log(userGuildMember.roles.highest.comparePositionTo(interaction.guild.me!.roles.highest));
        if(userGuildMember.roles.highest.comparePositionTo(interaction.guild.me!.roles.highest) >= 0) {
            interaction.editReply("<@!" + userID + "> has a higher role than me, I cannot kick them.");
            return;
        }

        try {
            const dm = await userGuildMember.kick(reason);
        } catch (e) {
            interaction.editReply(`Error: Could not kick user.`);
            console.log(e);
            return;
        }

        const userConfig = await getUserConfig(userID);
        if (userConfig === null) {
            await configRef.child(userID).set({
                warnings: [{
                    reason: reason,
                    date: currentDate.toISOString(),
                    moderator: moderator.id,
                    type: "kick",
                    case_number: 1
                }],
                cases: 1
            });
        }
        else {
            var caseno2 = 0;
            const caseRef = ref.child("config").child(userID).child("cases");
            await caseRef.once("value", (snapshot) => {
                caseno2 = snapshot.val() + 1;
            });
    
            await configRef.child(userID).child("warnings").push({
                reason: reason,
                date: currentDate.toISOString(),
                moderator: moderator.id,
                type: "kick",
                case_number: caseno2
            });
    
            await configRef.child(userID).child("cases").set(caseno2);
        }

        try {
            await interaction.editReply({ content: `<@${userID}> has been kicked.`, embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `Could not DM the kick information to ${userNamed.tag}.`, embeds: [embed] });
        }



    }
}

export default kick;