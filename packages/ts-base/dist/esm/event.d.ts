import { IDisposable, DisposableStore } from './lifecycle';
import { LinkedList } from './LinkedList';
/**
 * To an event a function with one or zero parameters
 * can be subscribed. The event is the subscriber function itself.
 */
export interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
}
export declare namespace Event {
    const None: Event<any>;
    /**
     * Given an event, returns another event which only fires once.
     */
    function once<T>(event: Event<T>): Event<T>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function map<I, O>(event: Event<I>, map: (i: I) => O): Event<O>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function forEach<I>(event: Event<I>, each: (i: I) => void): Event<I>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function filter<T, U>(event: Event<T | U>, filter: (e: T | U) => e is T): Event<T>;
    function filter<T>(event: Event<T>, filter: (e: T) => boolean): Event<T>;
    function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R): Event<R>;
    /**
     * Given an event, returns the same event but typed as `Event<void>`.
     */
    function signal<T>(event: Event<T>): Event<void>;
    /**
     * Given a collection of events, returns a single event which emits
     * whenever any of the provided events emit.
     */
    function any<T>(...events: Event<T>[]): Event<T>;
    function any(...events: Event<any>[]): Event<void>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function reduce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, initial?: O): Event<O>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function debounce<T>(event: Event<T>, merge: (last: T | undefined, event: T) => T, delay?: number, leading?: boolean, leakWarningThreshold?: number): Event<T>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number, leading?: boolean, leakWarningThreshold?: number): Event<O>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function latch<T>(event: Event<T>, equals?: (a: T, b: T) => boolean): Event<T>;
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function split<T, U>(event: Event<T | U>, isT: (e: T | U) => e is T): [Event<T>, Event<U>];
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function buffer<T>(event: Event<T>, nextTick?: boolean, _buffer?: T[]): Event<T>;
    interface IChainableEvent<T> {
        event: Event<T>;
        map<O>(fn: (i: T) => O): IChainableEvent<O>;
        forEach(fn: (i: T) => void): IChainableEvent<T>;
        filter(fn: (e: T) => boolean): IChainableEvent<T>;
        filter<R>(fn: (e: T | R) => e is R): IChainableEvent<R>;
        reduce<R>(merge: (last: R | undefined, event: T) => R, initial?: R): IChainableEvent<R>;
        latch(): IChainableEvent<T>;
        debounce(merge: (last: T | undefined, event: T) => T, delay?: number, leading?: boolean, leakWarningThreshold?: number): IChainableEvent<T>;
        debounce<R>(merge: (last: R | undefined, event: T) => R, delay?: number, leading?: boolean, leakWarningThreshold?: number): IChainableEvent<R>;
        on(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
        once(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
    }
    /**
     * @deprecated DO NOT use, this leaks memory
     */
    function chain<T>(event: Event<T>): IChainableEvent<T>;
    interface NodeEventEmitter {
        on(event: string | symbol, listener: Function): unknown;
        removeListener(event: string | symbol, listener: Function): unknown;
    }
    function fromNodeEventEmitter<T>(emitter: NodeEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    interface DOMEventEmitter {
        addEventListener(event: string | symbol, listener: Function): void;
        removeEventListener(event: string | symbol, listener: Function): void;
    }
    function fromDOMEventEmitter<T>(emitter: DOMEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    function toPromise<T>(event: Event<T>): Promise<T>;
}
export type Listener<T> = [(e: T) => void, any] | ((e: T) => void);
export interface EmitterOptions {
    onFirstListenerAdd?: Function;
    onFirstListenerDidAdd?: Function;
    onListenerDidAdd?: Function;
    onLastListenerRemove?: Function;
    leakWarningThreshold?: number;
    /** ONLY enable this during development */
    _profName?: string;
}
export declare function setGlobalLeakWarningThreshold(n: number): IDisposable;
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private readonly _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
export declare class Emitter<T> {
    private readonly _options?;
    private readonly _leakageMon?;
    private readonly _perfMon?;
    private _disposed;
    private _event?;
    private _deliveryQueue?;
    protected _listeners?: LinkedList<Listener<T>>;
    constructor(options?: EmitterOptions);
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event(): Event<T>;
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event: T): void;
    dispose(): void;
}
