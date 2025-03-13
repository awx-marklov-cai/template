/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event, Emitter } from './event';
export class Sequence {
    constructor() {
        this.elements = [];
        this._onDidSplice = new Emitter();
        this.onDidSplice = this._onDidSplice.event;
    }
    splice(start, deleteCount, toInsert = []) {
        this.elements.splice(start, deleteCount, ...toInsert);
        this._onDidSplice.fire({ start, deleteCount, toInsert });
    }
}
export class SimpleSequence {
    get elements() {
        return this._elements;
    }
    constructor(elements, onDidAdd, onDidRemove) {
        this._elements = [...elements];
        this.onDidSplice = Event.any(Event.map(onDidAdd, (e) => ({
            start: this.elements.length,
            deleteCount: 0,
            toInsert: [e],
        })), Event.map(Event.filter(Event.map(onDidRemove, (e) => this.elements.indexOf(e)), (i) => i > -1), (i) => ({ start: i, deleteCount: 1, toInsert: [] })));
        this.disposable = this.onDidSplice(({ start, deleteCount, toInsert }) => this._elements.splice(start, deleteCount, ...toInsert));
    }
    dispose() {
        this.disposable.dispose();
    }
}
