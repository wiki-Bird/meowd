const { test } = require('node:test');
const assert = require('node:assert/strict');
const { interaction, isPrivate } = require('./helpers.cjs');
const validateDuration = require('../src/functions/validateDuration.ts').default;

for (const [input, timeInMS, timeString] of [
    ['30s', 30000, '30s'], ['4minutes', 240000, '4m'],
    ['1.5hrs', 5400000, '1.5h'], ['28d', 2419200000, '28d'], ['0s', 0, '0s'],
]) {
    test(`WHEN duration ${input} is parsed THEN it returns ${timeInMS} milliseconds`, async () => {
        assert.deepEqual(await validateDuration(input, undefined), { timeInMS, timeString });
    });
}

for (const value of ['', '12', 'hours', 'xm']) {
    test(`WHEN duration ${JSON.stringify(value)} is invalid THEN it returns false and privately explains`, async t => {
        const input = interaction(t);
        assert.equal(await validateDuration(value, input), false);
        assert.equal(input.replies.length, 1);
        assert.match(input.replies[0].content, /^Invalid time\./);
        assert.ok(isPrivate(input.replies[0]));
    });
}

test('GIVEN a reply already exists WHEN a duration is invalid THEN it edits the reply', async t => {
    const input = interaction(t);
    input.reply = t.mock.fn(async () => { throw new Error('Already replied'); });
    assert.equal(await validateDuration('bad', input), false);
    assert.equal(input.edits.length, 1);
    assert.match(input.edits[0].content, /^Invalid time\./);
});

test('WHEN a duration is invalid without an interaction THEN it returns false', async () => {
    assert.equal(await validateDuration('bad', undefined), false);
});
