const { test } = require('node:test');
const assert = require('node:assert/strict');
const discord = require('discord.js');
const { client } = require('./helpers.cjs');
const ready = require('../src/events/ready.ts').default;

test('WHEN Discord emits ready twice THEN the declared event runs once', t => {
    t.mock.method(console, 'log', () => {});
    const broadcast = t.mock.method(client.ws, 'broadcast', () => {});
    const handler = (...args) => ready.execute(...args);
    assert.equal(ready.once, true);
    client.once(ready.name, handler);
    t.after(() => client.removeListener(ready.name, handler));
    const event = discord.Events?.ClientReady ?? discord.Constants.Events.CLIENT_READY;
    client.emit(event, client);
    client.emit(event, client);
    assert.equal(broadcast.mock.callCount(), 1);
    const activity = broadcast.mock.calls[0].arguments[0].d.activities[0];
    assert.equal(activity.name, '/help');
    assert.equal(activity.type, 3);
});
