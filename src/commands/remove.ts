import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import validateUser from '../functions/validateUser';
import { PermissionFlagsBits } from 'discord-api-types/v9';


const remove: Command = {
    data: new SlashCommandBuilder()
    .setName('remove')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator)
    
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
        const case_no = interaction.options.getNumber("case_no", true);
        const moderator = interaction.user;

        const isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }

        const {userGuildMember, userNamed, userID} = isValidUser;

        if (!interaction.guild) {return;}

        const guildID = interaction.guild.id;

        const userConfig = await getUserConfig(userID, guildID);
        if (userConfig === null) return interaction.reply({ content: `User has no logs.`, ephemeral: true })


        let checker = false;
        const embed = new MessageEmbed();
        embed.setTitle("Loading...");

        const warnsRef = ref.child("config").child(userID).child("warnings");
        warnsRef.orderByChild("case_number").on("child_added", async (snapshot) => {

            if (snapshot.val().case_number === case_no) {

                embed.setTitle(`Case ${case_no} Removed`)
                    .setDescription(`Case ${case_no} has been removed from ${userNamed.tag}`)
                    .setColor("#00f2ff")
                    .setTimestamp()
                    .addField("Original reason:", snapshot.val().reason, true)
                    .addField("Original Date:", snapshot.val().date, true)
                    .addField("Original Moderator:", moderator.tag, true)
                    .setFooter({text: "Case removed by " + moderator.tag});

                await warnsRef.child(snapshot.key!).remove();
                // decrement cases by 1
                const casesRef = ref.child("config").child(userID).child("cases");
                
                casesRef.once("value", async (snapshot) => {
                    casesRef.set(snapshot.val() - 1);
                });

                await interaction.reply({embeds: [embed]});
                checker = true;
            }
            
        })

        // wait 8s for checker to be true
        setTimeout(() => {
            if (!checker && interaction.replied === false) {
                interaction.reply({ content: `Case ${case_no} not found.` + " Use `/modlog @" + userNamed.username + "` to check cases.", ephemeral: true });
            }
        }, 8000);


	}
}

export default remove;