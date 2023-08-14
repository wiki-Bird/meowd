import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
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
                { name: "Commands", value: "[Get a full list of bot commands](https://meowd.ramiels.me/commands)"},
                { name: "Need help?", value: "[Check out the setup guide](https://meowd.ramiels.me/guide) **(COMING SOON)**"},
                { name: "Some helpful commands", value: "`/poll`, `/report`, `/rule`, `/whois`, `/otter`, `/modlogs`, `/config`"},
            )
        const row = new MessageActionRow()
			.addComponents(
                new MessageButton()
                    .setLabel('Support')
                    .setStyle('LINK')
                    .setURL('https://meowd.ramiels.me/'),
			);
			
		await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    }
}

export default help;