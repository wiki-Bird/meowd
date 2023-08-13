import { Guild, GuildMember, Interaction, User } from 'discord.js';
import { ref } from '..';
const configRef = ref.child("config");
import { CommandInteraction, MessageEmbed } from 'discord.js';
import getUserConfig from './getUserConfig'; 
import validateDuration from './validateDuration';
import validateUser from './validateUser';
import { client } from "../index";
import MemberServerPair from '../types/MemberServerPair';

/** Pre-existing config for a specified guild. */
export default async function muteUser(interaction: CommandInteraction<"cached" | "raw"> | undefined, user: string, reason: string, time: string, moderator: User, memberServer?: MemberServerPair): Promise<string[] | null> {

    let server = undefined;
    let guildMember = undefined;
    if (interaction !== undefined) {
        server = interaction.guild;
        guildMember = interaction.member;
    }
    else if (memberServer !== undefined) {
        server = memberServer.server;
        guildMember = memberServer.member;
    }
    else {
        console.log("interaction and memberServerPair are both undefined.")
        return null;
    }


    var isValidUser = await validateUser(user, interaction, true, memberServer);
    if (!isValidUser) {
        if (interaction !== undefined) await interaction.editReply("Invalid user.");
        return null;
    }
    var {userGuildMember, userNamed, userID} = isValidUser;

    var isValidTime = await validateDuration(time, interaction);
    if (!isValidTime) {
        if (interaction !== undefined) await interaction.editReply("Invalid time.");
        return null;
    }
    var {timeInMS, timeString} = isValidTime;

    if (interaction && !interaction.guild) {return null;}

    var guildID;
    if (interaction !== undefined) {
        guildID = interaction.guild?.id;
    } else {
        guildID = memberServer?.server.id;
    }
    if (!guildID) {return null;}

    if (timeInMS >= 2419200000) {
        if (interaction !== undefined) await interaction.editReply("You can't mute for more than 28 days.");
        return null;
    }

    const serverConfigRef = configRef.child(guildID);
    if (serverConfigRef === null) {
        console.log("new server")
        await configRef.child(guildID).set({ // empty
        });
    }

    const currentDate = new Date();

    const embed = new MessageEmbed()
    .setTitle("User Muted:")
    .setDescription("<@!" + userID + `> (` + userID + `) has been muted by ${moderator.tag} for the following reason:`)
    .addFields(
        { name: "Reason:", value: reason, inline: true },
        { name: "Date:", value: currentDate.toLocaleDateString(), inline: true },
        { name: "Duration:", value: timeString, inline: true }
    )
    .setColor("#00f2ff")
    .setTimestamp();

    // if user's role is higher than mine, I can't mute them
    if(userGuildMember.roles.highest.comparePositionTo(server!.me!.roles.highest) >= 0) {
        if (interaction !== undefined) interaction.editReply("<@!" + userID + "> has a higher role than me, I cannot mute them.");
        return null;
    }

    try {
        userGuildMember.timeout(timeInMS, reason);
    } catch (e) {
        if (interaction !== undefined) interaction.editReply(`Error: Could not mute user.`);
        console.log(e);
        return null;
    }

    const userConfig = await getUserConfig(userID, guildID);
    if (userConfig === null) {
        await serverConfigRef.child(userID).set({
            warnings: [{
                reason: reason,
                date: currentDate.toUTCString(),
                moderator: moderator.id,
                type: "mute",
                duration: timeInMS,
                case_number: 1
            }],
            cases: 1
        });
    }
    else {
        var caseno = await serverConfigRef.child(userID).child("cases").get();
        if (caseno.exists()) { // increment caseno
            caseno = caseno.val() + 1;
            await serverConfigRef.child(userID).child("cases").set(caseno);
        }

        await serverConfigRef.child(userID).child("warnings").push({
            reason: reason,
            date: currentDate.toUTCString(),
            moderator: moderator.id,
            type: "mute",
            duration: timeInMS,
            case_number: caseno
        });

        await serverConfigRef.child(userID).child("cases").set(caseno);
    }

    try {
        if (interaction !== undefined) await interaction.editReply({ content: `<@${userID}> has been muted.`, embeds: [embed] });
    }
    catch (err) {
        if (interaction !== undefined) await interaction.editReply({ content: `Could not DM the kick information to ${userNamed.tag}.`, embeds: [embed] });
    }

    return userConfig;
}
