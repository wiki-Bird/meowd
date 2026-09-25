const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Collection, TextChannel, VoiceChannel } = require('discord.js');
const { client, interaction, isPrivate } = require('./helpers.cjs');
const purge = require('../src/commands/purge.ts').default;

function channelInput(t, amount = 1, voice = false) {
    const input = interaction(t, { amount });
    const guild = { client, id: input.guild.id };
    const Channel = voice ? VoiceChannel : TextChannel;
    const channel = new Channel(guild, { id: '345678901234567890', name: 'general', type: voice ? 2 : 0 }, client);
    input.channel = channel;
    input.channelId = channel.id;
    client.channels.cache.set(channel.id, channel);
    t.after(() => client.channels.cache.clear());
    return input;
}

for (const amount of [1, 99]) {
    test(`WHEN purge requests ${amount} messages THEN it fetches one extra and deletes the returned batch`, async t => {
        const input = channelInput(t, amount);
        const messages = new Collection([['message', {}]]);
        const fetch = t.mock.method(input.channel.messages, 'fetch', async () => messages);
        const remove = t.mock.method(input.channel, 'bulkDelete', async () => messages);
        await purge.execute(input);
        assert.deepEqual(fetch.mock.calls[0].arguments, [{ limit: amount + 1 }]);
        assert.equal(remove.mock.callCount(), 1);
        assert.equal(remove.mock.calls[0].arguments[0], messages);
        assert.equal(input.replies.length, 1);
        assert.equal(input.replies[0].content, `Purged ${amount} messages from general.`);
        assert.equal(isPrivate(input.replies[0]), false);
    });
}

for (const reason of ['no guild', 'no cached channel', 'a voice channel']) {
    test(`GIVEN ${reason} WHEN purge runs THEN it does not delete or reply`, async t => {
        const input = channelInput(t, 1, reason === 'a voice channel');
        if (reason === 'no guild') input.guild = null;
        if (reason === 'no cached channel') client.channels.cache.clear();
        const remove = t.mock.method(input.channel, 'bulkDelete', async () => {});
        await purge.execute(input);
        assert.equal(remove.mock.callCount(), 0);
        assert.equal(input.replies.length, 0);
    });
}
