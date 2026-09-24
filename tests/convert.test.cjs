const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Settings } = require('luxon');
const { interaction } = require('./helpers.cjs');
const convert = require('../src/commands/convert.ts').default;

function freezeTime(t, now = '2026-01-15T00:00:00Z') {
    t.mock.method(Date, 'now', () => Date.parse(now));
    const locale = Settings.defaultLocale;
    Settings.defaultLocale = 'en-US';
    t.after(() => { Settings.defaultLocale = locale; });
}

for (const [label, now, time, timezone, from, to, expected] of [
    ['summer time across midnight', '2026-01-15', '9:00am nzt', 'utc', 'Pacific/Auckland', 'UTC', 'Jan 14, 2026, 8:00 PM'],
    ['winter time', '2026-07-15', '9:00 NZT', 'UTC', 'Pacific/Auckland', 'UTC', 'Jul 14, 2026, 9:00 PM'],
    ['a half-hour offset', '2026-01-15', '13:30 UTC', 'ACDT', 'UTC', 'Australia/Adelaide', 'Jan 16, 2026, 12:00 AM'],
    ['a timezone without a time', '2026-01-15', 'NZT', 'UTC', 'Pacific/Auckland', 'UTC', 'Jan 15, 2026, 12:00 AM'],
]) {
    test(`WHEN converting ${label} THEN the reply shows the correct date and time`, async t => {
        freezeTime(t, `${now}T00:00:00Z`);
        const input = interaction(t, { subcommand: 'time', time, timezone });
        await convert.execute(input);
        assert.equal(input.deferReply.mock.callCount(), 1);
        assert.equal(input.edits.length, 1);
        const embed = input.edits[0].embeds[0].toJSON();
        assert.equal(embed.title, 'Time Conversion');
        assert.equal(embed.fields[0].name, from);
        assert.equal(embed.fields[2].name, to);
        assert.equal(embed.fields[2].value.replace(/\u202f/g, ' '), expected);
    });
}

for (const time of ['25:00 UTC', '9:00 Not/AZone', 'nonsense UTC']) {
    test(`WHEN converting ${time} THEN it replies with an invalid-time error`, async t => {
        freezeTime(t);
        const input = interaction(t, { subcommand: 'time', time, timezone: 'UTC' });
        await convert.execute(input);
        assert.equal(input.edits.length, 1);
        assert.match(input.edits[0], /^Invalid time: /);
    });
}

for (const [time, expected] of [['12am UTC', 'Jan 15, 2026, 12:00 AM'], ['12pm UTC', 'Jan 15, 2026, 12:00 PM']]) {
    test(`WHEN converting ${time} THEN noon and midnight are preserved`, {
    }, async t => {
        freezeTime(t);
        const input = interaction(t, { subcommand: 'time', time, timezone: 'UTC' });
        await convert.execute(input);
        assert.equal(input.edits[0].embeds[0].toJSON().fields[2].value.replace(/\u202f/g, ' '), expected);
    });
}

test('WHEN the destination timezone is invalid THEN it replies with an error', {
}, async t => {
    freezeTime(t);
    const input = interaction(t, { subcommand: 'time', time: '9:00 UTC', timezone: 'Not/AZone' });
    await convert.execute(input);
    assert.equal(input.edits.length, 1);
    assert.equal(typeof input.edits[0], 'string');
    assert.match(input.edits[0], /^Invalid (time|timezone): /);
});
