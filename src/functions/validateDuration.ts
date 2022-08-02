import { CommandInteraction } from 'discord.js';

export interface ValidatedNumber {
    timeInMS: number;
    timeString: string;
}


export default async function validateDuration(time: string, interaction: CommandInteraction<"cached" | "raw">): Promise<ValidatedNumber | false> {

    // first part of time will be a number, the second part will be m, h, d. Break it into these two parts.
    var midPoint = 0;
    for (var i = 0; i < time.length; i++) {
        if (time[i] === 'm' || time[i] === 'h' || time[i] === 'd') {
            midPoint = i;
            break;
        }
    } 
    if ( midPoint == 0 ) {
        try{
            await interaction.reply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1h`, `4m`", ephemeral: true });
        }
        catch(e){
            await interaction.editReply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1h`, `4m`" });
        }
        return false;
    }

    var timeNumber = time.slice(0, midPoint);
    var timeUnit = time.slice(midPoint);

    // check if timeNumber is a number
    if (isNaN(Number(timeNumber)) === true) {
        try{
            await interaction.reply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1h`, `4m`", ephemeral: true });
        }
        catch(e){
            await interaction.editReply({ content: "Invalid time. Please provide a number followed by a time unit, eg: `12d`, `1h`, `4m`" });
        }
        return false;
    }

    return {
        timeInMS: Number(timeNumber) * (timeUnit === 'm' ? 60000 : timeUnit === 'h' ? 3600000 : timeUnit === 'd' ? 86400000 : 0),
        timeString: timeNumber + timeUnit
    }

}
