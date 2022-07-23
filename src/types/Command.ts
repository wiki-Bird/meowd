import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default interface Command {
    data: SlashCommandBuilder;

    /** The <"cached" | "raw"> is Discord.js's way of showing that this interaction is in a guild. */
    execute: (interaction: CommandInteraction<"cached" | "raw">) => Promise<void>;
}


// v This interfact sets what it can be so typescript knows types
// interface MyObj {
//     hello: true;
//     world: string;
//     fieldA?: Function; //? = might not be there
// }

// This is what you have, it must obey the interfact
// const myObj: MyObj = {
//     'hello': true,
//     'world': 'a string'
// }

// You can call the key from the function like this, and hovering over .hello shows type
// myObj.hello;