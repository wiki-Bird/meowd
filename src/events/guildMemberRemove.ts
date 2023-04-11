import { client } from "../index";
import { MessageEmbed, TextChannel, GuildMember  } from 'discord.js';
import Event from '../types/Event';
import { ref } from '..';

const guildMemberRemove: Event = {
    name: 'guildMemberRemove',
    execute: async function(member: GuildMember) {
        const guild = member.guild;
        const guildID = guild.id;
        var channelToSend;
        console.log(guildID)

        const serverConfigRef = ref.child("config").child(guildID)
        
        if (serverConfigRef === null) {
            console.log("new server")
            return;
        }

        const logChannel = await serverConfigRef.child("logChannel").get();
        const channelID = logChannel.val();

        if (logChannel.exists()) {
            channelToSend = client.channels.cache.get(channelID) as TextChannel;
        } else {
            console.log("no log channel")
            return;
        }

        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        const kickLog = fetchedLogs.entries.first();
        if (!kickLog) {
            // user left on their own
            const embed = new MessageEmbed()
                .setAuthor({name: `${member.user.tag} left the server.`, iconURL: member.user.displayAvatarURL()})
                .setColor('#00f2ff')
                .setTimestamp()
                .setFooter({ text: `ID ${member.user.id}` });
            return channelToSend.send({ embeds: [embed] });
        }


        if (kickLog.target!.id === member.id && kickLog.createdAt > member.joinedAt!) {
            const { executor, target, reason } = kickLog;
            var reasonGiven = "No reason given.";
            if (reason !== null || reason !== undefined) {
                reasonGiven = reason!;
            }

            var logEmbed = new MessageEmbed()
                .setColor("#00f2ff")
                .setAuthor({name: `${member.user.tag} (ID: ${member.user.id}) was kicked.`, iconURL: member.user.displayAvatarURL()})
                .addFields(
                    { name: "Reason:", value: reasonGiven},
                    { name: "Kicked by:", value: executor!.tag, inline: true},
                    { name: "Date:", value: new Date().toLocaleDateString(), inline: true}
                )
                .setTimestamp();

            channelToSend.send({ embeds: [logEmbed], content: `<@!${member.user.id}> was kicked by <@!${executor!.id}>` });
        }
        else{
            // user left on their own
            const embed = new MessageEmbed()
                .setTitle(`${member.user.tag} left the server.`)
                .setColor('#00f2ff')
                .setTimestamp()
                .setFooter({ text: `ID ${member.user.id}` });
            return channelToSend.send({ embeds: [embed] });
        }
    }
}

export default guildMemberRemove;