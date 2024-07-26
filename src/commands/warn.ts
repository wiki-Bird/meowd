import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import validateUser from '../functions/validateUser';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const configRef = ref.child("config");

const warn: Command = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName("user")
        .setDescription("The user to warn, ID or @.")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("reason")
            .setDescription("The reason for the warning.")
            .setRequired(false)
    )
  .setDefaultMemberPermissions(0)
  .setDescription('Warns a user.'),    


  execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
    await interaction.deferReply();

	const user = interaction.options.getString("user", true);

    let reason = interaction.options.getString("reason");
    if (reason === null) { reason = "No reason given."; }

    const moderator = interaction.user;

    const isValidUser = await validateUser(user, interaction, true);
    if (!isValidUser) { return; }
    const {userNamed, userID} = isValidUser;

    if (!interaction.guild) { return; }
    const guildID = interaction.guild.id;

    const serverConfigRef = configRef.child(guildID);
    if (serverConfigRef === null) {
        console.log("new server")
        await configRef.child(guildID).set({ // empty
        });
    }


    const currentDate = new Date();

    const userConfig = await getUserConfig(userID, guildID);
    if (userConfig === null) {
        console.log("new user")
        await serverConfigRef.child(userID).set({
            warnings: [{
                reason: reason,
                date: currentDate.toUTCString(),
                moderator: moderator.id,
                type: "warning",
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
            type: "warning",
            duration: "N/A",
            case_number: caseno
        });
    }

    // Send a message to the user, with the reason and the moderator who warned them
    const embed = new MessageEmbed()
        .setTitle("Warning:")
        .setDescription("<@!" + userID + `> (` + userID + `) has been warned by ${moderator.username} for the following reason:`)
        .addFields(
            { name: "Reason:", value: reason, inline: true },
            { name: "Date:", value: currentDate.toLocaleDateString(), inline: true }
        )
        .setColor("#ffd200")
        .setTimestamp();
    
    try {
        await userNamed.send({ embeds: [embed] });
        await interaction.editReply({ content: `<@${userID}> has been warned.`, embeds: [embed] });
    }
    catch (err) {
        await interaction.editReply({ content: `Could not DM warning to ${userNamed.username}.`, embeds: [embed] });
    }

  }      
}  

export default warn;

