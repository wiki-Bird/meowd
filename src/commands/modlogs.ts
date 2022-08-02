import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import { client } from "../index";
import validateUser from '../functions/validateUser';

import { PermissionFlagsBits } from 'discord-api-types/v9';

const modlog: Command = {
  data: new SlashCommandBuilder()
  .setName('modlog')   
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option.setName("user")
        .setDescription("The user to list, ID or @.")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("type")
            .setDescription("The type of activity you want to view.")  
            .addChoices(
                { name: "all", value: "all" },
                { name: "warnings", value: "warning" },
                { name: "mutes", value: "mute" },
                { name: "kicks", value: "kick" },
                { name: "bans", value: "ban" },
                )
            .setRequired(false)
    )
    .addNumberOption(option =>
        option.setName("page")
            .setDescription("The page of the list you want to view.")
            .setRequired(false)
            .setMinValue(1)
    )
  .setDescription('View the moderation history of a given user.'),    
  execute: async function (interaction) {
    const user = interaction.options.getString("user") || interaction.user.id;
    var type = interaction.options.getString("type");
    var page = interaction.options.getNumber("page");
    
    var isValidUser = await validateUser(user, interaction, false);

    if (!isValidUser) {
        return;
    }

    var {userGuildMember, userNamed, userID} = isValidUser;

    const userConfig = await getUserConfig(userID);
    if (userConfig === null){ return interaction.reply({ content: `User has no logs.`, ephemeral: true }) };

    var casenumbers = 0;
    const caseRef = ref.child("config").child(userID).child("cases");
    await caseRef.once("value", (snapshot) => {
        casenumbers = snapshot.val() + 1;
    });

    var totalPages = Math.ceil(casenumbers / 15);
    if (page === null){
        page = 1;
    }
    if (page > totalPages) {
        page = totalPages;
    }

    var embed = new MessageEmbed()
        .setColor("#0099ff")
        .setDescription("_ _")
        .setTimestamp();

    // let sentEmbed = false;
    let addedFieldCount = 1;

    if (userID === client.user.id) {
        embed.setTitle("User " + userID + "'s moderation history (user not in server):");
    } else {
        embed.setAuthor({ name: userNamed.tag + "'s moderation history:", iconURL: userNamed.displayAvatarURL() });
    }
    if (page < totalPages) {
        embed.setFooter({ text: "Page " + page + " of " + totalPages + "  |  /modlog " + userID  + " " + (page + 1) + " for the next page."});
    }
    else{
        embed.setFooter({ text: "Page " + page + " of " + totalPages});
    }

        // We can fit 15 cases per page. If the page number is 1, give the first 15 cases. If the page number is 2, give the next 15 cases. etc.
        //.startAt((page - 1) * 15).endAt(page * 15)
        //warnsRef.orderByChild("case_number").startAt((page - 1) * 15).endAt(page * 15).on("child_added", async (snapshot) => {

    
    var warnsRef = ref.child("config").child(userID).child("warnings");
    var lastCase = 0;
    if (type === null || type === "all") {
        var i = 1;
        warnsRef.orderByChild("case_number").startAt((page-1)*15).on("child_added", async (snapshot) => {
            if (i <= 15) {
                embed.addFields({
                    name: `Case ${snapshot.val().case_number} - ${snapshot.val().type}`,
                    value: `**Reason:** ${snapshot.val().reason}\n**Moderator:** <@!` + snapshot.val().moderator + `> - ${snapshot.val().moderator}\n**Date:** ${snapshot.val().date}\n**Type:** ${snapshot.val().type}\n**Duration:** ${snapshot.val().duration}ms`,
                });
                addedFieldCount++;
                i++;
            }

        })
    }
    else {
        var i = 1;
        warnsRef.orderByChild("case_number").startAt((page-1)*15).on("child_added", async (snapshot) => {
            if (i <= 15 && snapshot.val().type === type) {
                embed.addFields({
                    name: `Case ${snapshot.val().case_number} - ${snapshot.val().type}`,
                    value: `**Reason:** ${snapshot.val().reason}\n**Moderator:** <@!` + snapshot.val().moderator + `> - ${snapshot.val().moderator}\n**Date:** ${snapshot.val().date}\n**Type:** ${snapshot.val().type}`,
                });
                addedFieldCount++;
                i++;
            }
        })
        if (i === 1) {
            embed.addField("No cases found.", "No cases found of type " + type + ".");
        }
        if (userID === client.user.id) {
            embed.setTitle("User " + userID + "'s " + type + " history (user not in server):");
        } else {
            embed.setAuthor({ name: userNamed.tag + "'s " + type + " history:", iconURL: userNamed.displayAvatarURL() });
        }

        totalPages = Math.ceil(addedFieldCount / 15);
        if (page < totalPages) {
            embed.setFooter({ text: "Page " + page + " of " + totalPages + "  |  /modlog " + userID  + " " + (page + 1) + " for the next page."});
        }
        else{
            embed.setFooter({ text: "Page " + page + " of " + totalPages});
        }
    }


    await interaction.deferReply();

    await interaction.editReply({ embeds: [embed] });
    if (addedFieldCount !== casenumbers && addedFieldCount !== (casenumbers % 15) + 1 && addedFieldCount !== 16 && i !== 1) {
        embed.setFooter({  text: `Some cases could not be shown. Please try again shortly.` });
        await interaction.editReply({ embeds: [embed] });
        setTimeout(async () => {
            if (addedFieldCount === casenumbers) {
                embed.setFooter({ text: "All cases are now succesfully loaded." });
            }
            await interaction.editReply({ embeds: [embed] });
        }, 10_000);
    }

  }
}



export default modlog;