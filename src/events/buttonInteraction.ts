import { ButtonInteraction } from 'discord.js';
import Event from '../types/Event';


// const buttonInteraction: Event = {
const buttonInteraction: Event<[ButtonInteraction]> = {
    name: 'buttonInteraction',
    execute: function (){
        console.log("Button interaction event fired.");
    }
}

export default buttonInteraction;