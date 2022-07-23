import Event from '../types/Event';
import OtterClient from '../types/OtterClient';

const ready: Event = {
	name: 'ready',
	once: true,
	execute: function (client: OtterClient) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity("/help", { type: "WATCHING" } );
	}
}

export default ready;