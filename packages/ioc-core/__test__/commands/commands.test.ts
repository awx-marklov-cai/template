import assert from 'assert';
import { describe, test } from 'vitest';
import { CommandsRegistry } from '@/commands/commands';

describe('Command Tests', function () {
	test('register command - no handler', function () {
		assert.throws(() => CommandsRegistry.registerCommand('foo', null!));
	});

	test('register/dispose', () => {
		const command = function () {};
		const reg = CommandsRegistry.registerCommand('foo', command);
		assert.ok(CommandsRegistry.getCommand('foo')!.handler === command);
		reg.dispose();
		assert.ok(CommandsRegistry.getCommand('foo') === undefined);
	});

	test('register/register/dispose', () => {
		const command1 = function () {};
		const command2 = function () {};

		// dispose overriding command
		const reg1 = CommandsRegistry.registerCommand('foo', command1);
		assert.ok(CommandsRegistry.getCommand('foo')!.handler === command1);

		const reg2 = CommandsRegistry.registerCommand('foo', command2);
		assert.ok(CommandsRegistry.getCommand('foo')!.handler === command2);
		reg2.dispose();

		assert.ok(CommandsRegistry.getCommand('foo')!.handler === command1);
		reg1.dispose();
		assert.ok(CommandsRegistry.getCommand('foo') === undefined);
	});
});
