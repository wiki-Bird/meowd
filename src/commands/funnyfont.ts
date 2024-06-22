import Command from '../types/Command';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const funnyfont: Command = {
	data: new SlashCommandBuilder()
		.setName('funnyfont')
        .addStringOption(option =>
			option.setName("text")
				.setDescription("The text to make into funny font")
				.setRequired(true)
        )
        .addStringOption(option =>
            option.setName("font")
                .setDescription("The font to choose")
                .setRequired(false)
                .addChoices(
                    { name: "cool edgy", value: "cooledgy" },
                    { name: "cursive", value: "cursive" }
                )
        )
    .setDescription('Makes text into a funny font'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
        const text = interaction.options.getString("text", true);
        const font = interaction.options.getString("font", false) || "cooledgy";

        let lowerCaseOut: Array<string>;
        let upperCaseOut: Array<string>;

        // abcdefghijklmnopqrstuvwxyz
        // ABCDEFGHIJKLMNOPQRSTUVWXYZ
        // 0123456789

        let outputText = "";

        if (font === "cooledgy") {
            lowerCaseOut = ['𝖆', '𝖇', '𝖈', '𝖉', '𝖊', '𝖋', '𝖌', '𝖍', '𝖎', '𝖏', '𝖐', '𝖑', '𝖒', '𝖓', '𝖔', '𝖕', '𝖖', '𝖗', '𝖘', '𝖙', '𝖚', '𝖛', '𝖜', '𝖝', '𝖞', '𝖟'];
            upperCaseOut = ['𝕬', '𝕭', '𝕮', '𝕯', '𝕰', '𝕱', '𝕲', '𝕳', '𝕴', '𝕵', '𝕶', '𝕷', '𝕸', '𝕹', '𝕺', '𝕻', '𝕼', '𝕽', '𝕾', '𝕿', '𝖀', '𝖁', '𝖂', '𝖃', '𝖄', '𝖅'];
        }
        else if (font === "cursive") {
            lowerCaseOut = ['𝓪', '𝓫', '𝓬', '𝓭', '𝓮', '𝓯', '𝓰', '𝓱', '𝓲', '𝓳', '𝓴', '𝓵', '𝓶', '𝓷', '𝓸', '𝓹', '𝓺', '𝓻', '𝓼', '𝓽', '𝓾', '𝓿', '𝔀', '𝔁', '𝔂', '𝔃'];
            upperCaseOut = ['𝓐', '𝓑', '𝓒', '𝓓', '𝓔', '𝓕', '𝓖', '𝓗', '𝓘', '𝓙', '𝓚', '𝓛', '𝓜', '𝓝', '𝓞', '𝓟', '𝓠', '𝓡', '𝓢', '𝓣', '𝓤', '𝓥', '𝓦', '𝓧', '𝓨', '𝓩'];
        }
        else{
            return;
        }

        for(let i=0; i<text.length; i++){
            if (!/[a-zA-Z]/.test(text[i])){
                outputText += text[i];
                continue;
            }

            const position = text[i].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
            const isUpper = text[i] === text[i].toUpperCase();
            if (isUpper){
                outputText += upperCaseOut[position];
            }
            else{
                outputText += lowerCaseOut[position];
            }
        }

        interaction.reply({ content: outputText });
	}
}

export default funnyfont;