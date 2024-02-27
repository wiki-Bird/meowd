import { CommandInteraction, TextChannel, Guild } from 'discord.js';

export interface ValidatedChannel {
    channelID: string;
    channelName: string;
    TextChannel: TextChannel;
}


export default async function validateChannel(channel: string, interaction: CommandInteraction<"cached" | "raw"> | undefined, guild: Guild ): Promise<ValidatedChannel | false> {
    let channelID: string;
    let channelName: string;
    let TextChannel: TextChannel;

    if (channel !== null) {
        if (channel?.startsWith("<#") && channel?.endsWith(">")) {
            channelID = channel.slice(2, -1);
        }
        else if (channel?.length >= 18 && isNaN(Number(channel)) === false) {
            channelID = channel;
        }
        else {
            if (interaction !== undefined ) {
                try {
                    await interaction.reply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.`, ephemeral: true });
                }
                catch (e) {
                    await interaction.editReply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.` });
                }
            }
            return false;
        }
        
        try {
            // if guild is null, const serverChannel = await interaction?.guild?.channels.fetch(channelID);
            let serverChannel;
            if (guild === null) {
                serverChannel = await interaction?.guild?.channels.fetch(channelID);
            }
            else {
                serverChannel = await guild.channels.fetch(channelID);
            }
            if (serverChannel === undefined) {
                if (interaction !== undefined) {
                    try {
                        await interaction.reply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.`, ephemeral: true });
                    }
                    catch (e) {
                        await interaction.editReply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.` });
                    }
                }
                return false;
            }
            else {
                TextChannel = serverChannel as TextChannel;
                channelName = serverChannel?.name ?? '';
            }
        }
        catch (e) {
            if (interaction !== undefined) {
                try {
                    await interaction.reply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.`, ephemeral: true });
                }
                catch (e) {
                    await interaction.editReply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.` });
                }
            }
            return false;
        }
    }
    else {
        if (interaction !== undefined) {
            try {
                await interaction.reply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.`, ephemeral: true });
            }
            catch (e) {
                await interaction.editReply({ content: `Invalid channel. Please provide a channel's ID, # a channel, or nothing at all.` });
            }
        }
        return false;
    }
    return {
        channelID: channelID,
        channelName: channelName,
        TextChannel: TextChannel
    }
}