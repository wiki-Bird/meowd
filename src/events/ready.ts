import { ActivityType, Events } from 'discord.js';
import Event from '../types/Event';
import OtterClient from '../types/OtterClient';

//const ready: Event = {
const ready: Event<[OtterClient]> = {
	name: Events.ClientReady,
	once: true,
	execute: function (client: OtterClient) {
		console.log(`Ready! Logged in as ${client.user.username}`);
        client.user.setActivity("/help", { type: ActivityType.Watching } );
	}
}

export default ready;