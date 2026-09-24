const { test } = require('node:test');
const assert = require('node:assert/strict');
require('./helpers.cjs');

function options(data) {
    return data.options.map(option => [option.name, option.type, option.required ?? false]);
}

for (const [name, expected] of [
    ['help', []],
    ['poll', [['title', 3, true], ['options', 3, false]]],
    ['imgedit', [['action', 3, true], ['user', 3, false], ['attachment', 11, false], ['text', 3, false]]],
    ['purge', [['amount', 4, true]]],
    ['roll', [['simple', 1, false], ['advanced', 1, false]]],
    ['convert', [['time', 1, false], ['currency', 1, false]]],
]) {
    test(`WHEN /${name} is serialized THEN its name and option types stay the same`, () => {
        const data = require(`../src/commands/${name}.ts`).default.data.toJSON();
        assert.equal(data.name, name);
        assert.deepEqual(options(data), expected);
    });
}

test('WHEN /imgedit is serialized THEN all image actions are available', () => {
    const data = require('../src/commands/imgedit.ts').default.data.toJSON();
    assert.deepEqual(data.options[0].choices.map(choice => choice.value), [
        'speechbubble', 'rainbow', 'jerma', 'superpoint', 'invert', '1984', 'puter', 'bomb', 'blank',
    ]);
});

test('WHEN /purge is serialized THEN its permissions and amount limits are preserved', () => {
    const data = require('../src/commands/purge.ts').default.data.toJSON();
    assert.equal(data.default_member_permissions, '8200'); // Administrator or Manage Messages.
    assert.equal(data.options[0].min_value, 1);
    assert.equal(data.options[0].max_value, 99);
});

test('WHEN /roll is serialized THEN both forms retain their inputs and count limit', () => {
    const { options: [simple, advanced] } = require('../src/commands/roll.ts').default.data.toJSON();
    assert.deepEqual(options(simple), [['max', 10, true], ['count', 10, false], ['modifier', 3, false]]);
    assert.equal(simple.options[1].max_value, 24);
    assert.deepEqual(options(advanced), [['formula', 3, true]]);
});

test('WHEN /convert is serialized THEN both conversions require their inputs', () => {
    const { options: [time, currency] } = require('../src/commands/convert.ts').default.data.toJSON();
    assert.deepEqual(options(time), [['time', 3, true], ['timezone', 3, true]]);
    assert.deepEqual(options(currency), [['amount', 3, true], ['currency', 3, true]]);
});

test('WHEN /config is serialized THEN channel settings stay grouped and admin-only', () => {
    const data = require('../src/commands/config.ts').default.data.toJSON();
    assert.equal(data.name, 'config');
    assert.equal(data.default_member_permissions, '8');
    const group = data.options.find(option => option.name === 'otterchannels');
    assert.equal(group.type, 2);
    assert.deepEqual(options(group), [['add', 1, false], ['remove', 1, false], ['list', 1, false]]);
    for (const command of group.options.slice(0, 2)) {
        assert.deepEqual(options(command), [['channel', 7, true]]);
    }
});
