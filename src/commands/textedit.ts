

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
                        

                        reply = text!;
                }

                interaction.editReply({ content: reply });

        }
}

export default textedit;