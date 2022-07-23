import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import Command from '../types/Command';
import { client } from "../index";

const help: Command = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Sends a list of server commands.'),
    execute: async function (interaction) {
        const embed = new MessageEmbed();
		embed.setAuthor({ name: "Pak-man Help", iconURL: client.user.displayAvatarURL()})
			.setColor("#1847bf")
            .addFields(
                { name: "/whois", value: "Investigates a given user \n eg: `/whois @user23`, `/whois`" },
                { name: "/poll", value: "Creates a poll \n eg: `/poll Red or Blue?`, `/poll Colour? Red, Blue, Orange`" },
                { name: "/rule", value: "Sends a list of server rules \n eg: `/rule 3`" },
                { name: "/ping", value: "Shows bot latency \n eg: `/ping`" },
                { name: "/help", value: "Shows this message! \n eg: `/help`" },
            )


        const row = new MessageActionRow()
			.addComponents(
				// new MessageButton()
				// 	.setCustomId('overview')
				// 	.setLabel('Overview')
				// 	.setStyle('PRIMARY'),
                new MessageButton()
                    .setLabel('Support')
                    .setStyle('LINK')
                    .setURL('https://github.com'),
			);
			
		const messageId = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    }
}

export default help;