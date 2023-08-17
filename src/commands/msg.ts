import Command from '../types/Command';
import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const msg: Command = {
	data: new SlashCommandBuilder()
		.setName('msg')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the message to, #channel.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to send.")
                .setRequired(true)
        )
		.setDescription('Message a channel as the bot.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        await interaction.deferReply();

        
        if (interaction.user.id !== "232254618434797570") {
            interaction.reply({ content: "You do not have permission to use this testing command.", ephemeral: true });
            return;
        }

        const channel = interaction.options.getChannel("channel", true);
        const message = interaction.options.getString("message", true);

        if (!interaction.guild) {return;}
        if (channel === null || !(channel instanceof TextChannel)) {
            interaction.reply({ content: "You must specify text a channel to message.", ephemeral: true });
        }

        (channel as TextChannel).send(message);
        interaction.reply({ content: `Message sent to ${channel.name}`, ephemeral: true });

    }
}

export default msg;