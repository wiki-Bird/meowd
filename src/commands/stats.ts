import Command from '../types/Command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import * as overwatch from 'overwatch-api';

const data = new SlashCommandBuilder() 
	.setName('stats')
	.setDescription('Check your stats across various videogames.');

data.addSubcommand(subcommand =>
	subcommand
		.setName("overwatch")
		.setDescription("Get your Overwatch 2 stats.")
		.addStringOption(option =>
			option.setName("battletag")
			.setDescription("Your Overwatch 2 battletag, eg Name#1234.")
			.setRequired(true)
			)
			.addStringOption(option =>
				option.setName("platform")
					.setDescription("The platform you play on.")
					.setRequired(false)
					.addChoices(
						{ name: "PC", value: "pc" },
						{ name: "PlayStation", value: "psn" },
						{ name: "Xbox", value: "xbl" },
					)
			)
		.addStringOption(option =>
			option.setName("region")
				.setDescription("The region you play in.")
				.setRequired(false)
				.addChoices(
					{ name: "US", value: "us" },
					{ name: "EU", value: "eu" },
					{ name: "KR", value: "kr" },
					{ name: "CN", value: "cn" },
					{ name: "Global", value: "global" },
				)
		)
)




const stats: Command = {

	data,
	
	execute: async function (interaction): Promise<void> {
		await interaction.deferReply();
		const subcommand = interaction.options.getSubcommand();
		
        if (!interaction.guild) {return;}

		
		const embed = new MessageEmbed()
			.setTimestamp()
			.addFields(
				{ name: "Ranks:", value: "Loading...", inline: true },
				{ name: "Playtime:", value: "Loading...", inline: true },
				{ name: "_ _", value: "_ _" },
				{ name: "Winrate:", value: "Loading...", inline: true },
				{ name: "Best Heroes:", value: "Loading...", inline: true },
			)
			.setFooter({ text: "Overwatch 2 Stats from /stats", iconURL: "https://i.imgur.com/HKiAsth.png" });
		
		const embedLoading = new MessageEmbed()
			.setAuthor({ name: "Loading...", iconURL: "https://i.imgur.com/fMqUG5J.gif" })
			.setColor("#00f2ff");
		
		const embedError = new MessageEmbed()
			.setTimestamp()


		if (subcommand === "overwatch") {
			embed.setColor("#ed6516");
			embedLoading.setColor("#ed6516");
			embedError.setColor("#ed6516");

			let platform = interaction.options.getString("platform", false);
			if (platform === null) {
				platform = "pc";
			}
			let region = interaction.options.getString("region", false);
			if (region === null) {
				region = "global";
			}
			const battletag = interaction.options.getString("battletag", true);
			let battleTagNew: string;

			// check if battletag is valid format; eg: Name#1234, Name2#12345
			const battletagRegex = /^[a-zA-Z0-9]+#[0-9]{4,5}$/;
			if (!battletagRegex.test(battletag)) {
				await interaction.editReply("Invalid battletag format. Please use the format Name#1234.");
				return;
			}
			else {
				battleTagNew = battletag.replace("#", "-");
			}

			await interaction.editReply({ embeds: [embedLoading] });

			let playerPortrait;
			let privateProfile;

			let playerRankDPS: string = "N/A";
			let playerRankTank: string = "N/A";
			let playerRankSupport: string = "N/A";

			let playtimeComp;
			let playtimeQuickplay;
			let playtimeTotal;

			let endorsementLevel;
			let endorsementTemp;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			let endorsementIcon: string;

			let winsQuickplay;
			let lossesQuickplay;
			let winrateQuickplay;

			let winsComp;
			let lossesComp;
			let winrateComp;

			let winsTotal;
			let lossesTotal;
			let winRateTotal;

			let playtimeCompHours;
			let playtimeQuickplayHours;

			let endorsementIconPng: string;

			// overwatch.getProfile(platform, region, tag, (err, json) => {
			overwatch.getProfile(platform as OverwatchAPI.PLATFORM, region as OverwatchAPI.REGION, battleTagNew, (err, json) => {
				if (err){
					// console.error(err);
					embedError.setAuthor({ name: err.toString(), iconURL: "https://i.imgur.com/HKiAsth.png" })
					embedError.setDescription("An error occurred while trying to fetch your stats. Please check your region, platform and battletag, or try again later.");
					interaction.editReply({ embeds: [embedError] });
					return;
				}
				else {
					console.log(json);
					playerPortrait = json.portrait;
					privateProfile = json.private;
					endorsementTemp = json.endorsement.toString();

					// get the charecter before "-" in endorsementTemp
					const endorsementLevelTemp = endorsementTemp.split("-")[0];
					// get last character of endorsementLevelTemp
					endorsementLevel = parseInt(endorsementLevelTemp.charAt(endorsementLevelTemp.length - 1));
					// endorsementLevel = ;endorsementLevelTemp)


					if (endorsementLevel === 1){
						endorsementIcon = "<:e1:1096200935040110643>"
						endorsementIconPng = "https://i.imgur.com/GtxwFUB.png"
					}
					else if (endorsementLevel === 2){
						endorsementIcon = "<:e2:1096200938777231492>"
						endorsementIconPng = "https://i.imgur.com/LnoPELu.png"
					}
					else if (endorsementLevel === 3){
						endorsementIcon = "<:e3:1096200940652068976>"
						endorsementIconPng = "https://i.imgur.com/WjhHu2E.png"
					}
					else if (endorsementLevel === 4){
						endorsementIcon = "<:e4:1096201404160413758>"
						endorsementIconPng = "https://i.imgur.com/GyZTZK2.png"
					}
					else if (endorsementLevel === 5){
						endorsementIcon = "<:e5:1096210201780158598>"
						endorsementIconPng = "https://i.imgur.com/hKTkPLE.png"
					}
					else {
						endorsementIcon = "⚠️"
						endorsementIconPng = "https://em-content.zobj.net/thumbs/120/twitter/322/warning_26a0-fe0f.png"
					}
					

					console.log(json.endorsement)
					embed.setAuthor({ name: `${battletag}`, iconURL: endorsementIconPng, url: `https://overwatch.blizzard.com/en-us/career/${battleTagNew}` }); //https://i.imgur.com/HKiAsth.png
					embed.setThumbnail(playerPortrait);

					if (privateProfile){
						// embed.setDescription("This profile is private.");
						// clear fields:
						embed.spliceFields(0, 5, { name: "This profile is private.", value: "No information can be displayed." });
						interaction.editReply({ embeds: [embed] });
						return;
					}

					// offense exists, but TS doesn't know that so we have to use @ts-ignore.
					// However, now eslint is complaining, so we have to disable that too.
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					if (json.competitive.offense && json.competitive.offense.rank) {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore
						playerRankDPS = json.competitive.offense.rank.toString();
					}
					if (json.competitive.tank && json.competitive.tank.rank) {
						playerRankTank = json.competitive.tank.rank.toString();
					} 
					if (json.competitive.support && json.competitive.support.rank) {
						playerRankSupport = json.competitive.support.rank.toString();
					}
					
					// playerRankSupportIcon = json.competitive.support.icon;
					
					playtimeComp = json.playtime.competitive;
					playtimeQuickplay = json.playtime.quickplay;
					

					playtimeCompHours = playtimeComp.split(":")[0].toString() + "." + playtimeComp.split(":")[1].toString() + "hrs";
					playtimeQuickplayHours = playtimeQuickplay.split(":")[0].toString() + "." + playtimeQuickplay.split(":")[1].toString() + "hrs";
					playtimeTotal = parseInt(playtimeComp.split(":")[0]) + parseInt(playtimeQuickplay.split(":")[0]) + (parseInt(playtimeComp.split(":")[1]) / 60) + (parseInt(playtimeQuickplay.split(":")[1]) / 60);



					winsComp = json.games.competitive.won;
					lossesComp = json.games.competitive.lost;
					// winrateComp = json.games.competitive.win_rate; // NO LONGER SUPPORTED
					winrateComp = winsComp / (json.games.competitive.played!) * 100;

					winsQuickplay = json.games.quickplay.won;
					lossesQuickplay = json.games.quickplay.played! - winsQuickplay;
					winrateQuickplay = winsQuickplay / (json.games.quickplay.played!) * 100;

					winsTotal = winsComp + winsQuickplay;
					lossesTotal = lossesComp + lossesQuickplay;
					winRateTotal = winsTotal / (json.games.quickplay.played! + json.games.competitive.played!) * 100;


					embed.setDescription("_ _");

					embed.spliceFields(0, 1, {
						name: `Ranks:`, 
						value: `
							<:tank:1096258995108450355> **Tank:** ${playerRankTank}_ _\n<:dps:1096258990096265266> **DPS:** ${playerRankDPS}_ _\n<:support:1096258993283944589> **Supp:** ${playerRankSupport}_ _`,
						inline: true
					})
					embed.spliceFields(1, 1, {
						name: `Playtime:`,
							value: ` 
							<:quickplay:1096265136479678524> **QP:  ** ${playtimeQuickplayHours}
							<:comp:1096265140011290675> **Comp:** ${playtimeCompHours}
							🕙 **Total:** ${playtimeTotal.toFixed(2)}hrs`,
							inline: true
					})
					embed.spliceFields(3, 1, {
						name: "Winrate:", value: `
						<:quickplay:1096265136479678524> **QP:  ** ${winsQuickplay}:${lossesQuickplay} (${winrateQuickplay.toFixed(0)}%)_ _
						<:comp:1096265140011290675> **Comp:** ${winsComp}:${lossesComp} (${winrateComp.toFixed(0)}%)_ _
						🔖 **Total:** ${winsTotal}:${lossesTotal} (${winRateTotal.toFixed(0)}%)`
						, 
						inline: true 
					})

					interaction.editReply({ embeds: [embed] });
				}

			});

			overwatch.getStats(platform as OverwatchAPI.PLATFORM, region as OverwatchAPI.REGION, battleTagNew, (err, json) => {
				if (err){
					embedError.setAuthor({ name: err.toString(), iconURL: "https://i.imgur.com/HKiAsth.png" })
					embedError.setDescription("An error occurred while trying to fetch your stats. Please check your region, platform and battletag, or try again later.");
					interaction.editReply({ embeds: [embedError] });
					return;
				}
				interface heroStats {
					[key: string]: any;
				}

				const privateProfile = json.private;

				if (privateProfile){
					embed.setDescription("This profile is private!");
					// clear fields:
					embed.spliceFields(0, 4, { name: "_ _", value: "No information can be displayed." });
					interaction.editReply({ embeds: [embed] });
					return;
				}

				console.log(json.stats)

				const playtimeComp = json.stats.top_heroes.competitive.played;
				// const playtimeQuickplay = json.stats.top_heroes.quickplay.played;
				const winrateComp = json.stats.top_heroes.competitive.win_rate;
				// best hero is the one with the highest winrate * playtime
				// get the highest winrate * playtime, knowing that .played and .win_rate are not in the same order
				// start by saving things like this: "hero1": [winrateComp, winrateQP, playtimeComp, playtimeQP]
				const heroStats = new Object() as heroStats;


				for (let i=0; i<playtimeComp.length; i++){
					const heroName = playtimeComp[i].hero;
					let heroPlaytimeComp;
					// convert playtime to minutes, its currently hrs:mins:secs as a string, so split it and convert to int
					// playtime can be less than 1hr, and if this is the case its just mins:secs, so check for that
					if (playtimeComp[i].played.split(":").length == 2){
						heroPlaytimeComp = parseInt(playtimeComp[i].played.split(":")[0]) + parseInt(playtimeComp[i].played.split(":")[1]) / 60;
					} else {
						heroPlaytimeComp = parseInt(playtimeComp[i].played.split(":")[0]) * 60 + parseInt(playtimeComp[i].played.split(":")[1]);
					}

					// var heroPlaytimeComp = parseInt(playtimeComp[i].played.split(":")[0]) * 60 + parseInt(playtimeComp[i].played.split(":")[1]);
					heroStats[heroName] = [heroPlaytimeComp];
				}

				for (let i=0; i<winrateComp.length; i++){
					const heroName = winrateComp[i].hero;
					// remove the % at the end of the string
					const heroWinrateComp = parseInt(winrateComp[i].win_rate.slice(0, winrateComp[i].win_rate.length - 1));
					heroStats[heroName].push(heroWinrateComp);
				}

				console.log(heroStats);

				// now that we have all the data, we can calculate the best 3 heroes
				const bestHeroes = [];
				const bestHeroScores = [];
				for (const hero in heroStats){
					const heroScore = heroStats[hero][0] * (heroStats[hero][1] * 10);
					if (bestHeroScores.length < 3){
						bestHeroes.push(hero);
						bestHeroScores.push(heroScore);
					}
					else {
						// if the current hero has a higher score than any of the 3 best heroes, replace it and sort the array
						if (heroScore > bestHeroScores[0]){
							bestHeroScores[0] = heroScore;
							bestHeroes[0] = hero;
							bestHeroScores.sort((a, b) => b - a);
							bestHeroes.sort((a, b) => heroStats[b][0] - heroStats[a][0]);
						}
					}
				}

				console.log(bestHeroes);
				console.log(bestHeroScores);

				if (bestHeroes.length > 0 || bestHeroes[0] != undefined){
					embed.spliceFields(4, 1, {
						name: "Best Heroes:",
						value: `
						1️⃣ ${bestHeroes[0]}
						2️⃣ ${bestHeroes[1]}
						3️⃣ ${bestHeroes[2]}
						`,
						inline: true
					})
				}

				// add empty fields to fill the embed
				// embed.spliceFields(5, 1, { name: "_ _", value: "_ _", inline: false });


				interaction.editReply({ embeds: [embed] });
			});



		}
	}
}

export default stats;