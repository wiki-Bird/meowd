import { client } from '..';
import { Message, MessageEmbed } from 'discord.js';
import Event from '../types/Event';
import { ref } from '..';
import muteUser from '../functions/muteUser';
import MemberServerPair from '../types/MemberServerPair';

// const messageCreate: Event = {
const messageCreate: Event<[Message]> = {
    name: 'messageCreate',
    execute: async function (message: Message) {
        // if message comes from a bot, ignore it.
        if (message.author.bot) return;

    
        // old code for forwarding DMs to mod team
        // if (message.channel.type === "DM") {
        //     console.log("DM message recieved")
        //     const DMEmbed = new MessageEmbed();
        //     DMEmbed.setColor('#00f2ff')
        //         .setAuthor({ name: `${message.author.username} sent this message in DMs:`, iconURL: message.author.displayAvatarURL()})
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
                if (message.content.toLowerCase().includes("watch")) {
                    const status = message.content.replace("watch", "");
                    client.user!.setActivity(status, { type: 'WATCHING' });
                    message.channel.send('Status set.');
                }
                else if (message.content.toLowerCase().includes("play")) {
                    const status = message.content.replace("play", "");
                    client.user!.setActivity(status, { type: 'PLAYING' });
                    message.channel.send('Status set.');
                }
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
                    .setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL()})
                    .setFooter({ text: "Change banned words using /config blacklist" })

                    // if server punishment is set
                    const punishment = await serverConfigRef.child("blacklistedWordsPunishment").get();
                    if (punishment.exists()) {
                        const punishmentString = punishment.val();
                        if (punishmentString === "ban") {
                            message.member!.ban({ reason: "Banned word detected" });

                            embed.setDescription("User banned");
                        }
                        else if (punishmentString === "kick") {
                            message.member!.kick("Kicked for using banned word");
                            embed.setDescription("User kicked");
                        }
                        else if (punishmentString === "mute") {
                            const userGuildMember = message.guild!.members.cache.get(message.author.id)!;
                            const server = message.guild!;
                            const memberServer: MemberServerPair = {
                                member: userGuildMember,
                                server: server
                            };
                            
                            await muteUser(undefined, message.author.id, `Banned word: ${message.content}`, "3600000", client.user!, memberServer);
                        }
                        else if (punishmentString === "warn") {
                            const userConfig = await serverConfigRef.child(message.author.id).get();
                            if (userConfig.exists()) {
                                let caseno = await serverConfigRef.child(message.author.id).child("cases").get();
                                if (caseno.exists()) { // increment caseno
                                    caseno = caseno.val() + 1;
                                    await serverConfigRef.child(message.author.id).child("cases").set(caseno);
                                }
                        
                                await serverConfigRef.child(message.author.id).child("warnings").push({
                                    reason: "Warned for using banned phrase: " + message.content,
                                    date: new Date().toUTCString(),
                                    moderator: client.user!.id,
                                    type: "warn",
                                    case_number: caseno
                                });
                        
                                await serverConfigRef.child(message.author.id).child("cases").set(caseno);
                            }
                            else {
                                await serverConfigRef.child(message.author.id).set({
                                    warnings: [{
                                        reason: "Warned for using banned phrase: " + message.content,
                                        date: new Date().toUTCString(),
                                        moderator: client.user!.id,
                                        type: "warn",
                                        case_number: 1
                                    }],
                                    cases: 1
                                });
                            }
                            embed.setDescription("User warned");
                        }
                    }
                    message.channel.send({ embeds: [embed] });
                }
            }
        }
    }
}

export default messageCreate;