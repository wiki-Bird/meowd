import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, Message, GuildMember } from 'discord.js';
import { getSystemErrorMap } from 'util';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import { client } from "../index";
import validateUser from '../functions/validateUser';



const remove: Command = {
	data: new SlashCommandBuilder()
		.setName('remove')
        .addStringOption(option =>
            option.setName("user")
            .setDescription("The user to remove the infration from, ID or @.")
            .setRequired(true)
        )
        .addNumberOption(option =>
            option.setName("case_no")
            .setDescription("The case number to remove.")
            .setRequired(true)
            .setMinValue(1)
        )
		.setDescription('Removes a mod case from a user.'),

	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		const user = interaction.options.getString("user", true);
        var case_no = interaction.options.getNumber("case_no", true);
        const moderator = interaction.user;

        var isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }

        var {userGuildMember, userNamed, userID} = isValidUser;

        if (!interaction.guild) {return;}

        const userConfig = await getUserConfig(userID);
        if (userConfig === null){ return interaction.reply({ content: `User has no logs.`, ephemeral: true }) };


        var checker = false;
        var embed = new MessageEmbed();
        embed.setTitle("Loading...");

        var warnsRef = ref.child("config").child(userID).child("warnings");
        warnsRef.orderByChild("case_number").on("child_added", async (snapshot) => {
            




            if (snapshot.val().case_number === case_no) {

                embed.setTitle(`Case ${case_no} Removed`)
                    .setDescription(`Case ${case_no} has been removed from ${userNamed.tag}`)
                    .setColor("#00ff00")
                    .setTimestamp()
                    .addField("Original reason:", snapshot.val().reason, true)
                    .addField("Original Date:", snapshot.val().date, true)
                    .addField("Original Moderator:", moderator.tag, true)
                    .setFooter({text: "Case removed by " + moderator.tag});

                await warnsRef.child(snapshot.key!).remove();
                // decrement cases by 1
                var casesRef = ref.child("config").child(userID).child("cases");
                casesRef.once("value", (snapshot) => {
                    var cases = snapshot.val() - 1;
                    casesRef.set(cases);
                });
                await interaction.reply({embeds: [embed]});
                checker = true;
            }
            
        })

        if (!checker) {
            await interaction.reply({ content: `Case ${case_no} not found.` + " Use `/modlog @" + userNamed.username + "` to check cases.", ephemeral: true });
        }


	}
}

export default remove;