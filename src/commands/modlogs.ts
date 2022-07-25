import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, Message, GuildMember } from 'discord.js';
import { getSystemErrorMap } from 'util';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import { client } from "../index";
import validateUser from '../functions/validateUser';

const configRef = ref.child("config");

const modlog: Command = {
  data: new SlashCommandBuilder()
  .setName('modlog')   
  .addStringOption(option =>
    option.setName("user")
        .setDescription("The user to list, ID or @.")
    )
    .addStringOption(option =>
        option.setName("type")
            .setDescription("The type of activity you want to view.")  
            .addChoices(
                { name: "all", value: "all" },
                { name: "warnings", value: "warnings" },
                { name: "mutes", value: "mutes" },
                { name: "kicks", value: "kicks" },
                { name: "bans", value: "bans" },
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
        .setTimestamp();

    // let sentEmbed = false;
    let addedFieldCount = 1;

    if (userNamed.id === client.user.id) {
        embed.setTitle("User " + userID + "'s moderation history (user not in server):");
    } else {
        embed.setTitle(userNamed.tag + "'s moderation history:");
    }
    embed.setFooter({ text: "Page " + page + " of " + totalPages + "  |  ID: " + userID });

        // We can fit 15 cases per page. If the page number is 1, give the first 15 cases. If the page number is 2, give the next 15 cases. etc.
        //.startAt((page - 1) * 15).endAt(page * 15)
        //warnsRef.orderByChild("case_number").startAt((page - 1) * 15).endAt(page * 15).on("child_added", async (snapshot) => {

    
    var warnsRef = ref.child("config").child(userID).child("warnings");
    if (type === null || type === "all") {
        var i = 1;
        warnsRef.orderByChild("case_number").on("child_added", async (snapshot) => {
            if (i <= 15) {
                embed.addFields({
                    name: `Case ${snapshot.val().case_number} - ${snapshot.val().type}`,
                    value: `**Reason:** ${snapshot.val().reason}\n**Moderator:** ${snapshot.val().moderator}\n**Date:** ${snapshot.val().date}\n**Type:** ${snapshot.val().type}, **Duration:** ${snapshot.val().duration}`,
                });
                addedFieldCount++;
                i++;
            }

        })
    }

    await interaction.deferReply();

    await interaction.editReply({ embeds: [embed] });
    if (addedFieldCount !== casenumbers) {
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