import { Guild } from 'discord.js';
import Event from '../types/Event';

// const guildCreate: Event = {
const guildCreate: Event<[Guild]> = {
    name: 'guildCreate',
    execute: function () {
        console.log("Joined a new server");

    }
}

export default guildCreate;