import { CancellationToken } from './cancellation';
import { ISplice } from './sequence';
/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default is zero).
 */
export declare function tail<T>(array: ArrayLike<T>, n?: number): T;
export declare function tail2<T>(arr: T[]): [T[], T];
export declare function equals<T>(one: ReadonlyArray<T> | undefined, other: ReadonlyArray<T> | undefined, itemEquals?: (a: T, b: T) => boolean): boolean;
export declare function binarySearch<T>(array: ReadonlyArray<T>, key: T, comparator: (op1: T, op2: T) => number): number;
/**
 * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
 * are located before all elements where p(x) is true.
 * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
 */
export declare function findFirstInSorted<T>(array: ReadonlyArray<T>, p: (x: T) => boolean): number;
type Compare<T> = (a: T, b: T) => number;
export declare function quickSelect<T>(nth: number, data: T[], compare: Compare<T>): T;
export declare function groupBy<T>(data: ReadonlyArray<T>, compare: (a: T, b: T) => number): T[][];
/**
 * Diffs two *sorted* arrays and computes the splices which apply the diff.
 */
export declare function sortedDiff<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): ISplice<T>[];
/**
 * Takes two *sorted* arrays and computes their delta (removed, added elements).
 * Finishes in `Math.min(before.length, after.length)` steps.
 */
export declare function delta<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): {
    removed: T[];
    added: T[];
};
/**
 * Returns the top N elements from the array.
 *
 * Faster than sorting the entire array when the array is a lot larger than N.
 *
 * @param array The unsorted array.
 * @param compare A sort function for the elements.
 * @param n The number of elements to return.
 * @return The first n elemnts from array when sorted with compare.
 */
export declare function top<T>(array: ReadonlyArray<T>, compare: (a: T, b: T) => number, n: number): T[];
/**
 * Asynchronous variant of `top()` allowing for splitting up work in batches between which the event loop can run.
 *
 * Returns the top N elements from the array.
 *
 * Faster than sorting the entire array when the array is a lot larger than N.
 *
 * @param array The unsorted array.
 * @param compare A sort function for the elements.
 * @param n The number of elements to return.
 * @param batch The number of elements to examine before yielding to the event loop.
 * @return The first n elemnts from array when sorted with compare.
 */
export declare function topAsync<T>(array: T[], compare: (a: T, b: T) => number, n: number, batch: number, token?: CancellationToken): Promise<T[]>;
/**
 * @returns New array with all falsy values removed. The original array IS NOT modified.
 */
export declare function coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[];
/**
 * Remove all falsey values from `array`. The original array IS modified.
 */
export declare function coalesceInPlace<T>(array: Array<T | undefined | null>): void;
/**
 * Moves the element in the array for the provided positions.
 */
export declare function move(array: any[], from: number, to: number): void;
/**
 * @returns false if the provided object is an array and not empty.
 */
export declare function isFalsyOrEmpty(obj: any): boolean;
/**
 * @returns True if the provided object is an array and has at least one element.
 */
export declare function isNonEmptyArray<T>(obj: T[] | undefined | null): obj is T[];
export declare function isNonEmptyArray<T>(obj: readonly T[] | undefined | null): obj is readonly T[];
/**
 * Removes duplicates from the given array. The optional keyFn allows to specify
 * how elements are checked for equalness by returning a unique string for each.
 */
export declare function distinct<T>(array: ReadonlyArray<T>, keyFn?: (t: T) => string): T[];
export declare function distinctES6<T>(array: ReadonlyArray<T>): T[];
export declare function uniqueFilter<T>(keyFn: (t: T) => string): (t: T) => boolean;
export declare function lastIndex<T>(array: ReadonlyArray<T>, fn: (item: T) => boolean): number;
export declare function firstOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue: NotFound): T | NotFound;
export declare function firstOrDefault<T>(array: ReadonlyArray<T>): T | undefined;
export declare function commonPrefixLength<T>(one: ReadonlyArray<T>, other: ReadonlyArray<T>, equals?: (a: T, b: T) => boolean): number;
export declare function flatten<T>(arr: T[][]): T[];
export declare function range(to: number): number[];
export declare function range(from: number, to: number): number[];
export declare function index<T>(array: ReadonlyArray<T>, indexer: (t: T) => string): {
    [key: string]: T;
};
export declare function index<T, R>(array: ReadonlyArray<T>, indexer: (t: T) => string, mapper: (t: T) => R): {
    [key: string]: R;
};
/**
 * Inserts an element into an array. Returns a function which, when
 * called, will remove that element from the array.
 */
export declare function insert<T>(array: T[], element: T): () => void;
/**
 * Removes an element from an array if it can be found.
 */
export declare function remove<T>(array: T[], element: T): T | undefined;
/**
 * Insert `insertArr` inside `target` at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */
export declare function arrayInsert<T>(target: T[], insertIndex: number, insertArr: T[]): T[];
/**
 * Uses Fisher-Yates shuffle to shuffle the given array
 */
export declare function shuffle<T>(array: T[], _seed?: number): void;
/**
 * Pushes an element to the start of the array, if found.
 */
export declare function pushToStart<T>(arr: T[], value: T): void;
/**
 * Pushes an element to the end of the array, if found.
 */
export declare function pushToEnd<T>(arr: T[], value: T): void;
export declare function mapArrayOrNot<T, U>(items: T | T[], fn: (_: T) => U): U | U[];
export declare function asArray<T>(x: T | T[]): T[];
export declare function asArray<T>(x: T | readonly T[]): readonly T[];
export declare function getRandomElement<T>(arr: T[]): T | undefined;
/**
 * Returns the first mapped value of the array which is not undefined.
 */
export declare function mapFind<T, R>(array: Iterable<T>, mapFn: (value: T) => R | undefined): R | undefined;
/**
 * Insert the new items in the array.
 * @param array The original array.
 * @param start The zero-based location in the array from which to start inserting elements.
 * @param newItems The items to be inserted
 */
export declare function insertInto<T>(array: T[], start: number, newItems: T[]): void;
/**
 * Removes elements from an array and inserts new elements in their place, returning the deleted elements. Alternative to the native Array.splice method, it
 * can only support limited number of items due to the maximum call stack size limit.
 * @param array The original array.
 * @param start The zero-based location in the array from which to start removing elements.
 * @param deleteCount The number of elements to remove.
 * @returns An array containing the elements that were deleted.
 */
export declare function splice<T>(array: T[], start: number, deleteCount: number, newItems: T[]): T[];
/**
 * Like Math.min with a delegate, and returns the winning index
 */
export declare function minIndex<T>(array: readonly T[], fn: (value: T) => number): number;
/**
 * Like Math.max with a delegate, and returns the winning index
 */
export declare function maxIndex<T>(array: readonly T[], fn: (value: T) => number): number;
export declare class ArrayQueue<T> {
    private readonly items;
    private firstIdx;
    private lastIdx;
    /**
     * Constructs a queue that is backed by the given array. Runtime is O(1).
     */
    constructor(items: T[]);
    get length(): number;
    /**
     * Consumes elements from the beginning of the queue as long as the predicate returns true.
     * If no elements were consumed, `null` is returned. Has a runtime of O(result.length).
     */
    takeWhile(predicate: (value: T) => boolean): T[] | null;
    /**
     * Consumes elements from the end of the queue as long as the predicate returns true.
     * If no elements were consumed, `null` is returned.
     * The result has the same order as the underlying array!
     */
    takeFromEndWhile(predicate: (value: T) => boolean): T[] | null;
}
export {};
