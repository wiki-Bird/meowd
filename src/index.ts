// a file that's run each day that sends an image to each channel saved
// a slash command that lets server admins add channels to a database
// a file that checks when the bot joins a new guild and runs said command

import { Client, Collection, Intents } from 'discord.js';
import OtterClient from './types/OtterClient';
import { readdirSync } from 'fs';
import { join } from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

// const express = require('express');
// const { token } = require('../config.json');
// const { clientId } = require('../config.json');

import config from '../config.json';
const { token, clientId } = config as { token: string; clientId: string; };

// const myIntents = new Intents();
// myIntents.add('DIRECT_MESSAGES', 'FLAGS.GUILDS', 'MESSAGE_CONTENT', 'AUTO_MODERATION_EXECUTION','GUILD_MESSAGE_REACTIONS',
// 'GUILD_BANS', 'GUILD_MEMBERS', 'GUILDS');
//add all intents:
// myIntents.add(Intents.ALL);

export const client= new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES,
Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS], partials: ["CHANNEL"] }) as OtterClient

// FIREBASE:
// Import the functions you need from the SDKs you need
import admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database";

// Fetch the service account key JSON file contents
const serviceAccount = require("../meowd-bot-firebase-adminsdk-2g9mv-5423d91b65.json");

// Initialize the app with a service account, granting admin privileges
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://meowd-bot-default-rtdb.firebaseio.com/"
});

const database = getDatabase(app);
export const ref = database.ref("restricted_access/secret_document");

// As an admin, the app has access to read and write all data, regardless of Security Rules
ref.once("value", function() {
    console.log("Connected to Firebase Database");
});




// Load the commands
const commandCheck = async () => {
    const basePath = join(__dirname, "commands");

    const commands = [];
    const commandFiles = readdirSync(basePath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
        const command = require(join(basePath, file)).default;
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data:any = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
}


// Start the bot
const init = async () => {
    client.commands = new Collection();
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = require(filePath).default;
        client.commands.set(command.data.name, command);
    }

    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    
    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event = require(filePath).default;
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }


    client.login(token);


    // process.env.PORT lets the port be set by Heroku
    // const port = process.env.PORT || 8080;
    // HEROKU NO LONGER USED

}

// Run the bot
const main = async () => {
    await init();
    await commandCheck();
}

main();
