const { test } = require('node:test');
const assert = require('node:assert/strict');
const { client, interaction, isPrivate } = require('./helpers.cjs');
const dispatch = require('../src/events/interactionCreate.ts').default;
const ready = require('../src/events/ready.ts').default;

function commandInput(t, { command = true, guild = true, name = 'test' } = {}) {
    return Object.assign(interaction(t), {
        commandName: name,
        isCommand: () => command,
        isChatInputCommand: () => command,
        inGuild: () => guild,
    });
}

test('GIVEN a registered command WHEN it is used in a guild THEN it receives the interaction once', t => {
    const execute = t.mock.fn();
    client.commands.set('test', { execute });
    t.after(() => client.commands.clear());
    const input = commandInput(t);
    dispatch.execute(input);
    assert.equal(execute.mock.callCount(), 1);
    assert.equal(execute.mock.calls[0].arguments[0], input);
    assert.equal(input.replies.length, 0);
});

for (const [label, options] of [
    ['a non-command interaction', { command: false }],
    ['a command in DMs', { guild: false }],
    ['an unknown command', { name: 'missing' }],
]) {
    test(`WHEN ${label} arrives THEN no command runs and no reply is sent`, t => {
        const execute = t.mock.fn();
        client.commands.set('test', { execute });
        t.after(() => client.commands.clear());
        const input = commandInput(t, options);
        dispatch.execute(input);
        assert.equal(execute.mock.callCount(), 0);
        assert.equal(input.replies.length, 0);
    });
}

test('WHEN a command throws synchronously THEN the event sends a private error', t => {
    t.mock.method(console, 'error', () => {});
    client.commands.set('test', { execute() { throw new Error('Failed'); } });
    t.after(() => client.commands.clear());
    const input = commandInput(t);
    dispatch.execute(input);
    assert.equal(input.replies.length, 1);
    assert.equal(input.replies[0].content, 'There was an error while executing this command!');
    assert.ok(isPrivate(input.replies[0]));
});

test('WHEN the ready handler runs THEN it broadcasts a watching /help activity', t => {
    t.mock.method(console, 'log', () => {});
    const broadcast = t.mock.method(client.ws, 'broadcast', () => {});
    ready.execute(client);
    assert.equal(ready.once, true);
    assert.equal(broadcast.mock.callCount(), 1);
    const activity = broadcast.mock.calls[0].arguments[0].d.activities[0];
    assert.equal(activity.name, '/help');
    assert.equal(activity.type, 3);
});
