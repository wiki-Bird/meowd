import { MessageReaction, User, PartialMessageReaction, PartialUser, MessageEmbed } from 'discord.js';
import Event from '../types/Event';
import { client } from "../index";
import { ref } from '..';

const messageReactionRemove: Event<[MessageReaction | PartialMessageReaction, User | PartialUser]> = {
    name: 'messageReactionRemove',
    execute: async function(reaction: MessageReaction | PartialMessageReaction) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        const message = reaction.message;

        // If in DMs, return
        if (message.channel.type === "DM" || !message.guildId) return;

        // Access FirebaseDB and get state, minstars, emote, and channel
        const starboardDB = await ref.child("config").child(message.guildId).child("starboard").get();
        
        const enabled = Object.values(starboardDB.child("starboardon").val() || {})[0] || "true";
        const starboardChannelID = Object.keys(starboardDB.child("channel").val() || {})[0] || "";
        
        // If server doesn't have starboard enabled, or a starboard channel, return
        if (enabled != "true") return;
        if (starboardChannelID === "") return;
        // If the starboard channel doesn't exist, return
        const starboardChannel = message.guild?.channels.cache.get(starboardChannelID);
        if (!starboardChannel) return;

        const emojiIdentifier = String(Object.values(starboardDB.child("emote").val() || {})[0] || "⭐");
        const minReactsToStar = parseInt(String(Object.values(starboardDB.child("minstars").val() || {})[0] || "1"), 10) || 1;

        // Determine the actual emoji to use
        let starEmoji: string;
        const customEmoji = client.emojis.cache.get(emojiIdentifier);
        if (customEmoji) {
            starEmoji = customEmoji.toString();
        } else if (/\p{Emoji}/u.test(emojiIdentifier)) {
            starEmoji = emojiIdentifier;
        } else {
            starEmoji = "⭐"; // Default to star emoji
        }

        // Check if the reaction matches our desired emoji
        if (reaction.emoji.id !== emojiIdentifier && reaction.emoji.toString() !== starEmoji) return;

        // Check if the number of star reacts >= minimum reacts to go to starboard. If it doesn't, return
        const starCount = message.reactions.cache.find(r => 
            r.emoji.id === emojiIdentifier || r.emoji.toString() === starEmoji
        )?.count || 0;

        // Get the last 100 messages in the starboard channel
            // If it's from the bot, and is a starboard repost, check if the original message id is the same as the starred IDs
                // If they are, update the message's starcount, return
        if (!('messages' in starboardChannel) || !('send' in starboardChannel)) return;
        const fetch = await starboardChannel.messages.fetch({ limit: 100 });

        const existingStarMessage = fetch.find(m => {
            return (
                m.author.id === client.user?.id &&
                m.embeds.length > 0 &&
                ((m.embeds[0].footer?.text?.startsWith(`ID: ${message.id}`)) ?? false)
            );
        });

        const truncatedContent = message.content!.length > 300 
        ? message.content?.slice(0, 300) + '...' 
        : message.content || ' ';
        const image = message.attachments.size > 0 ? message.attachments.first()?.url : null;
        const authorImg = message.author?.displayAvatarURL() || "https://raw.githubusercontent.com/wiki-Bird/meowd-site/main/meowdSiteSveltekit/static/point.png";


        if (existingStarMessage) {
            if( starCount < minReactsToStar) {
                existingStarMessage.delete();
                return;
            }

            const embed = existingStarMessage.embeds[0];
            if (embed) {
                const newEmbed = new MessageEmbed()
                    .setAuthor({ name: message.author?.username || "Username: Error", iconURL: authorImg })
                    .setDescription(`${starEmoji} **${starCount}** • [Jump to Message](${message.url})`)
                    .addFields(
                        { name: ` `,  value: `${truncatedContent}`},
                    )
                    .setTimestamp()
                    .setFooter({ text: `ID: ${message.id}` })
                    .setColor('#FFD700'); // Gold color
                if (image) newEmbed.setImage(image);
                await existingStarMessage.edit({ embeds: [newEmbed] });
            }
            return;
        }
    }
}

export default messageReactionRemove;