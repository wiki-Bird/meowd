import { GuildMember, User, CommandInteraction, Guild } from 'discord.js';
import { client } from "../index";
import MemberServerPair from '../types/MemberServerPair';

export interface ValidatedUser {
    userNamed: User;
    userGuildMember: GuildMember;
    userID: string;
}

export default async function validateUser(user: string, interaction: CommandInteraction<"cached" | "raw"> | undefined, checker: boolean, memberServerPair?: MemberServerPair): Promise<ValidatedUser | false> {
    let userGuildMember: GuildMember;
    let userNamed: User;
    let userID: string;

    let server = undefined;
    let guildMember = undefined;
    if (interaction !== undefined) {
        server = interaction.guild;
        guildMember = interaction.member;
    }
    else if (memberServerPair !== undefined) {
        server = memberServerPair.server;
        guildMember = memberServerPair.member;
    }
    else {
        console.log("interaction and memberServerPair are both undefined.")
        return false;
    }


    if (user !== null && server !== undefined) {

        console.log("user: " + user)
    
        if (user?.startsWith("<@") && user?.endsWith(">")) {
            userID = user.slice(2, -1);
        }
        else if (user?.length === 18 && isNaN(Number(user)) === false) {
            userID = user;
        }
        else {
            if (interaction !== undefined) await interaction.followUp({ content: `Invalid user. Please provide a user's ID, @ a user, or provide nothing at all.`, ephemeral: true });
            return false;
        }
        

        try {
            const serverUser = await server?.members.fetch(userID);
            if (serverUser === undefined) {
                if (checker) { 
                    if (interaction !== undefined) await interaction.followUp({ content: `User not found in this server.`, ephemeral: true });
                    return false;
                }
            }
        }
        catch (e) {
            if (checker) {
                if (interaction !== undefined) await interaction.followUp({ content: `User not found in this server.`, ephemeral: true });
                return false;
            }

        }
        if (checker){
            userGuildMember = await server!.members.fetch(userID);
            userNamed = userGuildMember.user;
        }
        else if (guildMember instanceof GuildMember){
            userNamed = guildMember.user;
            userGuildMember = guildMember;
        }
        else {
            if (interaction !== undefined) await interaction.followUp({ content: `User not found.`, ephemeral: true });
            return false;
        }


    } else if (guildMember instanceof GuildMember) {
        userNamed = guildMember.user;
        userGuildMember = guildMember;
        userID = guildMember.user.id;
    } else {
        if (interaction !== undefined) await interaction.followUp({ content: `This should never blah blah blah`, ephemeral: true });
        return false;
    }

    return {
        userGuildMember,
        userNamed,
        userID
    }
}