import { CommandInteraction } from 'discord.js';

export interface ValidatedNumber {
    timeInMS: number;
    timeString: string;
}


export default async function validateDuration(time: string, interaction: CommandInteraction<"cached" | "raw"> | undefined): Promise<ValidatedNumber | false> {

    // first part of time will be a number, the second part will be m/min, h/hrs/hours/etc, d. Break it into these two parts.
    let midPoint = 0;
    for (let i = 0; i < time.length; i++) {
        if (time[i] === 'm' || time[i] === 'h' || time[i] === 'd') {
            midPoint = i;
            break;
        }
    } 
    if ( midPoint == 0 ) {
        try{
            if (interaction !== undefined) await interaction.reply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1hr`, `4minutes`", ephemeral: true });
        }
        catch(e){
            if (interaction !== undefined) await interaction.editReply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1hr`, `4minutes`" });
        }
        return false;
    }

    const timeNumber = time.slice(0, midPoint);
    const timeUnit = time[midPoint]; // D.js only handles m, h, d, so we don't need to check for anything else -- even if the user enters it.

    // check if timeNumber is a number
    if (isNaN(Number(timeNumber)) === true) {
        try{
            if (interaction !== undefined) await interaction.reply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1hr`, `4minutes`", ephemeral: true });
        }
        catch(e){
            if (interaction !== undefined) await interaction.editReply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1hr`, `4minutes`" });
        }
        return false;
    }

    return {
        timeInMS: Number(timeNumber) * (timeUnit === 'm' ? 60000 : timeUnit === 'h' ? 3600000 : timeUnit === 'd' ? 86400000 : 0),
        timeString: timeNumber + timeUnit
    }

}
