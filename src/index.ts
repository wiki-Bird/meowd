// a file that's run each day that sends an image to each channel saved
// a slash command that lets server admins add channels to a database
// a file that checks when the bot joins a new guild and runs said command

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import OtterClient from './types/OtterClient';
import { readdirSync } from 'fs';
import { join } from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

// const express = require('express');

// ESLint doesn't like this, but it's needed to fix yarn build
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { token, clientId } = require('../config.json');
// import config from '../config.json';
// const { token, clientId } = config;

// const myIntents = new Intents();
// myIntents.add('DIRECT_MESSAGES', 'FLAGS.GUILDS', 'MESSAGE_CONTENT', 'AUTO_MODERATION_EXECUTION','GUILD_MESSAGE_REACTIONS',
// 'GUILD_BANS', 'GUILD_MEMBERS', 'GUILDS');
//add all intents:
// myIntents.add(Intents.ALL);

export const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
}) as OtterClient

// FIREBASE:
// Import the functions you need from the SDKs you need
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// Fetch the service account key JSON file contents
// ESLint doesn't like this, but it's needed to use json files
// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceAccount = require("../meowd-bot-firebase-adminsdk-2g9mv-5423d91b65.json");

// Initialize the app with a service account, granting admin privileges
const app = initializeApp({
    credential: cert(serviceAccount),
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
        // const command = require(join(basePath, file)).default;
        // Load CommonJS modules in both ts-node development and compiled builds.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const commandModule = require(join(basePath, file));
        const command = commandModule.default;
        commands.push(command.data.toJSON());
        console.log(`Loaded Command: /${file}`);
    }

    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            ) as unknown[];

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
        // const command = require(filePath).default;
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const commandModule = require(filePath);
        const command = commandModule.default;
        client.commands.set(command.data.name, command);
    }

    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
    
    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const eventModule = require(filePath);
        const event = eventModule.default;
        console.log(`Loaded event: ${file}`);
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
