import Command from '../types/Command';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const addroles: Command = {
	data: new SlashCommandBuilder()
		.setName('addroles')
		.addRoleOption(option => option.setName('role').setDescription('The role to add to the user.').setRequired(true))
		.addRoleOption(option => option.setName('role2').setDescription('The role needed to add the primary role to the user.').setRequired(true))
		// .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDescription('If [roles], add role'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		await interaction.reply('Adding roles...');

		const role = interaction.options.getRole('role');
		const roleToCheck = interaction.options.getRole('role2');

		let counterTotal = 0;
		let counterAdded = 0;
		let counterFailed = 0;
		let counterAlreadyHad = 0;
		let counterTrueTotal = 0;

		if (!interaction.guild) {
			await interaction.editReply('This command can only be used in a server.');
			return;
		}
		
		// interaction.guild.members.cache.forEach(async member => {
		// 	// console.log('a')

		// 	// if (counterTotal % 100 == 0) {
		// 	// 	await interaction.editReply(
		// 	// 		`Adding roles... ${counterTotal} members checked, ${counterAdded} added, ${counterFailed} failed, ${counterAlreadyHad} already had the role.`
		// 	// 	);
		// 	// }

		// 	// counterTrueTotal++;

		// 	// // if the member has the secondary role needed to add the primary role
		// 	// if (member.roles.cache.has(roleToCheck!.id)) {
		// 	// 	// if the member does not have the primary role
		// 	// 	// if (!member.roles.cache.has(role!.id)) {
		// 	// 		counterTotal++;
		// 	// 		console.log(counterTotal)
		// 	// 		// convert APIrole to guildRole
		// 	// 		const guildRole = interaction.guild!.roles.cache.get(role!.id);
		// 	// 		// if the guildRole exists
		// 	// 		try{
		// 	// 			if (guildRole) {
		// 	// 				// add the role to the member
		// 	// 				member.roles.add(guildRole);
		// 	// 				counterAdded++;
		// 	// 				console.log("added" + counterAdded)
		// 	// 			}
		// 	// 		} catch (error) {
		// 	// 			counterFailed++;
		// 	// 		}
		// 	// 	//}
		// 	// 	// else {
		// 	// 	// 	counterAlreadyHad++;
		// 	// 	// }
		// 	// }

		// 	// // if this is the last member, send the final message
		// 	// if (counterTrueTotal == interaction.guild!.members.cache.size) {
		// 	// 	await interaction.editReply(`Role ${role!.id} added to ${counterAdded} members out of ${counterTotal} members. ${counterFailed} failed.`); // ${counterAlreadyHad} already had the role.
		// 	// }


		// 	// if a user has a role with ID 

		// });


		// for every member in the server
		for (const member of interaction.guild.members.cache) {

			// if the member has at least one role of id 806991767471259718, 806991904256163850, 808520941159841823, 806991767151837224, 806991901893853255, 812191256297996289
			if (member[1].roles.cache.has('806991767471259718') || member[1].roles.cache.has('806991904256163850') || member[1].roles.cache.has('808520941159841823') || member[1].roles.cache.has('806991767151837224') || member[1].roles.cache.has('806991901893853255') || member[1].roles.cache.has('812191256297996289')) {
				counterTotal++;
				// if the member does not have the role with ID 808961861290033172
				if (!member[1].roles.cache.has('808961861290033172')) {
					// add the role to the member
					try{
						member[1].roles.add('808961861290033172');
						counterAdded++;
					}
					catch (error) {
						counterFailed++;
					}
				}
			}

		}

		await interaction.editReply(`Role ${role!.id} added to ${counterAdded} members out of ${counterTotal} members. ${counterFailed} failed.`); // ${counterAlreadyHad} already had the role.

	}
}

export default addroles;