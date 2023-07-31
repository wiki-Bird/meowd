import { client } from '..';
import { TextChannel, Message, MessageEmbed, Guild } from 'discord.js';
import Event from '../types/Event';

const messageCreate: Event = {
    name: 'messageCreate',
    execute: function (message: Message) {

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

    }
}

export default messageCreate;