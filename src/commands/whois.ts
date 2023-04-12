import Command from '../types/Command';
import { CommandInteraction, MessageEmbed, Message, GuildMember } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import validateUser from '../functions/validateUser';

const whois: Command = {
	data: new SlashCommandBuilder()
		.setName('whois')
		.addStringOption(option =>
            option.setName("user")
                .setDescription("The user to investigate, ID or @.")
            )
		.setDescription('Investigates a user.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        // checks if user is mentioned or ID is given:
        const user = interaction.options.getString("user") || interaction.user.id;

        var isValidUser = await validateUser(user, interaction, true);

        if (!isValidUser) {
            return;
        }
    
        var {userGuildMember, userNamed, userID} = isValidUser;

        // if interaction not in guild, return:
        if (!interaction.guild) {return;}


        if (userGuildMember instanceof GuildMember) {

            var roleCount = userGuildMember.roles.cache.map((role) => "<@&" + role.id + ">").join(' ');
            roleCount = roleCount.substring(0, roleCount.length - 22);
            if (roleCount.length <= 0) {
                roleCount = "No roles";
            }
            const embed = new MessageEmbed();
            const timeOptions = {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            } as const;
            embed
                .setColor("#00f2ff")
                .setDescription("**" + userNamed.tag + "  -  <@" + userGuildMember.id + ">**")
                .setThumbnail(userGuildMember.user.displayAvatarURL())
                .setFooter({ text: `User info requested by ${interaction.user.tag} ` })
                .setTimestamp()
                .addFields(
                    { name: "_ _", value: "_ _"},

                    // { name: "Member Status", value: userGuildMember.roles.cache.has("739098680109879072") ? "Member" : "Not a member", inline: true },
                    
                    // { name: "\u200B", value: "\u200B", inline: false}, //newline

                    { name: "Joined Server", value: userGuildMember.joinedAt!.toLocaleDateString("en-US", timeOptions) + "_      _", inline: true },
                    { name: "Account Created", value: userNamed.createdAt.toLocaleDateString("en-US", timeOptions), inline: true },
                    
                    { name: "Roles", value: roleCount},

                    { name: "Nickname", value: userGuildMember.nickname || "None", inline: true },
                    { name: "ID", value: userGuildMember.id, inline: true },

                    { name: "_ _", value: "_ _"},
                    
                );

            await interaction.reply({ embeds: [embed] });
            
        }
	}
}


export default whois;