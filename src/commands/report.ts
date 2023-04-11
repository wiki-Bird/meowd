import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, TextChannel, Guild  } from 'discord.js';
import Command from '../types/Command';
import { client } from "../index";
import validateUser from '../functions/validateUser';
import { ref } from '..';

const report: Command = {
	data: new SlashCommandBuilder()
		.setName('report')
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to report, User ID or @user.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("The reason for the report.")
                .setRequired(true)
        )
        .addChannelOption(option =>  
            option.setName("channel")
                .setDescription("The channel to report the user in, #channel")
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName("image")
                .setDescription("An image to include in the report.")
                .setRequired(false)
        )
		.setDescription('Report a user.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        const user = interaction.options.getString("user", true);
        const reason = interaction.options.getString("reason", true);
        var channel = interaction.options.getChannel("channel");
        const image = interaction.options.getAttachment("image");

        const reportingUser = interaction.user;

        if (!interaction.guild) {return;}
        if (channel === null) {
            channel = interaction.channel!;
        }

        var isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }
        var {userGuildMember, userNamed, userID} = isValidUser;

        var reportEmbed = new MessageEmbed()
            .setColor("#00f2ff")
            .setAuthor({name: `${userNamed.tag} (${userNamed.id}) reported by ${reportingUser.tag}`, iconURL: userNamed.displayAvatarURL()})
            .addFields(
                { name: "Reason:", value: reason},
                { name: "Channel:", value: "<#" + channel.id + ">", inline: true},
                { name: "Date:", value: new Date().toLocaleDateString(), inline: true}
            )
            .setTimestamp();
        
        if (image !== null) {
            reportEmbed.setImage(image.url);
        }
        
        const guild = interaction.guild;
        const guildID = guild.id;

        const serverConfigRef = ref.child("config").child(guildID)
        
        const logChannel = await serverConfigRef.child("logChannel").get();
        const channelID = logChannel.val();

        if (logChannel.exists()) {
            var channelToLog = client.channels.cache.get(channelID) as TextChannel;
        } else {
            console.log("no log channel")
            interaction.reply({ content: "No log channel set so the report cannot be processed. Contact server staff to set up reports.", ephemeral: true });
            return;
        }

        (channelToLog as TextChannel).send({ embeds: [reportEmbed], content: `<@!${reportingUser.id}> reported <@!${userID}>` });
        interaction.reply({ content: `${userNamed.tag} reported to the mod team.`, ephemeral: true });

	}
}

export default report;