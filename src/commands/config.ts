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
		
		// if there is a subcommand group, get it
		// var subcommandGroup = interaction.options.getSubcommandGroup();


        if (!interaction.guild) {return;}

        var guildID = interaction.guild.id;
		const configRef = ref.child("config");

		const serverConfigRef = configRef.child(guildID);
        if (serverConfigRef === null) {
            console.log("new server")
            await configRef.child(guildID).set({ // empty
            });
        }

		if (subcommand === "logchannel") {
			const channel = interaction.options.getChannel("channel", true);
			await serverConfigRef.child("logChannel").set(channel.id);
			const embed = new MessageEmbed()
				.setTitle("Log Channel")
				.setColor("#69fcfd")
				.setTimestamp()
				.setDescription(`Log channel set to <#${channel.id}>`);
			await interaction.editReply({ embeds: [embed] });
		}
		else if (interaction.options.getSubcommandGroup() === "otterchannels") {
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
				if (serverConfigRef.child("otterChannels").child(channel.id) !== null){ // if channel exists in otterChannels, remove it
					await serverConfigRef.child("otterChannels").child(channel.id).remove();
				}
	
				const embed = new MessageEmbed()
					.setAuthor({name: "OtterBot", iconURL: "https://cdn.discordapp.com/attachments/590667063165583409/1089047115315032125/icon.png"})
					.setColor("#bee2ff")
					.addField("Otter Channel Removed", `<#${channel.id}>`);
				await interaction.editReply({embeds: [embed]});
			} 
			else if (subcommand === "list") {
				const otterChannels = await serverConfigRef.child("otterChannels").get();
				
				const embed = new MessageEmbed()// create embed with otter channels
					.setAuthor({name: "OtterBot", iconURL: "https://cdn.discordapp.com/attachments/590667063165583409/1089047115315032125/icon.png"})
					.setColor("#bee2ff");
				if (otterChannels.exists()) {
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

		else if (interaction.options.getSubcommandGroup() === "rules") {
			if (subcommand === "add") {
				var n = 1;
				const rule = interaction.options.getString("rule", true);
				if (serverConfigRef.child("rules") === null) { //if rules is null, create it and add the rule
					await serverConfigRef.child("rules").set({
						n: rule
					});
				}
				else { // append to existing list
					// serverConfigRef.child("rules").ref.once("value").then(function(snapshot) {
					// 	n = snapshot.numChildren() + 1;
					// })
					var rulesRef = serverConfigRef.child("rules");
					await rulesRef.once("value")
						.then(function(snapshot) {
							n = snapshot.numChildren() + 1;
						});


					var nNew = n.toString();
					await serverConfigRef.child("rules").update({[n]: rule});
				}

				const embed = new MessageEmbed()
					.setTitle("Rule Added")
					.setColor("#69fcfd")
					.setTimestamp()
					.setDescription(`Rule #${n}: ${rule}`);
				await interaction.editReply({ embeds: [embed] });
			} 
			else if (subcommand === "remove") {
				const rule = interaction.options.getInteger("rule", true);
				if (serverConfigRef.child("rules").child(rule.toString()) !== null){ // if rule exists in rules, remove it
					await serverConfigRef.child("rules").child(rule.toString()).remove();
					// decrement all rules after the removed rule
					const rules = await serverConfigRef.child("rules").get();
					var i = 1;
					for (const [key, value] of Object.entries(rules.val())) {
						if (i > rule) {
							await serverConfigRef.child("rules").child(i.toString()).set(value);
							await serverConfigRef.child("rules").child((i+1).toString()).remove();
						}
						i++;
					}
				}
			} 
			else if (subcommand === "list") {
				// get all rules
				const rules = await serverConfigRef.child("rules").get();
				const embed = new MessageEmbed()// create embed with rules
					.setTitle("Rules")
					.setColor("#69fcfd");
				if (rules.exists()) {
					var i = 1;
					for (const [key, value] of Object.entries(rules.val())) {
						// embed.addField(`Rule #${key}`, value);
						console.log(key, value);
						i++;
					}
				}
				else {
					embed.addField("Rules", "No rules added. Use `/config rules add` to add rules.");
				}
			}
		}

	}
};

export default config;