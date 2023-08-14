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
        const title = interaction.options.getString("title", false);
        const description = interaction.options.getString("description", false);
        let color = interaction.options.getString("color", false);
        const footer = interaction.options.getString("footer", false);
        const thumbnail = interaction.options.getAttachment("thumbnail", false);
        const image = interaction.options.getAttachment("image", false);
        const embed = new MessageEmbed();


        if (!title && !description && !footer && !image) {
            interaction.reply({ content: "You must provide at least one of the following: title, description, footer, image.", ephemeral: true });
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
            embed.setColor(`#${color}`);
        }
        if (footer) {
            embed.setFooter({ text: footer });
        }
        if (thumbnail) {
            embed.setThumbnail(thumbnail.url);
        }
        if (image) {
            embed.setImage(image.url);
        }

        interaction.reply({ embeds: [embed] });

    }
}

export default embed;