const { Client, ClientUser, Collection, Message } = require('discord.js');
const { after } = require('node:test');

const client = new Client({ intents: [] });
client.user = new ClientUser(client, {
    id: '123456789012345678', username: 'Meowd', discriminator: '0001', avatar: null, bot: true,
});
client.commands = new Collection();

// Keep imports of the bot entry point from starting Discord or Firebase.
const entry = require.resolve('../src/index.ts');
require.cache[entry] = { id: entry, filename: entry, loaded: true, exports: { client } };
after(() => client.destroy());

function interaction(t, options = {}) {
    const replies = [];
    const edits = [];
    const message = Object.create(Message.prototype);
    message.react = t.mock.fn(async () => {});
    return {
        replies, edits, message,
        user: client.user,
        guild: { id: '234567890123456789' },
        options: {
            getString: name => options[name] ?? null,
            getNumber: name => options[name] ?? null,
            getInteger: name => options[name] ?? null,
            getAttachment: name => options[name] ?? null,
            getSubcommand: () => options.subcommand,
        },
        reply: t.mock.fn(async payload => {
            replies.push(payload);
            if (payload.fetchReply) return message;
            if (payload.withResponse) return { resource: { message } };
        }),
        editReply: t.mock.fn(async payload => { edits.push(payload); return message; }),
        deferReply: t.mock.fn(async () => {}),
        fetchReply: t.mock.fn(async () => message),
    };
}

function isPrivate(payload) {
    // Discord's ephemeral flag is 64; v13 also accepts a boolean.
    return payload.ephemeral === true || (Number(payload.flags ?? 0) & 64) !== 0;
}

module.exports = { client, interaction, isPrivate };
