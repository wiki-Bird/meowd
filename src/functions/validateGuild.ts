import { CommandInteraction, Guild } from 'discord.js';

export interface ValidatedGuild {
    guildID: string;
    guildName: string;
    guild: Guild;
}

export default async function validateGuild(guildInput: string, interaction: CommandInteraction<"cached" | "raw"> | undefined): Promise<ValidatedGuild | false> {
    let guildID: string;
    let guildName: string;
    let guild: Guild;

    if (guildInput !== null) {
        if (guildInput?.startsWith("<@&") && guildInput?.endsWith(">")) {
            guildID = guildInput.slice(3, -1);
        }
        else if (guildInput?.length === 18 && isNaN(Number(guildInput)) === false) {
            guildID = guildInput;
        }
        else {
            if (interaction !== undefined) {
                try {
                    await interaction.reply({ content: `Invalid guild. Please provide a guild's ID, or nothing at all.`, ephemeral: true });
                }
                catch (e) {
                    await interaction.editReply({ content: `Invalid guild. Please provide a guild's ID, or nothing at all.` });
                }
            }
            return false;
        }
        
        try {
            const serverGuild = await interaction?.client.guilds.fetch(guildID);
            if (serverGuild === undefined) {
                if (interaction !== undefined) {
                    try {
                        await interaction.reply({ content: `Invalid guild. Please provide a guild's ID, or nothing at all.`, ephemeral: true });
                    }
                    catch (e) {
                        await interaction.editReply({ content: `Invalid guild. Please provide a guild's ID, or nothing at all.` });
                    }
                }
                return false;
            }
            else {
                guild = serverGuild;
                guildName = serverGuild?.name ?? '';
            }
        }
        catch (e) {
            if (interaction !== undefined) {
                try {
                    await interaction.reply({ content: `Invalid guild. Please provide a guild's ID, or nothing at all.`, ephemeral: true });
                }
                catch (e) {
                    await interaction.editReply({ content: `Invalid guild. Please provide a guild's ID, or nothing at all.` });
                }
            }
            return false;
        }
    }
    else {
        guild = interaction?.guild as Guild;
        guildID = guild.id;
        guildName = guild.name;
    }

    return {
        guildID,
        guildName,
        guild
    }
}
