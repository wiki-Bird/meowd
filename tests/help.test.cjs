const { test } = require('node:test');
const assert = require('node:assert/strict');
const { interaction, isPrivate } = require('./helpers.cjs');
const help = require('../src/commands/help.ts').default;

test('WHEN help is requested THEN it privately sends the guide and support button', async t => {
    const input = interaction(t);
    await help.execute(input);
    assert.equal(input.replies.length, 1);
    const reply = input.replies[0];
    assert.ok(isPrivate(reply));
    const embed = reply.embeds[0].toJSON();
    assert.equal(embed.author.name, 'Meowd Help');
    assert.equal(embed.fields.length, 3);
    assert.match(embed.fields[0].value, /https:\/\/meowd\.ramiels\.me\/commands/);
    const row = reply.components[0].toJSON();
    assert.equal(row.type, 1);
    assert.equal(row.components.length, 1);
    const button = row.components[0];
    assert.equal(button.type, 2);
    assert.equal(button.label, 'Support');
    assert.equal(button.style, 5);
    assert.equal(button.url, 'https://meowd.ramiels.me/');
});
