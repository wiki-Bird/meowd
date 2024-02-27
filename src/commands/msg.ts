import Command from '../types/Command';
import { CommandInteraction, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import validateChannel from '../functions/validateChannel';
import validateGuild from '../functions/validateGuild';

const msg: Command = {
	data: new SlashCommandBuilder()
		.setName('msg')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the message to, #channel.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to send.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("guild")
                .setDescription("The guild to send.")
                .setRequired(false)
        )
		.setDescription('Message a channel as the bot.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        // await interaction.deferReply();

        
        if (interaction.user.id !== "232254618434797570") {
            interaction.reply({ content: "You do not have permission to use this testing command.", ephemeral: true });
            return;
        }

        const channelIn = interaction.options.getString("channel", true);
        const message = interaction.options.getString("message", true);
        let guildIn = interaction.options.getString("guild", false);

        if (!interaction.guild) {return;}

        if (guildIn == null) {
            guildIn = interaction.guild.id;
        }

        // Turn the guildIn into a guild object using ValidateGuild
        const guild = await validateGuild(guildIn, interaction) ?? null;
        if (guild === false) {
            return;
        }
        

        // Turn the channelID into a channel object using ValidateChannel
        const channel = await validateChannel(channelIn, interaction, guild.guild);
        if (channel === false) {
            return;
        }
        if (channel === null) {
            interaction.reply({ content: "You must specify text a channel to message.", ephemeral: true });
            return;
        }
        
        // If guild is specified, send to that guild
        if (guild) {
            // Get the guild
            const guilds = interaction.client.guilds.cache;
            const guildToSend = guilds.find(g => g.id === guild.guildID);
            if (guildToSend === undefined) {
                interaction.reply({ content: "Guild not found.", ephemeral: true });
                return;
            }

            // Get the channel in the guild comparing IDs
            const channels = guildToSend.channels.cache;
            const channelToSend = channels.find(c => c.id === channel.channelID);
            if (channelToSend === undefined) {
                interaction.reply({ content: "Channel not found.", ephemeral: true });
                return;
            }

            (channelToSend as TextChannel).send(message);
        } else {
            // get the channel in the current guild
            const channels = interaction.guild.channels.cache;
            const channelToSend = channels.find(c => c.id === channel.channelID);
            if (channelToSend === undefined) {
                interaction.reply({ content: "Channel not found.", ephemeral: true });
                return;
            }

            (channelToSend as TextChannel).send(message);
        }
        interaction.reply({ content: `Message sent to ${channel.channelName}`, ephemeral: true });

    }
}

export default msg;