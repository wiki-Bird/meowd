

import { SlashCommandBuilder } from '@discordjs/builders';
import Command from '../types/Command';

const textedit: Command = {
        data: new SlashCommandBuilder()
                .setName('textedit')
                .addStringOption(option =>
                        option.setName("action")
                        .setDescription("The action to do.")
                        .setRequired(true)
                        .addChoices(
                                { name: "uwu", value: "uwu" },
                                { name: "zizek", value: "zizek" },
                                { name: "maoist_standard_english", value: "maoist_standard_english" }
                        )
                )
                .addStringOption(option =>
                        option.setName("text")
                        .setDescription("The text to do stuff with.")
                        .setRequired(false)
                )
                .addStringOption(option =>
                        option.setName("message")
                        .setDescription("The message to do stuff with (ID/LINK).")
                        .setRequired(false)
                )
                .setDescription('Do fun stuff with text.'),

        execute: async function (interaction): Promise<void> {
                await interaction.deferReply();

                const action = interaction.options.getString("action", true);
                const text = interaction.options.getString("text", false);
                const message = interaction.options.getString("message", false);

                let reply = "";

                if (!interaction.guild) {return;}

                if (!text && !message) {
                        interaction.editReply({ content: "You must specify text or a message." });
                        return;
                }
                else if (text && message) {
                        interaction.editReply({ content: "You can't specify both a text and a message." });
                        return;
                }

                if (action === "uwu") {
                        const uwu = text!.replace(/(?:r|l)/g, "w")
                        .replace(/(?:R|L)/g, "W")
                        .replace(/n([aeiou])/g, 'ny$1')
                        .replace(/N([aeiou])/g, 'Ny$1')
                        .replace(/N([AEIOU])/g, 'Ny$1')
                        .replace(/wh([aeiou])/g, 'wa$1')
                        .replace(/ove/g, "uv")
                        .replace(/!+/g, " " + "uwu");

                        reply = uwu;
                }
                else if (action === "zizek") {
                        const text2 = text!.replace(/s/g, "sh")
                                .replace(/d /g, "dj ")
                                .replace(/t/g, "d");
                        
                        const words = text2!.split(" ");
                        const newWords = [];
                        let newWord = "";
                        
                        for (let i = 0; i < words.length; i++) {

                                if (i % 5 === 0 && i % 15 === 0) {
                                        newWord += " *sniff* ";
                                }
                                else if (i % 2 === 0 && i % 8 === 0) {
                                        newWord += words[i][0] + "-" + words[i];
                                }
                                else if (i % 9 === 0 && i % 14 === 0) {
                                        newWord += " *pauses* ";
                                }
                                newWord += words[i];
                                newWords.push(newWord);
                                newWord = "";
                        }

                        // one in 18 chance to add "an- and one more thing", one in 20 chance to add ". pure ideology." to the end
                        const random = Math.floor(Math.random() * 18);
                        if (random === 0) {
                                newWords.push("an- and one more thing, i apologise, one more thing....");
                        }
                        const random2 = Math.floor(Math.random() * 20);
                        if (random2 === 0) {
                                newWords.push(". pure ideology.");
                        }

                        reply = newWords.join(" ");
                }
                else if (action === "maoist_standard_english") {
                        // Server not in list
                        ["521856622998323202", "1034219118276120586"]
                        if (interaction.guild.id !== "521856622998323202" && interaction.guild.id !== "1034219118276120586") {
                                interaction.editReply({ content: "This action is server restricted and cannot be used here, sorry." });
                                return;
                        }

                        const specificReplacements = {
                                'american soldiers': 'Imperial storm troopers',
                                'america': 'AmeriKKKa',
                                'american': 'Burger',
                                'auckland': 'AucKKKland',
                                'australia': 'AuSStralia',
                                'austria': 'AuSStria',
                                'austerity': 'AuSSterity',
                                'belarus': 'BelaruZ',
                                'brazil': 'BraSSil',
                                'canada': 'KKKanada',
                                'cappuccino': 'KKKappuccino',
                                'capitalism': 'KKKapitali$m',
                                'christchurch': 'KKKristchurch',
                                'class': 'KKKlaSS',
                                'clinton': 'KKKlinton',
                                'colonise': 'KKKoloni$e',
                                'coloniser': 'KKKoloni$er',
                                'community': 'KKKommunity',
                                'consumer': 'KKKon$umer',
                                'cracker': 'craKKKa',
                                'cream': 'KKKream',
                                'croatia': 'KKKroatia',
                                'culture': 'KKKulture',
                                'democrats': 'DemoKKKRats',
                                'domination': 'McDomination',
                                'economist': 'eKKKonomiSSt',
                                'estonia': 'ESStonia',
                                'france': 'FranSSe',
                                'germany': 'DeutSSchland',
                                'hillary': 'KKKillary',
                                'historian': 'hiSStorian',
                                'history': 'theirstory',
                                'israel': 'the Zionist entity',
                                'kansas': 'KKKanSSa$',
                                'kraut': 'KKKraut',
                                'patrick': 'PatricKKK',
                                'police': 'pigs',
                                'revenue': 'imperial super profits',
                                'russia': 'RuZZia',
                                'shortage': 'fuck the global south',
                                'snowflake': 'snowflaKKKe',
                                'south africa': 'South AfriKKKa',
                                'south korea': 'South KKKorea',
                                'spain': '$pain',
                                'starvation': 'white death',
                                'state': 'SState',
                                'sweden': 'SSweden',
                                'switzerland': 'SSwitzerland',
                                'to their surprise': 'to their white surprise',
                                'uk': 'the so-called United Kingdom',
                                'united kingdom': 'the so-called United Kingdom',
                                'united states': 'The United States of Lyncherdom',
                                'united states of America': 'United $$nake$$ of AmeriKKKa',
                                'usa': 'U$A',
                                'us': 'U$',
                                'us soldiers': 'mercenary techno-legion GI',
                                'wellington': 'the so-called capital of New Zealand',
                                'west': 'settler-colonialist',
                                'western': 'imperialist',
                                'white': 'Whitey',
                                'chris luxon': 'so called honourable prime minister KKKris luxon'
                        };                        


                        let result = text?.toLowerCase() ?? "";

                        // Apply specific replacements
                        for (const [key, value] of Object.entries(specificReplacements)) {
                                const regex = new RegExp(key, 'gi');
                                result = result.replace(regex, value);
                        }
                        // General character replacements combined into a single replace() call
                        result = result.replace(/ck|kk|k|ss|s/gi, function(match) {
                                switch(match.toLowerCase()) {
                                    case 'ck':
                                    case 'kk':
                                        return 'KKK';
                                    case 'k':
                                        return 'KKK';
                                    case 'ss':
                                        return 'SS';
                                    case 's':
                                        return '$';
                                    default:
                                        return match; // Just in case
                                }
                        });

                        reply = result;
                }

                interaction.editReply({ content: reply });

        }
}

export default textedit;