import Command from '../types/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ref } from '..';

const ploob: Command = {
    data: new SlashCommandBuilder()
	.setName('ploob')
    .addNumberOption(option =>
        option.setName("number")
            .setDescription("The ploob to get")
            .setMinValue(1)
        )
	.setDescription('ploob.. .'),
    execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
		const ploobs = 3;
        const number = interaction.options.getNumber("number");

		await interaction.deferReply();

		const embed = new MessageEmbed()
			.setColor("#00f2ff");

        const ploobMsgs = [
            "ploob",
            "ploobin",
            "ploobin' and a ploobin'",
            "ploobin' and a ploobin' and a ploobin'",
            "ploober",
            "ploobin' and a ploober",
            "ploob alert!!",
            "ploobin' and a ploobin' and a ploober",
            "plooby!",
            "ploob :3",
            "PLOOB",
            "ploobin' and a ploobin' and a ploober and a ploobin'",
            "erm, what the ploob?",
            "pl00b"
        ]

        let ploobArray;
        let dbPloobs;

        const dbPloobsExist = await ref.child("config").child(interaction.guildId).child("ploobs").get();
        if (dbPloobsExist.exists() && dbPloobsExist.val() !== null) {
            const ploobsRef = ref.child("config").child(interaction.guildId).child("ploobs");
            dbPloobs = await ploobsRef.get();
            ploobArray = dbPloobs.val();
        }

        const totalPloobs = ploobs + ploobArray.length;

        if (!number || number > totalPloobs) {
            const randomMsg = Math.floor((Math.random() * ploobMsgs.length));
            let outputPloobNo = 1;
            let randomPloob;


            // eslint-disable-next-line no-constant-condition
            while (true) {
                randomPloob = Math.floor(Math.random() * (totalPloobs - 1) + 1);

                if (randomPloob > ploobs) {
                    outputPloobNo = randomPloob - ploobs;
                    if (ploobArray[outputPloobNo] !== undefined && ploobArray[outputPloobNo] !== null) {
                        embed.setImage(ploobArray[outputPloobNo][0]);
                        embed.setDescription(`<@${ploobArray[outputPloobNo][1]}>'s ploob!!`);
                    }
                    break;
                }
                else {
                    embed.setImage("https://raw.githubusercontent.com/DailyOttersBot/ploobs/main/ploob%20(" + randomPloob + ").gif");
                    break;
                }
            }
            embed.setAuthor({ name: `${ploobMsgs[randomMsg]}: ${randomPloob}`, iconURL: "https://media.discordapp.net/attachments/590667063165583409/1209706599539810304/waow.jpg"})
        }
        else {
            if (number > ploobs) {
                if (ploobArray[number - ploobs] !== undefined && ploobArray[number - ploobs] !== null) {
                    embed.setImage(ploobArray[number - ploobs][0]);
                    embed.setDescription(`<@${ploobArray[number - ploobs][1]}>'s ploob!!`);
                }
            }
            else {
                embed.setImage("https://raw.githubusercontent.com/DailyOttersBot/ploobs/main/ploob%20(" + number + ").gif");
            }
            embed.setAuthor({ name: `Ploob ${number}`, iconURL: "https://media.discordapp.net/attachments/590667063165583409/1209706599539810304/waow.jpg"})
        }
        await interaction.editReply({ embeds: [embed] });
    }
}

export default ploob;