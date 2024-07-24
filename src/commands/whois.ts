import Command from '../types/Command';
import { CommandInteraction, MessageEmbed, ColorResolvable, GuildMember } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import validateUser from '../functions/validateUser';
import { createCanvas, loadImage } from 'canvas';

const whois: Command = {
	data: new SlashCommandBuilder()
		.setName('whois')
		.addStringOption(option =>
            option.setName("user")
                .setDescription("The user to investigate, ID or @.")
            )
		.setDescription('Investigates a user.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        await interaction.deferReply();

        // checks if user is mentioned or ID is given:
        const user = interaction.options.getString("user") || interaction.user.id;

        const isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) { return; }
    
        const {userGuildMember, userNamed} = isValidUser;

        // if interaction not in guild, return:
        if (!interaction.guild) {return;}


        if (userGuildMember instanceof GuildMember) {

            let roleCount = userGuildMember.roles.cache.map((role) => "<@&" + role.id + ">").join(' ');
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

            // get which rgba color the user's avatar has the most of:
            const canvas = createCanvas(1, 1);
            const ctx = canvas.getContext('2d');
            const avatar = await loadImage(userGuildMember.user.displayAvatarURL({ format: "png", size: 128 }));
            ctx.drawImage(avatar, 0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            const color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

            embed
                // .setColor("#00f2ff")
                // .setColor(userGuildMember.displayHexColor)
                .setColor(color as ColorResolvable)
                .setDescription("**" + userNamed.tag + "  -  <@" + userGuildMember.id + ">**")
                .setThumbnail(userGuildMember.user.displayAvatarURL())
                .setFooter({ text: `User info requested by ${interaction.user.username} ` })
                .setTimestamp();

            // if user has a role that is (igorning case) "she/her" "he/him" or "they/them", add pronouns to embed:
            if (userGuildMember.roles.cache.some(role => role.name.toLowerCase() === "she/her" || role.name.toLowerCase() === "he/him" || role.name.toLowerCase() === "they/them")) {
                embed.addFields(
                    { name: "Pronouns", value: userGuildMember.roles.cache.filter(role => role.name.toLowerCase() === "she/her" || role.name.toLowerCase() === "he/him" || role.name.toLowerCase() === "they/them").map(role => role.name).join(", "), inline: true },
                )
            }
            embed.addFields(
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

            await interaction.editReply({ embeds: [embed] });
            
        }
	}
}


export default whois;