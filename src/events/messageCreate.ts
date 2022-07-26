import { client } from '..';
import { TextChannel, Message, MessageEmbed, Guild } from 'discord.js';
import Event from '../types/Event';

const messageCreate: Event = {
    name: 'messageCreate',
    execute: function (message: Message) {
        console.log(message.content);

        //if a message is sent in the live-streams chat, change the status to streaming for an hour
        if ( message.channel.id === '767412939773706270'){
            client.user.setActivity("The David Pakman Show", {type: "STREAMING", url: "https://www.twitch.tv/davidpakman"})
            setTimeout(function(){client.user.setActivity("The David Pakman Show", { type: "WATCHING" })},3700000)
        }

        // if message comes from a bot, ignore it.
        if (message.author.bot) return;

    
        //if in DMs, forward message to mod channels
        if (message.channel.type === "DM") {
            console.log("DM message recieved")
            const DMEmbed = new MessageEmbed();
            DMEmbed.setColor('#1847bf')
                .setAuthor({ name: `${message.author.tag} sent this message in DMs:`, iconURL: message.author.displayAvatarURL()})
                .setFooter({ text: `ID: ${message.id}` })
                .setDescription(message.content);
            // if the message has an image attached, send that too
            if (message.attachments.size !== 0) {
                DMEmbed.setImage(message.attachments.first()!.url);
            }

            const channel = client.channels.cache.get('575434603607621695') as TextChannel;
            const guild = client.guilds.cache.get('575434603607621695') as Guild;
            (channel as TextChannel).send({ embeds: [DMEmbed] });

            // client.channels.cache.get('825569371152973825')!.send({ embeds: [DMEmbed] }); //pakman:825569371152973825 test:882490589663330354
            // client.users.cache.get(message.author.id)!.send({ embeds: [DMEmbed] }); 
            client.users.cache.get(message.author.id)!.send('Your message has been relayed to the mod team.')
            return;
        }

    }
}

export default messageCreate;