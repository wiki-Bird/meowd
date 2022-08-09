import { GuildMember, User, CommandInteraction } from 'discord.js';
import { client } from "../index";

export interface ValidatedUser {
    userNamed: User;
    userGuildMember: GuildMember;
    userID: string;
}

export default async function validateUser(user: string, interaction: CommandInteraction<"cached" | "raw">, checker: boolean): Promise<ValidatedUser | false> {
    let userGuildMember: GuildMember;
    let userNamed: User;
    let userID: string;

    if (user !== null) {
    
        if (user?.startsWith("<@!") && user?.endsWith(">")) {
            userID = user.slice(3, -1);
        }
        else if (user?.length === 18 && isNaN(Number(user)) === false) {
            userID = user;
        }
        else {
            await interaction.reply({ content: `Invalid user. Please provide a user's ID, @ a user, or provide nothing at all.`, ephemeral: true });
            return false;
        }
        

        try {
            const drip = await interaction.guild?.members.fetch(userID);
            if (drip === undefined) {
                if (checker) { 
                    await interaction.reply({ content: `User not found in this server.`, ephemeral: true });
                    return false;
                }
            }
        }
        catch (e) {
            if (checker) {
                await interaction.reply({ content: `User not found in this server.`, ephemeral: true });
                return false;
            }

        }
        if (checker){
            userGuildMember = await interaction.guild!.members.fetch(userID);
            userNamed = userGuildMember.user;
        }
        else if (interaction.member instanceof GuildMember){
            userNamed = interaction.user;
            userGuildMember = interaction.member;
        }
        else {
            await interaction.reply({ content: `User not found.`, ephemeral: true });
            return false;
        }


    } else if (interaction.member instanceof GuildMember) {
            userNamed = interaction.user;
            userGuildMember = interaction.member;
            userID = interaction.user.id;
        } else {
            await interaction.reply({ content: `This should never blah blah blah`, ephemeral: true });
            return false;
        }

    return {
        userGuildMember,
        userNamed,
        userID
    }
}