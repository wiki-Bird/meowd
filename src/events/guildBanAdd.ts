// if user banned

import { client } from "../index";
import { CommandInteraction, MessageEmbed, TextChannel, Guild, GuildBan  } from 'discord.js';
import Event from '../types/Event';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';

const guildBanAdd: Event = {
    name: 'guildBanAdd',
    execute: async function (ban: GuildBan) {
        const channelToSend = client.channels.cache.get('575434603607621695') as TextChannel;
        const guild = client.guilds.cache.get('575434603607621695') as Guild;
        var reasonGiven = "No reason given.";


        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD'
        });
        const latestBan = fetchedLogs.entries.first();

        if (!latestBan) return console.log(`${ban.user.tag} was banned from ${ban.guild.name} but no audit log could be found.`);

        const { executor, target, reason } = latestBan;


        if (reason !== null || reason !== undefined) {
            reasonGiven = reason!;
        }

        const guildID = guild.id;

        const configRef = ref.child("config");
        const userID = ban.user.id;
        const currentDate = new Date();
        const userConfig = await getUserConfig(userID, guildID);
        if (userConfig === null) {
            await configRef.child(userID).set({
                warnings: [{
                    reason: reason,
                    date: currentDate.toUTCString(),
                    moderator: executor!.id,
                    type: "ban",
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
                type: "ban",
                duration: "N/A",
                case_number: caseno2
            });
    
            await configRef.child(userID).child("cases").set(caseno2);
        }

        

        var logEmbed = new MessageEmbed()
            .setColor("#00f2ff")
            .setAuthor({name: `${ban.user.tag} (ID: ${ban.user.id}) was banned.`, iconURL: ban.user.displayAvatarURL()})
            .addFields(
                { name: "Reason:", value: reasonGiven},
                { name: "Banned by:", value: executor!.tag, inline: true},
                { name: "Date:", value: new Date().toLocaleDateString(), inline: true}
            )
            .setTimestamp();

        (channelToSend as TextChannel).send({ embeds: [logEmbed], content: `<@!${ban.user.id}> was banned by <@!${executor!.id}>` });
    }
}

export default guildBanAdd;