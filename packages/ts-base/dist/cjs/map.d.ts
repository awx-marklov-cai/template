import { URI } from './uri';
export declare function getOrSet<K, V>(map: Map<K, V>, key: K, value: V): V;
export declare function mapToString<K, V>(map: Map<K, V>): string;
export declare function setToString<K>(set: Set<K>): string;
export interface IKeyIterator<K> {
    reset(key: K): this;
    next(): this;
    hasNext(): boolean;
    cmp(a: string): number;
    value(): string;
}
export declare class StringIterator implements IKeyIterator<string> {
    private _value;
    private _pos;
    reset(key: string): this;
    next(): this;
    hasNext(): boolean;
    cmp(a: string): number;
    value(): string;
}
export declare class ConfigKeysIterator implements IKeyIterator<string> {
    private readonly _caseSensitive;
    private _value;
    private _from;
    private _to;
    constructor(_caseSensitive?: boolean);
    reset(key: string): this;
    hasNext(): boolean;
    next(): this;
    cmp(a: string): number;
    value(): string;
}
export declare class PathIterator implements IKeyIterator<string> {
    private readonly _splitOnBackslash;
    private readonly _caseSensitive;
    private _value;
    private _from;
    private _to;
    constructor(_splitOnBackslash?: boolean, _caseSensitive?: boolean);
    reset(key: string): this;
    hasNext(): boolean;
    next(): this;
    cmp(a: string): number;
    value(): string;
}
export declare class UriIterator implements IKeyIterator<URI> {
    private readonly _ignorePathCasing;
    private _pathIterator;
    private _value;
    private _states;
    private _stateIdx;
    constructor(_ignorePathCasing: (uri: URI) => boolean);
    reset(key: URI): this;
    next(): this;
    hasNext(): boolean;
    cmp(a: string): number;
    value(): string;
}
export declare class TernarySearchTree<K, V> {
    static forUris<E>(ignorePathCasing?: (key: URI) => boolean): TernarySearchTree<URI, E>;
    static forPaths<E>(): TernarySearchTree<string, E>;
    static forStrings<E>(): TernarySearchTree<string, E>;
    static forConfigKeys<E>(): TernarySearchTree<string, E>;
    private _iter;
    private _root;
    constructor(segments: IKeyIterator<K>);
    clear(): void;
    set(key: K, element: V): V | undefined;
    get(key: K): V | undefined;
    private _getNode;
    has(key: K): boolean;
    delete(key: K): void;
    deleteSuperstr(key: K): void;
    private _delete;
    findSubstr(key: K): V | undefined;
    findSuperstr(key: K): IterableIterator<[K, V]> | undefined;
    forEach(callback: (value: V, index: K) => any): void;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    private _entries;
}
interface ResourceMapKeyFn {
    (resource: URI): string;
}
export declare class ResourceMap<T> implements Map<URI, T> {
    private static readonly defaultToKey;
    readonly [Symbol.toStringTag] = "ResourceMap";
    private readonly map;
    private readonly toKey;
    /**
     *
     * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
     */
    constructor(toKey?: ResourceMapKeyFn);
    /**
     *
     * @param other Another resource which this maps is created from
     * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
     */
    constructor(other?: ResourceMap<T>, toKey?: ResourceMapKeyFn);
    set(resource: URI, value: T): this;
    get(resource: URI): T | undefined;
    has(resource: URI): boolean;
    get size(): number;
    clear(): void;
    delete(resource: URI): boolean;
    forEach(clb: (value: T, key: URI, map: Map<URI, T>) => void, thisArg?: any): void;
    values(): IterableIterator<T>;
    keys(): IterableIterator<URI>;
    entries(): IterableIterator<[URI, T]>;
    [Symbol.iterator](): IterableIterator<[URI, T]>;
}
export declare const enum Touch {
    None = 0,
    AsOld = 1,
    AsNew = 2
}
export declare class LinkedMap<K, V> implements Map<K, V> {
    readonly [Symbol.toStringTag] = "LinkedMap";
    private _map;
    private _head;
    private _tail;
    private _size;
    private _state;
    constructor();
    clear(): void;
    isEmpty(): boolean;
    get size(): number;
    get first(): V | undefined;
    get last(): V | undefined;
    has(key: K): boolean;
    get(key: K, touch?: Touch): V | undefined;
    set(key: K, value: V, touch?: Touch): this;
    delete(key: K): boolean;
    remove(key: K): V | undefined;
    shift(): V | undefined;
    forEach(callbackfn: (value: V, key: K, map: LinkedMap<K, V>) => void, thisArg?: any): void;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    protected trimOld(newSize: number): void;
    private addItemFirst;
    private addItemLast;
    private removeItem;
    private touch;
    toJSON(): [K, V][];
    fromJSON(data: [K, V][]): void;
}
export declare class LRUCache<K, V> extends LinkedMap<K, V> {
    private _limit;
    private _ratio;
    constructor(limit: number, ratio?: number);
    get limit(): number;
    set limit(limit: number);
    get ratio(): number;
    set ratio(ratio: number);
    get(key: K, touch?: Touch): V | undefined;
    peek(key: K): V | undefined;
    set(key: K, value: V): this;
    private checkTrim;
}
export {};
