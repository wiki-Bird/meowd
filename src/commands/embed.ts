import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
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
        var title = interaction.options.getString("title", false);
        var description = interaction.options.getString("description", false);
        var color = interaction.options.getString("color", false);
        var footer = interaction.options.getString("footer", false);
        var thumbnail = interaction.options.getAttachment("thumbnail", false);
        var image = interaction.options.getAttachment("image", false);
        var embed = new MessageEmbed();

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