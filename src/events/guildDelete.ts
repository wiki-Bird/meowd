import { Guild } from 'discord.js';
import Event from '../types/Event';

// const guildDelete: Event = {
const guildDelete: Event<[Guild]> = {
    name: 'guildDelete',
    execute: function() {
    console.log("Left a server");

    }
}

export default guildDelete;