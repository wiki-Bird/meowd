const { test } = require('node:test');
const assert = require('node:assert/strict');
const { interaction, isPrivate } = require('./helpers.cjs');
const poll = require('../src/commands/poll.ts').default;

test('WHEN a poll has no options THEN it offers yes, no and unsure reactions', async t => {
    const input = interaction(t, { title: 'Lunch?' });
    await poll.execute(input);
    assert.equal(input.replies.length, 1);
    const embed = input.replies[0].embeds[0].toJSON();
    assert.equal(embed.title, 'Lunch?');
    assert.equal(embed.footer.text, 'Poll created by Meowd with /poll');
    assert.equal(isPrivate(input.replies[0]), false);
    assert.deepEqual(input.message.react.mock.calls.map(call => call.arguments[0]), ['👍', '👎', '🤷']);
});

test('WHEN a poll has named options THEN its text and reactions match their order', async t => {
    const input = interaction(t, { title: 'Lunch?', options: 'Soup,Pasta' });
    await poll.execute(input);
    assert.equal(input.replies.length, 1);
    assert.equal(input.replies[0].embeds[0].toJSON().description, '🇦 Soup\n\n🇧 Pasta\n\n');
    assert.deepEqual(input.message.react.mock.calls.map(call => call.arguments[0]), ['🇦', '🇧']);
});

test('WHEN a poll has 20 options THEN all 20 receive a reaction', async t => {
    const input = interaction(t, { title: 'Pick one', options: Array.from({ length: 20 }, (_, i) => `Choice ${i + 1}`).join(',') });
    await poll.execute(input);
    assert.equal(input.replies.length, 1);
    assert.equal(input.message.react.mock.callCount(), 20);
    assert.equal(input.message.react.mock.calls[19].arguments[0], '🇹');
});

test('WHEN a poll has 21 options THEN it only sends a private error', async t => {
    const input = interaction(t, { title: 'Pick one', options: Array(21).fill('Choice').join(',') });
    await poll.execute(input);
    assert.match(input.replies[0].content, /maximum number of options is 20/);
    assert.ok(isPrivate(input.replies[0]));
    assert.equal(input.replies.length, 1);
    assert.equal(input.message.react.mock.callCount(), 0);
});
