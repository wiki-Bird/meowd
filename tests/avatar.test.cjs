const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Guild, GuildMember } = require('discord.js');
const canvas = require('canvas');
const { client, interaction } = require('./helpers.cjs');
const imgedit = require('../src/commands/imgedit.ts').default;
const whois = require('../src/commands/whois.ts').default;

for (const [label, command, options, size] of [
    ['imgedit with your avatar', imgedit, { action: 'blank' }, 1024],
    ['imgedit with another user', imgedit, { action: 'blank', user: '345678901234567890' }, 1024],
    ['whois', whois, { user: '345678901234567890' }, 128],
]) {
    test(`GIVEN an animated avatar WHEN ${label} runs THEN Canvas receives a PNG URL`, async t => {
        const guild = new Guild(client, { id: '234567890123456789', name: 'Test', roles: [{ id: '234567890123456789', name: '@everyone', permissions: '0' }] });
        const member = new GuildMember(client, {
            user: { id: '345678901234567890', username: 'Test', discriminator: '0001', avatar: 'a_1234567890abcdef' },
            roles: [], joined_at: '2020-01-01T00:00:00Z',
        }, guild);
        t.mock.method(guild.members, 'fetch', async () => member);
        const source = canvas.createCanvas(1, 1);
        const load = t.mock.method(canvas, 'loadImage', async () => source);
        const input = interaction(t, options);
        input.guild = guild;
        input.user = member.user;
        await command.execute(input);
        assert.equal(load.mock.callCount(), 1);
        const url = new URL(load.mock.calls[0].arguments[0]);
        assert.equal(url.pathname, `/avatars/${member.id}/a_1234567890abcdef.png`);
        assert.equal(url.searchParams.get('size'), String(size));
        assert.equal(input.edits.length, 1);
    });
}
