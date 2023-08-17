import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import Command from '../types/Command';
import { client } from "../index";

const embed: Command = {
    data: new SlashCommandBuilder()
    .setName('embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages | PermissionFlagsBits.Administrator)
    .addStringOption(option =>
        option.setName("title")
            .setDescription("The title of the embed.")
            .setRequired(false)
    )
    .addStringOption(option =>
        option.setName("description")
            .setDescription("The description of the embed.")
            .setRequired(false)
    )
    .addStringOption(option =>
        option.setName("color")
            .setDescription("The color of the embed - hex code.")
            .setRequired(false)
    )
    .addStringOption(option =>
        option.setName("footer")
            .setDescription("The footer of the embed.")
            .setRequired(false)
    )
    .addAttachmentOption(option =>
        option.setName("thumbnail")
            .setDescription("The thumbnail of the embed.")
            .setRequired(false)
    )
    .addAttachmentOption(option =>
        option.setName("image")
            .setDescription("The image of the embed.")
            .setRequired(false)
    )
    .setDescription('Create a custom embed.'),
    execute: async function (interaction) {
        await interaction.deferReply();

        const title = interaction.options.getString("title", false);
        const description = interaction.options.getString("description", false);
        let color = interaction.options.getString("color", false);
        const footer = interaction.options.getString("footer", false);
        const thumbnail = interaction.options.getAttachment("thumbnail", false);
        const image = interaction.options.getAttachment("image", false);
        const embed = new MessageEmbed();


        if (!title && !description && !footer && !image) {
            interaction.editReply({ content: "You must provide at least one of the following: title, description, footer, image." });
            return;
        }

        if (interaction.guild) {
            const guild = client.guilds.cache.get(interaction.guild.id);
            if (guild) {
                embed.setAuthor({ name: guild.name, iconURL: `${guild.iconURL()}` });
            }
        }
        
        if (title) {
            embed.setTitle(title);
        }
        if (description) {
            embed.setDescription(description);
        }
        if (color) {
            if (color.startsWith("#")) {
                color = color.substring(1);
            }
            if (!/^[0-9A-F]{6}$/i.test(color)) { // if color is an invalid hex code. d.js doesn't allow 3/8 digit hex codes.
                interaction.editReply({ content: "Invalid color. Please provide a valid 6 digit hex code." });
                return;
            }
            embed.setColor(`#${color}`);
        }
        if (footer) {
            embed.setFooter({ text: footer });
        }
        if (thumbnail) {
            if (!thumbnail.url.endsWith(".png") && !thumbnail.url.endsWith(".jpg") && !thumbnail.url.endsWith(".jpeg") && !thumbnail.url.endsWith(".gif") && !thumbnail.url.endsWith(".webp")) {
                interaction.editReply({ content: "Invalid Thumbnail: You must specify a jpg, gif, webp, or png image." });
                return;
            }
            embed.setThumbnail(thumbnail.url);
        }
        if (image) {
            if (!image.url.endsWith(".png") && !image.url.endsWith(".jpg") && !image.url.endsWith(".jpeg") && !image.url.endsWith(".gif") && !image.url.endsWith(".webp")) {
                interaction.editReply({ content: "Invalid Image: You must specify a jpg, gif, webp, or png image." });
                return;
            }
            embed.setImage(image.url);
        }

        interaction.editReply({ embeds: [embed] });
    }
}

export default embed;