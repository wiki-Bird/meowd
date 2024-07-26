// if user banned

import { client } from "../index";
import { MessageEmbed, TextChannel, GuildBan  } from 'discord.js';
import Event from '../types/Event';
import { ref } from '..';

// const guildBanAdd: Event = {
const guildBanAdd: Event<[GuildBan]> = {
    name: 'guildBanAdd',
    execute: async function (ban: GuildBan) {
        let channelToSend;
        const guild = ban.guild;
        let reasonGiven = "No reason given.";


        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD'
        });
        const latestBan = fetchedLogs.entries.first();

        if (!latestBan) return console.log(`${ban.user.username} was banned from ${ban.guild.name} but no audit log could be found.`);

        const { executor, reason } = latestBan;


        if (reason !== null && reason !== undefined) {
            reasonGiven = reason!;
        }

        const guildID = guild.id;

        const serverConfigRef = ref.child("config").child(guildID)
        
        const logChannel = await serverConfigRef.child("logChannel").get();
        const channelID = logChannel.val();

        if (logChannel.exists()) {
            channelToSend = client.channels.cache.get(channelID) as TextChannel;
        } else {
            console.log("no log channel")
            return;
        }
        
        const logEmbed = new MessageEmbed()
            .setColor("#ff0000")
            .setAuthor({name: `${ban.user.username} (ID: ${ban.user.id}) was banned.`, iconURL: ban.user.displayAvatarURL()})
            .addFields(
                { name: "Reason:", value: reasonGiven},
                { name: "Banned by:", value: executor!.username, inline: true},
                { name: "Date:", value: new Date().toLocaleDateString(), inline: true}
            )
            .setTimestamp();

        channelToSend.send({embeds: [logEmbed]});
        
    }
}

export default guildBanAdd;