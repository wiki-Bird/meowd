import Command from '../types/Command';
import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DateTime } = require('luxon');
require('luxon-parser');

const data = new SlashCommandBuilder() 
	.setName('convert')
	.setDescription('Convert currencies, times, and more.');

data.addSubcommand(subcommand =>
	subcommand
		.setName("time")
		.setDescription("Convert between timezones.")
		.addStringOption(option =>
            option.setName("time")
                .setDescription("The time to convert, eg: 9:00am EST")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("timezone")
                .setDescription("The timezone to convert to, eg: UTC")
                .setRequired(true)
        )
)

data.addSubcommand(subcommand =>
    subcommand
        .setName("currency")
        .setDescription("Convert between currencies.")
        .addStringOption(option =>
            option.setName("amount")
                .setDescription("The amount to convert, eg: 10 USD")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("currency")
                .setDescription("The currency to convert to, eg: EUR")
                .setRequired(true)
        )
)

const convert: Command = {

	data,
	
	execute: async function (interaction): Promise<void> {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "time") {
            const time = interaction.options.getString("time");
            let timezoneTo = interaction.options.getString("timezone", true);

            switch (timezoneTo) {
                case "NZT" || "NZDT": timezoneTo = "Pacific/Auckland"; break;
                case "AEST" || "AEDT" || "AET": timezoneTo = "Australia/Sydney"; break;
                case "ACST" || "ACDT" || "ACT": timezoneTo = "Australia/Adelaide"; break;
                case "AWST": timezoneTo = "Australia/Perth"; break;
            }

            let currentDate, timeString, timezoneFrom;
        
            // Check if a time is provided, if not use current time in the timezoneTo
            if (time!.split(" ").length > 1) {
                // Parse the provided time and timezone
                const timeSplit = time!.split(" ");
                timeString = timeSplit[0];
                timezoneFrom = timeSplit[1];
                currentDate = DateTime.now().setZone(timezoneFrom).toISODate();
            } else {
                // If time is not provided, use current time in timezoneTo
                timezoneFrom = time;
                currentDate = DateTime.now().setZone(timezoneFrom).toISODate();
                const currentTime = DateTime.now().setZone(timezoneFrom);
                timeString = currentTime.toFormat("HH:mm");
            }

            // Check for AM/PM in the time string
            const isAmOrPm = timeString.includes('am') || timeString.includes('pm');
            
            // Split the time string by colon if it exists
            const timeComponents = timeString.split(":");
            let hour = timeComponents[0];
            let minute = timeComponents.length > 1 ? timeComponents[1] : "00";
            if (minute.endsWith("am") || minute.endsWith("pm")) { minute = minute.substring(0, minute.length - 2); }
            
            // Handle AM/PM and convert to 24-hour format if necessary
            if (isAmOrPm) {
                const isPm = timeString.includes('pm');
                let tempHour = parseInt(hour);
                if (isPm) { tempHour += 12; }
                if (tempHour === 24) { tempHour = 0; }
                hour = tempHour.toString();
            }

            const dateTimeString = `${currentDate}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

            // Parse the time in the given timezone using Luxon's ISO format parsing
            const parsedDate = DateTime.fromISO(dateTimeString, { zone: timezoneFrom });

            if (parsedDate.invalid) {
                await interaction.editReply(`Invalid time: ${parsedDate.invalidReason}`);
                return;
            }

            const convertedDate = parsedDate.setZone(timezoneTo);

            const embed = new MessageEmbed()
                .setTitle("Time Conversion")
                .setColor("#00f2ff")
                .addFields(
                    { name: timezoneFrom || '\u200B', value: `${parsedDate.toLocaleString(DateTime.DATETIME_MED)}`, inline: true },
                    { name: '\u200B', value: " ➡️ ", inline: true},
                    { name: timezoneTo || '\u200B', value: `${convertedDate.toLocaleString(DateTime.DATETIME_MED)}`, inline: true },
                )

            await interaction.editReply({ embeds: [embed] });
        } 

        // ------------------------------------------------------------------------------------

        else if (subcommand === "currency") {
            const amount = interaction.options.getString("amount", true);
            const currency = interaction.options.getString("currency", true);

            const embed = new MessageEmbed()
                .setTitle("Currency Conversion")
                .setDescription("This command is not yet implemented.")
                .addFields(
                    { name: "Amount", value: amount },
                    { name: "Currency", value: currency }
                )

            await interaction.editReply({ embeds: [embed] });
        }

    }

}

export default convert;