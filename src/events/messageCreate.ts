import { client } from '..';
import { TextChannel, Message, MessageEmbed, Guild } from 'discord.js';
import Event from '../types/Event';
import { ref } from '..';

const messageCreate: Event = {
    name: 'messageCreate',
    execute: async function (message: Message) {

        // if message comes from a bot, ignore it.
        if (message.author.bot) return;

    
        // old code for forwarding DMs to mod team
        // if (message.channel.type === "DM") {
        //     console.log("DM message recieved")
        //     const DMEmbed = new MessageEmbed();
        //     DMEmbed.setColor('#00f2ff')
        //         .setAuthor({ name: `${message.author.tag} sent this message in DMs:`, iconURL: message.author.displayAvatarURL()})
        //         .setFooter({ text: `ID: ${message.id}` })
        //         .setDescription(message.content);
        //     // if the message has an image attached, send that too
        //     if (message.attachments.size !== 0) {
        //         DMEmbed.setImage(message.attachments.first()!.url);
        //     }

        //     const channel = client.channels.cache.get('575434603607621695') as TextChannel;
        //     const guild = client.guilds.cache.get('575434603607621695') as Guild;
        //     (channel as TextChannel).send({ embeds: [DMEmbed] });

        //     // client.channels.cache.get('825569371152973825')!.send({ embeds: [DMEmbed] }); 
        //     // client.users.cache.get(message.author.id)!.send({ embeds: [DMEmbed] }); 
        //     client.users.cache.get(message.author.id)!.send('Your message has been relayed to the mod team.')
        //     return;
        // }

        if (message.channel.type === "DM") { // Update the bot's status
            if (message.author.id === '232254618434797570') {
                client.user!.setActivity(message.content);
                message.channel.send('Status set.');
            }
        }
        else {
            // if message is from a server with a words blacklist
            const guildID = message.guild!.id;
            const configRef = ref.child("config");
            const serverConfigRef = configRef.child(guildID);

            const words = await serverConfigRef.child("blacklistedWords").get();

            if (words.exists()) { 
                const wordsArray = Object.values(words.val());
                const wordsString = wordsArray.join("|");
                const regex = new RegExp(wordsString, "gi");
                if (regex.test(message.content)) {
                    message.delete();
                    const embed = new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('Banned Message Deleted')
                        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL()})
                        .setFooter({ text: "Change banned words using /config blacklist" })
                    
                    message.channel.send({ embeds: [embed] });
                }
            }
        }
    }
}

export default messageCreate;