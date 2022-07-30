import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { MessageActionRow, MessageButton, TextChannel, Guild } from 'discord.js';
import Command from '../types/Command';
import { client } from "../index";
import validateUser from '../functions/validateUser';

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
		.setDescription('Report a user.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        const user = interaction.options.getString("user", true);
        const reason = interaction.options.getString("reason", true);
        var channel = interaction.options.getChannel("channel");

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
            .setColor("#ff0000")
            .setAuthor({name: `${userNamed.tag} (${userNamed.id}) reported by ${reportingUser.tag}`, iconURL: userNamed.displayAvatarURL()})
            .addFields(
                { name: "Reason:", value: reason},
                { name: "Channel:", value: "<#" + channel.id + ">", inline: true},
                { name: "Date:", value: new Date().toLocaleDateString(), inline: true}
            )
            .setTimestamp();
        
        const channelToSend = client.channels.cache.get('575434603607621695') as TextChannel;
        const guild = client.guilds.cache.get('575434603607621695') as Guild;
        (channel as TextChannel).send({ embeds: [reportEmbed], content: `<@!${reportingUser.id}> reported <@!${userID}>` });
        interaction.reply({ content: `${userNamed.tag} reported to the mod team.`, ephemeral: true });

	}
}

export default report;