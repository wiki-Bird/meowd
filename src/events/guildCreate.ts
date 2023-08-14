import Event from '../types/Event';

const guildCreate: Event = {
    name: 'guildCreate',
    execute: function () {
        console.log("Joined a new server");

    }
}

export default guildCreate;