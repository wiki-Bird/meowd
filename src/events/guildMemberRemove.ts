import { client } from "../index";
import { MessageEmbed, TextChannel, Guild, GuildBan, GuildMember,   } from 'discord.js';
import Event from '../types/Event';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';

const guildMemberRemove: Event = {
    name: 'guildMemberRemove',
    execute: async function(member: GuildMember) {
        const channelToSend = client.channels.cache.get('575434603607621695') as TextChannel;

        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        const kickLog = fetchedLogs.entries.first();
        if (!kickLog) {
            // user left on their own
            const embed = new MessageEmbed()
                .setTitle(`${member.user.tag} left the server.`)
                .setColor('#1847bf')
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


            const configRef = ref.child("config");
            const userID = member.user.id;
            const currentDate = new Date();
            const userConfig = await getUserConfig(userID);
            if (userConfig === null) {
                await configRef.child(userID).set({
                    warnings: [{
                        reason: reason,
                        date: currentDate.toUTCString(),
                        moderator: executor!.id,
                        type: "kick",
                        duration: "N/A",
                        case_number: 1
                    }],
                    cases: 1
                });
            }
            else {
                var caseno2 = 0;
                const caseRef = ref.child("config").child(userID).child("cases");
                await caseRef.once("value", (snapshot) => {
                    caseno2 = snapshot.val() + 1;
                });
        
                await configRef.child(userID).child("warnings").push({
                    reason: reason,
                    date: currentDate.toUTCString(),
                    moderator: executor!.id,
                    type: "kick",
                    duration: "N/A",
                    case_number: caseno2
                });
        
                await configRef.child(userID).child("cases").set(caseno2);
            }



            var logEmbed = new MessageEmbed()
                .setColor("#1847bf")
                .setAuthor({name: `${member.user.tag} (ID: ${member.user.id}) was kicked.`, iconURL: member.user.displayAvatarURL()})
                .addFields(
                    { name: "Reason:", value: reasonGiven},
                    { name: "Kicked by:", value: executor!.tag, inline: true},
                    { name: "Date:", value: new Date().toLocaleDateString(), inline: true}
                )
                .setTimestamp();

            (channelToSend as TextChannel).send({ embeds: [logEmbed], content: `<@!${member.user.id}> was kicked by <@!${executor!.id}>` });
        }
        else{
            // user left on their own
            const embed = new MessageEmbed()
                .setTitle(`${member.user.tag} left the server.`)
                .setColor('#1847bf')
                .setTimestamp()
                .setFooter({ text: `ID ${member.user.id}` });
            return channelToSend.send({ embeds: [embed] });
        }




    }
}

export default guildMemberRemove;