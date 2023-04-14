import Command from '../types/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from "../index";
import { ref } from '..';


const botstats: Command = {
	data: new SlashCommandBuilder()
		.setName('botstats')
		.setDescription('Shows bot statistics.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        // interaction.deferReply();
        const numberOfGuilds = client.guilds.cache.size;
        const numberOfUsers = client.users.cache.size;
        const ram1 = process.memoryUsage().heapUsed / 1024 / 1024;
        const ram = Math.round(ram1 * 100) / 100;

        const GuildMemCount = client.guilds.cache.map(guild => guild.memberCount);

        const AllMemCount = GuildMemCount.reduce((a, b) => a + b, 0);

        const uptime = client.uptime;
        const uptimeDays = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const uptimeHours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const uptimeSeconds = Math.floor((uptime % (1000 * 60)) / 1000);
        let uptimePost = "";

        if (uptimeDays > 0) {
            uptimePost = uptimeDays + '.' + uptimeHours + ' Days';
        } else if (uptimeHours > 0) {
            uptimePost = uptimeHours + '.' + uptimeMinutes + ' Hours';
        } else {
            uptimePost = uptimeMinutes + '.' + uptimeSeconds + ' Minutes';
        }

        const numberOfChannels = client.channels.cache.size;
        let numberOfOtterChannels = 0;
        
        const configRef = ref.child("config");
        configRef.orderByValue().on('value', (snapshot) => {
            snapshot.forEach((data) => {
                numberOfOtterChannels += data.val().length;
            })
        });
        const days = Math.floor((Date.now() - new Date("1/20/2022").getTime()) / (1000 * 3600 * 24));
        setTimeout(function(){

        const embed = new MessageEmbed();
		embed.setColor("#00f2ff")
            .setAuthor({ name: "Meowd Statistics", iconURL: client.user.displayAvatarURL()})
            .setDescription("_ _")
            .addFields(
                { name: "📈 Server Statistics", value: "\n• :computer: " + numberOfGuilds + " Servers\n• :bust_in_silhouette: " + AllMemCount + " Users\n• :hash: " + numberOfChannels + " Channels ", inline: true },
                { name: "🤖 Bot Statistics", value: "\n• 💾 " + ram + "mb RAM\n• 🕐 " + uptimePost + " Uptime", inline: true },
            )

        interaction.reply({ embeds: [embed]});
        }, 500);
    }

}

export default botstats;