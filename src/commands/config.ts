import Command from '../types/Command';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { client } from "../index";
import { ref } from '..';
import validateUser from '../functions/validateUser';

// const subCommandLogChannel = new SlashCommandSubcommandBuilder()
// 	.setName("logchannel")
// 	.setDescription("Change the log channel.")
// 	.addChannelOption(option =>
// 		option.setName("channel")
// 			.setDescription("The channel to log to.")
// 			.setRequired(true)
// 	);
	
// const subCommandOtterChannelsAdd = new SlashCommandSubcommandBuilder()

const data = new SlashCommandBuilder() 
	.setName('config')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDescription('Change server settings.');

data.addSubcommand(subcommand =>
	subcommand
		.setName("logchannel")
		.setDescription("Change the log channel.")
		.addChannelOption(option =>
			option.setName("channel")
				.setDescription("The channel to log to.")
				.setRequired(true)
		)
)

data.addSubcommandGroup(subcommandGroup =>
	subcommandGroup
		.setName("otterchannels")
		.setDescription("Change the otter channels.")
		// add, remove, or list otter channels
		.addSubcommand(subcommand =>
			subcommand
				.setName("add")
				.setDescription("Add an otter channel.")
				.addChannelOption(option =>
					option.setName("channel")
						.setDescription("The channel to add.")
						.setRequired(true)
		))
		.addSubcommand(subcommand =>
			subcommand
				.setName("remove")
				.setDescription("Remove an otter channel.")
				.addChannelOption(option =>
					option.setName("channel")
						.setDescription("The channel to remove.")
						.setRequired(true)
		))
		.addSubcommand(subcommand =>
			subcommand
				.setName("list")
				.setDescription("List otter channels.")
		)
)

data.addSubcommandGroup(subcommandGroup =>
	subcommandGroup
		.setName("rules")
		.setDescription("Change the rules.")
		// add, remove, or list rules
		.addSubcommand(subcommand =>
			subcommand
				.setName("add")
				.setDescription("Add a rule.")
				.addStringOption(option =>
					option.setName("rule")
						.setDescription("The rule to add.")
						.setRequired(true)
		))
		.addSubcommand(subcommand =>
			subcommand
				.setName("remove")
				.setDescription("Remove a rule.")
					.addIntegerOption(option =>
						option.setName("rule")
							.setDescription("The rule to remove.")
							.setRequired(true)
		))
		.addSubcommand(subcommand =>
			subcommand
				.setName("list")
				.setDescription("List rules.")
		)
);


const config: Command = {

	data,
	
	execute: async function (interaction): Promise<void> {
		await interaction.deferReply();
		const subcommand = interaction.options.getSubcommand();
		const subcommandGroup = interaction.options.getSubcommandGroup();

        if (!interaction.guild) {return;}

        var guildID = interaction.guild.id;
		const configRef = ref.child("config");

		const serverConfigRef = configRef.child(guildID);
        if (serverConfigRef === null) {
            console.log("new server")
            await configRef.child(guildID).set({ // empty
            });
        }

		if (subcommandGroup === "otterchannels") {
			if (subcommand === "add") {
				const channel = interaction.options.getChannel("channel", true);
				if (serverConfigRef.child("otterChannels") === null) { //if otterChannels is null, create it and add the channel
					await serverConfigRef.child("otterChannels").set({
						[channel.id]: channel.name
					});
				}
				else { // append to existing list
					await serverConfigRef.child("otterChannels").update({
						[channel.id]: channel.name
					});
				}
				const embed = new MessageEmbed()
					.setAuthor({name: "OtterBot", iconURL: "https://cdn.discordapp.com/attachments/590667063165583409/1089047115315032125/icon.png"})
					.setColor("#bee2ff")
					.addField("Otter Channel Added", `<#${channel.id}>`);
				await interaction.editReply({embeds: [embed]});
			} 
			else if (subcommand === "remove") {
				const channel = interaction.options.getChannel("channel", true);
				await serverConfigRef.child("otterChannels").child(channel.id).remove();
				const embed = new MessageEmbed()
					.setAuthor({name: "OtterBot", iconURL: "https://cdn.discordapp.com/attachments/590667063165583409/1089047115315032125/icon.png"})
					.setColor("#bee2ff")
					.addField("Otter Channel Removed", `<#${channel.id}>`);
				await interaction.editReply({embeds: [embed]});
			} 
			else if (subcommand === "list") {
				const otterChannels = await serverConfigRef.child("otterChannels").get();
				// create embed with otter channels
				const embed = new MessageEmbed()
					.setAuthor({name: "OtterBot", iconURL: "https://cdn.discordapp.com/attachments/590667063165583409/1089047115315032125/icon.png"})
					.setColor("#bee2ff");
				if (otterChannels.exists()) {
					// embed.addField("Otter Channels", Object.values(otterChannels.val()).join("\n"));
					var i = 1;
					for (const [key, value] of Object.entries(otterChannels.val())) {
						embed.addField(`Channel #${i}`, `<#${key}>`);
						i++;
					}
				}
				else {
					embed.addField("Otter Channels", "No Otter channels added. Use `/config otterchannels add` to add otter channels.");
				}	
				await interaction.editReply({ embeds: [embed] });
			}
		}
		else if (subcommandGroup === "rules") {
			if (subcommand === "add") {
				const rule = interaction.options.getString("rule", true);
			} 
			else if (subcommand === "remove") {
				const rule = interaction.options.getInteger("rule", true);
			} 
			else if (subcommand === "list") {
				const embed = new MessageEmbed()
					.setTitle("Rules")
					.setDescription("These are the rules.");
				await interaction.editReply({ embeds: [embed] });
			}
		}
		else if (subcommand === "logchannel") {
			const channel = interaction.options.getChannel("channel", true);
		}
	}
};

export default config;