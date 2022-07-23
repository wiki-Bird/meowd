import Command from '../types/Command';
import { CommandInteraction, MessageEmbed, Message, GuildMember } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from "../index";

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
        const user = interaction.options.getString("user");

        if (user !== null) {
            var userGuildMember;
            var userNamed;
            var userID;

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
        }


        // if interaction not in guild, return:
        if (!interaction.guild) {return;}

        const currentDate = new Date();


        if (userGuildMember instanceof GuildMember) {

            var roleCount = userGuildMember.roles.cache.map((role) => "<@&" + role.id + ">").join(' ');
            roleCount = roleCount.substring(0, roleCount.length - 22);
            const embed = new MessageEmbed();
            embed
                .setColor("#1847bf")
                .setDescription("**" + userNamed.tag + "  -  <@" + userGuildMember.id + ">**")
                .setThumbnail(userGuildMember.user.displayAvatarURL())
                .setFooter({ text: `User info requested by ${interaction.user.tag} ` })
                .addFields(
                    { name: "_ _", value: "_ _"},

                    // { name: "Member Status", value: userGuildMember.roles.cache.has("739098680109879072") ? "Member" : "Not a member", inline: true },
                    
                    // { name: "\u200B", value: "\u200B", inline: false}, //newline

                    { name: "Joined Server", value: userGuildMember.joinedAt!.toLocaleDateString() + "    ", inline: true },
                    { name: "Account Created", value: userNamed.createdAt.toLocaleDateString(), inline: true },
                    
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