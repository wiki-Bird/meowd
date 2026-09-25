const { test } = require('node:test');
const assert = require('node:assert/strict');
const { interaction, isPrivate } = require('./helpers.cjs');
const roll = require('../src/commands/roll.ts').default;

for (const [random, expected] of [[0, 1], [0.999999, 6]]) {
    test(`GIVEN random value ${random} WHEN a d6 is rolled THEN the result is ${expected}`, async t => {
        t.mock.method(Math, 'random', () => random);
        const input = interaction(t, { subcommand: 'simple', max: 6 });
        await roll.execute(input);
        assert.equal(input.replies.length, 1);
        assert.deepEqual(input.replies[0].embeds[0].toJSON().fields.map(field => field.value), [`**Die 1:** ${expected}`]);
    });
}

for (const [modifier, expected] of [['+2', 6], ['-2', 2], ['x2', 8], ['%3', 1], ['^2', 16]]) {
    test(`GIVEN a roll of 4 WHEN modifier ${modifier} is used THEN each die becomes ${expected}`, async t => {
        t.mock.method(Math, 'random', () => 0.5);
        const input = interaction(t, { subcommand: 'simple', max: 6, count: 2, modifier });
        await roll.execute(input);
        assert.deepEqual(input.replies[0].embeds[0].toJSON().fields.map(field => field.value), [
            `**Die 1:** ${expected}`, `**Die 2:** ${expected}`,
        ]);
    });
}

test('WHEN multiple advanced rolls use modifiers THEN each total and calculation is shown', async t => {
    t.mock.method(Math, 'random', () => 0);
    const input = interaction(t, { subcommand: 'advanced', formula: '2d6+1, 1d4x2' });
    await roll.execute(input);
    assert.equal(input.replies.length, 1);
    assert.deepEqual(input.replies[0].embeds[0].toJSON().fields.map(field => field.value), [
        '**Die 1 - 2d6+1:** ', '3', '(1+1)+1', '**Die 2 - 1d4x2:** ', '2', '(1)x2',
    ]);
});

test('WHEN an advanced roll reaches both allowed limits THEN all 24 dice are rolled', async t => {
    const random = t.mock.method(Math, 'random', () => 0.9999999);
    const input = interaction(t, { subcommand: 'advanced', formula: '24d1000000' });
    await roll.execute(input);
    assert.equal(random.mock.callCount(), 24);
    assert.equal(input.replies.length, 1);
    const fields = input.replies[0].embeds[0].toJSON().fields;
    assert.equal(fields[1].value, '24000000');
    assert.equal(fields[2].value, '(' + Array(24).fill('1000000').join('+') + ')');
});

for (const formula of ['bad', '0d6', '25d6', '1d0', '1d1000001']) {
    test(`WHEN advanced formula ${formula} is used THEN it only sends a private error`, async t => {
        const input = interaction(t, { subcommand: 'advanced', formula });
        await roll.execute(input);
        assert.equal(input.replies.length, 1);
        assert.match(input.replies[0].content, /^Invalid formula/);
        assert.ok(isPrivate(input.replies[0]));
    });
}

for (const [modifier, error] of [['q2', /Invalid modifier/], ['+no', /Invalid modifier/], ['/2', /Division is not supported/]]) {
    test(`WHEN simple modifier ${modifier} is used THEN it only sends a private error`, async t => {
        const input = interaction(t, { subcommand: 'simple', max: 6, modifier });
        await roll.execute(input);
        assert.equal(input.replies.length, 1);
        assert.match(input.replies[0].content, error);
        assert.ok(isPrivate(input.replies[0]));
    });
}
