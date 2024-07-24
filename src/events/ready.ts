import Event from '../types/Event';
import OtterClient from '../types/OtterClient';

//const ready: Event = {
const ready: Event<[OtterClient]> = {
	name: 'ready',
	once: true,
	execute: function (client: OtterClient) {
		console.log(`Ready! Logged in as ${client.user.username}`);
        client.user.setActivity("/help", { type: "WATCHING" } );
	}
}

export default ready;