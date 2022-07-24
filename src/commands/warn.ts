import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, Message, GuildMember } from 'discord.js';
import { getSystemErrorMap } from 'util';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import { client } from "../index";

const configRef = ref.child("config");

const warn: Command = {
  data: new SlashCommandBuilder()
  .setName('warn')
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

	const user = interaction.options.getString("user");
    var reason = interaction.options.getString("reason");
    if (reason === null) {
        reason = "No reason given.";
    }
    const moderator = interaction.user;

    var userGuildMember;
    var userNamed;
    var userID;
    if (user !== null) {

        if (user?.startsWith("<@!") && user?.endsWith(">")) {
            userID = user.slice(3, -1);
        }
        // else if user is an ID:
        else if (user?.length === 18 && isNaN(Number(user)) === false) {
            userID = user;
        }
        else {
            await interaction.reply({ content: `Invalid user. Please provide a user's ID, @ a user, or provide nothing at all.`, ephemeral: true });
            return;
        }
        userGuildMember = await interaction.guild!.members.fetch(userID);
        userNamed = userGuildMember.user;
    }
    else {
        userNamed = interaction.user;
        userGuildMember = interaction.member;
        userID = interaction.user.id;
    }

    // if interaction not in guild, return:
    if (!interaction.guild) {return;}

    const currentDate = new Date();



    const userConfig = await getUserConfig(userID);
    if (userConfig === null) {
        await configRef.child(userID).set({
            warnings: [{
                reason: reason,
                date: currentDate.toISOString(),
                moderator: moderator.id,
                warning_number: 0
            }]
        });
    }
    else {
        let warnings = 0;
        const warnRef = ref.child("config").child(userID).child("warnings");
        warnRef.orderByValue().on('value', (snapshot) => {
            snapshot.forEach((data) => {
                warnings++;
                })
        });

        await configRef.child(userID).child("warnings").push({
            reason: reason,
            date: currentDate.toISOString(),
            moderator: moderator.id,
            warning_number: warnings + 1
        });
    }

    // Send a message to the user, with the reason and the moderator who warned them
    const embed = new MessageEmbed()
        .setTitle("Warning:")
        .setDescription("<@!" + userID + `> (` + userID + `) has been warned by ${moderator.tag} for the following reason:`)
        .addField("Reason:", reason, true)
        .addField("Date:", currentDate.toLocaleDateString(), true)
        .setColor("#ff0000")
        .setTimestamp();
    
    try {
        await userNamed.send({ embeds: [embed] });
        await interaction.editReply({ content: `<@${userID}> has been warned.`, embeds: [embed] });
    }
    catch (err) {
        await interaction.editReply({ content: `Could not DM warning to ${userNamed.tag}.`, embeds: [embed] });
    }

    


  }      
}  

export default warn;

