/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { describe, test, beforeEach } from 'vitest';
import { Event, Emitter } from '@/event';
import { IDisposable, DisposableStore } from '@/lifecycle';
import { errorHandler, setUnexpectedErrorHandler } from '@/errors';
import { timeout } from '@/async';

namespace Samples {
	export class EventCounter {
		count = 0;

		reset() {
			this.count = 0;
		}

		onEvent() {
			this.count += 1;
		}
	}

	export class Document3 {
		private readonly _onDidChange = new Emitter<string>();

		onDidChange: Event<string> = this._onDidChange.event;

		setText(value: string) {
			//...
			this._onDidChange.fire(value);
		}
	}
}

describe('Event', function () {
	const counter = new Samples.EventCounter();

	beforeEach(() => counter.reset());

	/**
	 * @vitest-environment jsdom
	 */
	test('Emitter plain', function () {
		const doc = new Samples.Document3();

		document.createElement('div').onclick = function () {};
		const subscription = doc.onDidChange(counter.onEvent, counter);

		doc.setText('far');
		doc.setText('boo');

		// unhook listener
		subscription.dispose();
		doc.setText('boo');
		assert.strictEqual(counter.count, 2);
	});

	test('Emitter, bucket', function () {
		const bucket: IDisposable[] = [];
		const doc = new Samples.Document3();
		const subscription = doc.onDidChange(counter.onEvent, counter, bucket);

		doc.setText('far');
		doc.setText('boo');

		// unhook listener
		while (bucket.length) {
			bucket.pop()!.dispose();
		}
		doc.setText('boo');

		// noop
		subscription.dispose();

		doc.setText('boo');
		assert.strictEqual(counter.count, 2);
	});

	test('Emitter, store', function () {
		const bucket = new DisposableStore();
		const doc = new Samples.Document3();
		const subscription = doc.onDidChange(counter.onEvent, counter, bucket);

		doc.setText('far');
		doc.setText('boo');

		// unhook listener
		bucket.clear();
		doc.setText('boo');

		// noop
		subscription.dispose();

		doc.setText('boo');
		assert.strictEqual(counter.count, 2);
	});

	test('onFirstAdd|onLastRemove', () => {
		let firstCount = 0;
		let lastCount = 0;
		const a = new Emitter({
			onFirstListenerAdd() {
				firstCount += 1;
			},
			onLastListenerRemove() {
				lastCount += 1;
			},
		});

		assert.strictEqual(firstCount, 0);
		assert.strictEqual(lastCount, 0);

		let subscription = a.event(function () {});
		assert.strictEqual(firstCount, 1);
		assert.strictEqual(lastCount, 0);

		subscription.dispose();
		assert.strictEqual(firstCount, 1);
		assert.strictEqual(lastCount, 1);

		subscription = a.event(function () {});
		assert.strictEqual(firstCount, 2);
		assert.strictEqual(lastCount, 1);
	});

	test('throwingListener', () => {
		const origErrorHandler = errorHandler.getUnexpectedErrorHandler();
		setUnexpectedErrorHandler(() => null);

		try {
			const a = new Emitter<undefined>();
			let hit = false;
			a.event(function () {
				// eslint-disable-next-line no-throw-literal
				throw 9;
			});
			a.event(function () {
				hit = true;
			});
			a.fire(undefined);
			assert.strictEqual(hit, true);
		} finally {
			setUnexpectedErrorHandler(origErrorHandler);
		}
	});

	test('reusing event function and context', function () {
		let counter = 0;
		function listener() {
			counter += 1;
		}
		const context = {};

		const emitter = new Emitter<undefined>();
		const reg1 = emitter.event(listener, context);
		const reg2 = emitter.event(listener, context);

		emitter.fire(undefined);
		assert.strictEqual(counter, 2);

		reg1.dispose();
		emitter.fire(undefined);
		assert.strictEqual(counter, 3);

		reg2.dispose();
		emitter.fire(undefined);
		assert.strictEqual(counter, 3);
	});

	test('Debounce Event', function () {
		const doc = new Samples.Document3();

		const onDocDidChange = Event.debounce(
			doc.onDidChange,
			(prev: string[] | undefined, cur) => {
				if (!prev) {
					prev = [cur];
				} else if (prev.indexOf(cur) < 0) {
					prev.push(cur);
				}
				return prev;
			},
			10,
		);

		let count = 0;

		onDocDidChange((keys) => {
			count++;
			assert.ok(keys, 'was not expecting keys.');
			if (count === 1) {
				doc.setText('4');
				assert.deepStrictEqual(keys, ['1', '2', '3']);
			} else if (count === 2) {
				assert.deepStrictEqual(keys, ['4']);
			}
		});

		doc.setText('1');
		doc.setText('2');
		doc.setText('3');
	});

	test('Debounce Event - leading', async function () {
		const emitter = new Emitter<void>();
		const debounced = Event.debounce(emitter.event, (l, e) => e, 0, /*leading=*/ true);

		let calls = 0;
		debounced(() => {
			calls++;
		});

		// If the source event is fired once, the debounced (on the leading edge) event should be fired only once
		emitter.fire();

		await timeout(1);
		assert.strictEqual(calls, 1);
	});

	test('Debounce Event - leading', async function () {
		const emitter = new Emitter<void>();
		const debounced = Event.debounce(emitter.event, (l, e) => e, 0, /*leading=*/ true);

		let calls = 0;
		debounced(() => {
			calls++;
		});

		// If the source event is fired multiple times, the debounced (on the leading edge) event should be fired twice
		emitter.fire();
		emitter.fire();
		emitter.fire();
		await timeout(1);
		assert.strictEqual(calls, 2);
	});

	test('Debounce Event - leading reset', async function () {
		const emitter = new Emitter<number>();
		const debounced = Event.debounce(emitter.event, (l, e) => (l ? l + 1 : 1), 0, /*leading=*/ true);

		const calls: number[] = [];
		debounced((e) => calls.push(e));

		emitter.fire(1);
		emitter.fire(1);

		await timeout(1);
		assert.deepStrictEqual(calls, [1, 1]);
	});
});
