/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(value: string): boolean {
	return _UUIDPattern.test(value);
}
if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(targetLength, padString): string {
		targetLength = targetLength >> 0;
		padString = String(typeof padString !== 'undefined' ? padString : ' ');
		if (this.length > targetLength) {
			return String(this);
		} else {
			targetLength = targetLength - this.length;
			if (targetLength > padString.length) {
				padString += padString.repeat(targetLength / padString.length);
			}
			return padString.slice(0, targetLength) + String(this);
		}
	};
}
// prep-work
const _data = new Uint8Array(16);
const _hex: string[] = [];
for (let i = 0; i < 256; i++) {
	_hex.push(i.toString(16).padStart(2, '0'));
}

// todo@jrieken - with node@15 crypto#getRandomBytes is available everywhere, https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues#browser_compatibility
let _fillRandomValues: (bucket: Uint8Array) => Uint8Array;

declare const crypto: undefined | { getRandomValues(data: Uint8Array): Uint8Array };

if (typeof crypto === 'object' && typeof crypto.getRandomValues === 'function') {
	// browser
	_fillRandomValues = crypto.getRandomValues.bind(crypto);
} else {
	_fillRandomValues = function (bucket: Uint8Array): Uint8Array {
		for (let i = 0; i < bucket.length; i++) {
			bucket[i] = Math.floor(Math.random() * 256);
		}
		return bucket;
	};
}

export function generateUuid(joinChar = '-'): string {
	// get data
	_fillRandomValues(_data);

	// set version bits
	_data[6] = (_data[6] & 0x0f) | 0x40;
	_data[8] = (_data[8] & 0x3f) | 0x80;

	// print as string
	let i = 0;
	let result = '';
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += joinChar;
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += joinChar;
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += joinChar;
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += joinChar;
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	result += _hex[_data[i++]];
	return result;
}
