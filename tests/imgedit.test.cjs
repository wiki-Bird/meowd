const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCanvas, loadImage } = require('canvas');
const { interaction } = require('./helpers.cjs');
const imgedit = require('../src/commands/imgedit.ts').default;

for (const [action, expected] of [['blank', [10, 20, 30, 255]], ['invert', [245, 235, 225, 255]]]) {
    test(`GIVEN a solid avatar WHEN ${action} is used THEN it returns the expected PNG`, async t => {
        const source = createCanvas(1, 1);
        const context = source.getContext('2d');
        context.fillStyle = 'rgb(10, 20, 30)';
        context.fillRect(0, 0, 1, 1);
        const input = interaction(t, { action });
        input.user = { displayAvatarURL: () => source.toDataURL() };
        await imgedit.execute(input);
        assert.equal(input.deferReply.mock.callCount(), 1);
        assert.equal(input.edits.length, 1);
        const reply = input.edits[0];
        assert.equal(reply.files[0].name, 'image.png');
        assert.equal(reply.embeds[0].toJSON().image.url, 'attachment://image.png');
        assert.equal(reply.files[0].attachment.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        const image = await loadImage(reply.files[0].attachment);
        assert.deepEqual([image.width, image.height], [1024, 1024]);
        context.drawImage(image, 0, 0, 1, 1);
        assert.deepEqual([...context.getImageData(0, 0, 1, 1).data], expected);
    });
}

test('WHEN an image is uploaded THEN imgedit uses it without requesting an avatar', async t => {
    t.mock.method(console, 'log', () => {});
    const source = createCanvas(1, 1);
    const context = source.getContext('2d');
    context.fillStyle = 'rgb(70, 80, 90)';
    context.fillRect(0, 0, 1, 1);
    const input = interaction(t, {
        action: 'blank', attachment: { contentType: 'image/png', url: source.toDataURL() },
    });
    input.user = { displayAvatarURL() { assert.fail('An upload should not use the avatar'); } };
    await imgedit.execute(input);
    assert.equal(input.edits.length, 1);
    const image = await loadImage(input.edits[0].files[0].attachment);
    context.drawImage(image, 0, 0, 1, 1);
    assert.deepEqual([...context.getImageData(0, 0, 1, 1).data], [70, 80, 90, 255]);
});

test('GIVEN no guild WHEN imgedit runs THEN it produces no image', async t => {
    const input = interaction(t, { action: 'blank' });
    input.guild = null;
    input.user = { displayAvatarURL() { assert.fail('No image should be requested'); } };
    await imgedit.execute(input);
    assert.equal(input.edits.length, 0);
});

for (const [label, options, error] of [
    ['a text file', { attachment: { contentType: 'text/plain' } }, 'You must upload an image.'],
    ['a WebP', { attachment: { contentType: 'image/webp' } }, "You can't use webp images. sorry :("],
    ['both user and attachment', { user: '123', attachment: {} }, "You can't specify both a user and an attachment."],
]) {
    test(`WHEN imgedit receives ${label} THEN it rejects the input`, async t => {
        t.mock.method(console, 'log', () => {});
        const input = interaction(t, { action: 'blank', ...options });
        await imgedit.execute(input);
        assert.deepEqual(input.edits, [{ content: error }]);
    });
}
