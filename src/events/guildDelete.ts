import { Interaction } from 'discord.js';
import Event from '../types/Event';

const guildDelete: Event = {
    name: 'guildDelete',
    execute: function(interaction: Interaction) {
    console.log("Left a server");

    }
}

export default guildDelete;