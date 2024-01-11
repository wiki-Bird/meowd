

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
                                { name: "zizek", value: "zizek" }
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
                        // make the text have sniffs and stutters like slavoj zizek
                        // every 5 to 15 words, add a sniff
                        // every 2 to 8 words, add a stutter
                        // every 1 to 3 words, add a pause
                        // replace every "s" with "sh"
                        // replace every "t" with "d"
                        
                        const words = text!.split(" ");
                        const newWords = [];
                        let newWord = "";
                        
                        for (let i = 0; i < words.length; i++) {
                                words[i].replace("s", "sh");

                                if (i % 5 === 0 && i % 15 === 0) {
                                        newWord += " *sniff* ";
                                }
                                else if (i % 2 === 0 && i % 8 === 0) {
                                        newWord += words[i][0] + "-" + words[i];
                                }
                                else if (i % 1 === 0 && i % 3 === 0) {
                                        newWord += " *pauses* ";
                                }
                                newWord += words[i];
                                newWords.push(newWord);
                                newWord = "";
                        }

                        reply = newWords.join(" ");
                }

                interaction.editReply({ content: reply });

        }
}

export default textedit;