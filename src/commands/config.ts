import Command from '../types/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { ref } from '..';

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

data.addSubcommandGroup(subcommandGroup =>
	subcommandGroup
		.setName("wordsblacklist")
		.setDescription("Change the words blacklist.")
		// add, remove, or list words. change punishment
		.addSubcommand(subcommand =>
			subcommand
				.setName("add")
				.setDescription("Add a word.")
				.addStringOption(option =>
					option.setName("word")
						.setDescription("The word to add.")
						.setRequired(true)
		))
		.addSubcommand(subcommand =>
			subcommand
				.setName("remove")
				.setDescription("Remove a word.")
					.addStringOption(option =>
						option.setName("word")
							.setDescription("The word to remove.")
							.setRequired(true)
		))
		.addSubcommand(subcommand =>
			subcommand
				.setName("list")
				.setDescription("List words.")
		)
		.addSubcommand (subcommand =>
			subcommand
				.setName("punishment")
				.setDescription("Change the punishment for blacklisted words.")
				.addStringOption(option =>
					option.setName("punishment")
						.setDescription("The punishment to use.")
						.setRequired(true)
						.addChoices(
							{ name: "None", value: "none" },
							{ name: "Warn", value: "warn" },
							{ name: "Mute", value: "mute" },
							{ name: "Kick", value: "kick" },
							{ name: "Ban", value: "ban" }
						)
				)
		)
);



