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
		embed.setAuthor({ name: "Meowd Help", iconURL: client.user.displayAvatarURL()})
			.setColor("#00f2ff")
            .addFields(
                { name: "/whois", value: "Investigates a given user \n eg: `/whois @user23`, `/whois`" },
                { name: "/poll", value: "Creates a poll \n eg: `/poll Red or Blue?`, `/poll Colour? Red, Blue, Orange`" },
                { name: "/rule", value: "Sends a list of server rules \n eg: `/rule 3`" },
                { name: "/report", value: "Reports a user to the mod team \n eg: `/report @user23 reason`" },
                { name: "/otter", value: "Sends an otter picture \n eg: `/otter 44`, `/otter`" },
                { name: "/config", value: "Configures the bot \n eg: `/config`"},
                { name: "/modlogs", value: "Sends a list of modlogs \n eg: `/modlogs @user23`" },
                { name: "/mute", value: "Mutes a user \n eg: `/mute @user23 reason`" },
                { name: "/unmute", value: "Unmutes a user \n eg: `/unmute @user23 reason`" },
                { name: "/kick", value: "Kicks a user \n eg: `/kick @user23 reason`" },
                { name: "/ban", value: "Bans a user \n eg: `/ban @user23 reason`" },
                { name: "/unban", value: "Unbans a user \n eg: `/unban @user23 reason`" },
                { name: "/warn", value: "Warns a user \n eg: `/warn @user23 reason`" },
                { name: "/purge", value: "Purges a number of messages \n eg: `/purge 10`" },
                { name: "/help", value: "Shows this message! \n eg: `/help`" },
            )

        const row = new MessageActionRow()
			.addComponents(
                new MessageButton()
                    .setLabel('Support')
                    .setStyle('LINK')
                    .setURL('https://github.com'),
			);
			
		const messageId = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    }
}

export default help;