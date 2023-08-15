import { client } from '..';
import { Interaction } from 'discord.js';
import Event from '../types/Event';

// const interactionCreate: Event = {
const interactionCreate: Event<[Interaction]> = {
    name: 'interactionCreate',
    execute: function (interaction: Interaction) {
        if (!interaction.isCommand() || !interaction.inGuild()) return;

        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
             command.execute(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}

export default interactionCreate;