const config: Command = {

	data,
	
	execute: async function (interaction): Promise<void> {
		await interaction.deferReply();
		const subcommand = interaction.options.getSubcommand();
		
        if (!interaction.guild) {return;}

        const guildID = interaction.guild.id;
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
				.setColor("#00f2ff")
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
					.addFields({ name: "Otter Channel Added", value: `<#${channel.id}>` })
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
					.addFields({ name: "Otter Channel Removed", value: `<#${channel.id}>` })
				await interaction.editReply({embeds: [embed]});
			} 
		
			else if (subcommand === "list") {
				const otterChannels = await serverConfigRef.child("otterChannels").get();
				
				const embed = new MessageEmbed()// create embed with otter channels
					.setAuthor({name: "OtterBot", iconURL: "https://cdn.discordapp.com/attachments/590667063165583409/1089047115315032125/icon.png"})
					.setColor("#bee2ff");
				if (otterChannels.exists()) {
					let i = 1;
					for (const [key] of Object.entries(otterChannels.val())) {
						embed.addFields({ name: `Channel #${i}`, value: `<#${key}>` })
						i++;
					}
				}
				else {
					embed.addFields({ name: "Otter Channels", value: "No Otter channels added. Use `/config otterchannels add` to add otter channels." })
				}

				await interaction.editReply({ embeds: [embed] });
			}
		}

		else if (interaction.options.getSubcommandGroup() === "rules") {
			if (subcommand === "add") {
				let n = 1;
				const rule = interaction.options.getString("rule", true);
				if (serverConfigRef.child("rules") === null) { //if rules is null, create it and add the rule
					await serverConfigRef.child("rules").set({
						n: rule
					});
				}
				else { // append to existing list
					const rulesRef = serverConfigRef.child("rules");
					await rulesRef.once("value")
						.then(function(snapshot) {
							n = snapshot.numChildren() + 1;
						});
					await serverConfigRef.child("rules").update({[n]: rule});
				}

				const embed = new MessageEmbed()
					.setTitle("Rule Added")
					.setColor("#00f2ff")
					.setTimestamp()
					.setDescription(`Rule #${n}: ${rule}`);
				await interaction.editReply({ embeds: [embed] });
			} 
			
			else if (subcommand === "remove") {
				const rule = interaction.options.getInteger("rule", true);
				if (serverConfigRef.child("rules").child(rule.toString()) !== null) { // if rule exists in rules, remove it
					const rulesRef = serverConfigRef.child("rules");
				
					// Decrement the key of every element after the removed one
					await rulesRef.once("value", (snapshot) => {
						const data = snapshot.val();
						const newData: {[key: string]: unknown} = {}; // add index signature here
					
						for (const key in data) {
							if (parseInt(key) < rule) {
								newData[key] = data[key];
							} else if (parseInt(key) > rule) {
								newData[(parseInt(key) - 1).toString()] = data[key]; // convert key back to string
							}
						}
					
						// Remove the last element (if any)
						const lastKey = Object.keys(newData).pop();
						if (lastKey && !newData[lastKey]) {
							delete newData[lastKey];
						}
					
						// Update the data with the new values
						rulesRef.set(newData);
					});
				
					const embed = new MessageEmbed()
					.setTitle("Rule Removed")
					.setColor("#00f2ff")
					.setTimestamp()
					.setDescription(`Rule ${rule} removed.`);
					await interaction.editReply({ embeds: [embed] });
				}
			}
			else if (subcommand === "list") {
				// get all rules
				const rules = await serverConfigRef.child("rules").get();
				const embed = new MessageEmbed()// create embed with rules
					.setTitle("Rules")
					.setColor("#00f2ff");
				if (rules.exists()) {
					let i = 1;
					for (const [, value] of Object.entries(rules.val())) {
						const ruleText: string = value as string;
						embed.addFields({ name: `Rule #${i}`, value: ruleText });
						i++;
					}
				}
				else {
					embed.addFields({ name: "Rules", value: "No rules added. Use `/config rules add` to add rules." })
				}
				await interaction.editReply({ embeds: [embed] });
			}
		}

		else if (interaction.options.getSubcommandGroup() === "wordsblacklist") {
			if (subcommand === "add") { // add word to server's word blacklist
				let n = 1;
				const word = interaction.options.getString("word", true);
				if (serverConfigRef.child("blacklistedWords") === null) { //if blacklistedWords is null, create it and add the channel
					await serverConfigRef.child("blacklistedWords").set({
						n: word
					});
				}
				else { // append to existing list
					const blacklistRef = serverConfigRef.child("blacklistedWords");
					await blacklistRef.once("value")
						.then(function(snapshot) {
							n = snapshot.numChildren() + 1;
						});
					await serverConfigRef.child("blacklistedWords").update({[n]: word});
				}

				const embed = new MessageEmbed()
					.setTitle("Word Added to Blacklist")
					.setColor("#00f2ff")
					.setTimestamp()
					.setDescription(`Word ${word} added.`);
				await interaction.editReply({ embeds: [embed] });
			}
			else if (subcommand === "remove") { // remove word from server's word blacklist
				const word = interaction.options.getString("word", true);
				if (serverConfigRef.child("blacklistedWords") !== null) { // if word exists in blacklist, remove it
					const wordsRef = serverConfigRef.child("blacklistedWords");
					await wordsRef.once("value", (snapshot) => {
						const words = snapshot.val();
						const index = words.indexOf(word);
						if (index > -1) {
							words.splice(index, 1);
						}
						wordsRef.set(words);
					});
				}

				const embed = new MessageEmbed()
					.setTitle("Word Removed from Blacklist")
					.setColor("#00f2ff")
					.setTimestamp()
					.setDescription(`Word ${word} removed.`);
				await interaction.editReply({ embeds: [embed] });
			}
			else if (subcommand === "punishment") { // set punishment for word blacklist
				const punishment = interaction.options.getString("punishment", true);
				await serverConfigRef.child("blacklistedWordsPunishment").set(punishment);

				const embed = new MessageEmbed()
					.setTitle("Punishment Set")
					.setColor("#00f2ff")
					.setTimestamp()
					.setDescription(`Blackword violation punishment set to ${punishment}.`);
				await interaction.editReply({ embeds: [embed] });
			}
			else { // list words in server's word blacklist
				const words = await serverConfigRef.child("blacklistedWords").get();
				const embed = new MessageEmbed()// create embed with words
					.setTitle("Blacklisted Words")
					.setColor("#00f2ff");
				if (words.exists()) {
					let i = 1;
					for (const [, value] of Object.entries(words.val())) {
						const wordText: string = value as string;
						embed.addFields({name: `Word #${i}`, value: wordText});
						i++;
					}
				}
				else {
					embed.addFields({name: "Blacklisted Words", value: "No words added. Use `/config wordsblacklist add` to add words."});
				}
				await interaction.editReply({ embeds: [embed] });
			}
		}
	}
};

export default config;