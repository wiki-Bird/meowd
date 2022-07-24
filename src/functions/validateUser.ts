import { GuildMember, User, CommandInteraction } from 'discord.js';

export interface ValidatedUser {
    userNamed: User;
    userGuildMember: GuildMember;
    userID: string;
}

export default async function validateUser(user: string, interaction: CommandInteraction<"cached" | "raw">): Promise<ValidatedUser | false> {
    let userGuildMember: GuildMember;
    let userNamed: User;
    let userID: string;

    if (user !== null) {
    
        if (user?.startsWith("<@!") && user?.endsWith(">")) {
            userID = user.slice(3, -1);
        }
        // else if user is an ID:
        else if (user?.length === 18 && isNaN(Number(user)) === false) {
            userID = user;
        }
        else {
            await interaction.reply({ content: `Invalid user. Please provide a user's ID, @ a user, or provide nothing at all.`, ephemeral: true });
            return false;
        }
        userGuildMember = await interaction.guild!.members.fetch(userID);
        userNamed = userGuildMember.user;
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