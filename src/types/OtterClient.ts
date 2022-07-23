import { Client, Collection } from 'discord.js';
import Command from './Command';


export default interface OtterClient extends Client<true> {
    commands: Collection<string, Command>;
}