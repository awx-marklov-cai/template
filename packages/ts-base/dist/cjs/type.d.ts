import { URI, UriComponents } from './uri';
/**
 * @returns whether the provided parameter is a JavaScript Array or not.
 */
export declare function isArray(array: any): array is any[];
/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */
export declare function isString(str: unknown): str is string;
/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */
export declare function isStringArray(value: unknown): value is string[];
/**
 *
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */
export declare function isObject(obj: unknown): obj is Object;
/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
export declare function isNumber(obj: unknown): obj is number;
/**
 * @returns whether the provided parameter is an Iterable, casting to the given generic
 */
export declare function isIterable<T>(obj: unknown): obj is Iterable<T>;
/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */
export declare function isBoolean(obj: unknown): obj is boolean;
/**
 * @returns whether the provided parameter is undefined.
 */
export declare function isUndefined(obj: unknown): obj is undefined;
/**
 * @returns whether the provided parameter is defined.
 */
export declare function isDefined<T>(arg: T | null | undefined): arg is T;
/**
 * @returns whether the provided parameter is undefined or null.
 */
export declare function isUndefinedOrNull(obj: unknown): obj is undefined | null;
export declare function assertType(condition: unknown, type?: string): asserts condition;
/**
 * Asserts that the argument passed in is neither undefined nor null.
 */
export declare function assertIsDefined<T>(arg: T | null | undefined): T;
/**
 * Asserts that each argument passed in is neither undefined nor null.
 */
export declare function assertAllDefined<T1, T2>(t1: T1 | null | undefined, t2: T2 | null | undefined): [T1, T2];
export declare function assertAllDefined<T1, T2, T3>(t1: T1 | null | undefined, t2: T2 | null | undefined, t3: T3 | null | undefined): [T1, T2, T3];
export declare function assertAllDefined<T1, T2, T3, T4>(t1: T1 | null | undefined, t2: T2 | null | undefined, t3: T3 | null | undefined, t4: T4 | null | undefined): [T1, T2, T3, T4];
/**
 * @returns whether the provided parameter is an empty JavaScript Object or not.
 */
export declare function isEmptyObject(obj: unknown): obj is object;
/**
 * @returns whether the provided parameter is a JavaScript Function or not.
 */
export declare function isFunction(obj: unknown): obj is Function;
/**
 * @returns whether the provided parameters is are JavaScript Function or not.
 */
export declare function areFunctions(...objects: unknown[]): boolean;
export type TypeConstraint = string | Function;
export declare function validateConstraints(args: unknown[], constraints: Array<TypeConstraint | undefined>): void;
export declare function validateConstraint(arg: unknown, constraint: TypeConstraint | undefined): void;
export declare function getAllPropertyNames(obj: object): string[];
export declare function getAllMethodNames(obj: object): string[];
export declare function createProxyObject<T extends object>(methodNames: string[], invoke: (method: string, args: unknown[]) => unknown): T;
/**
 * Converts null to undefined, passes all other values through.
 */
export declare function withNullAsUndefined<T>(x: T | null): T | undefined;
/**
 * Converts undefined to null, passes all other values through.
 */
export declare function withUndefinedAsNull<T>(x: T | undefined): T | null;
type AddFirstParameterToFunction<T, TargetFunctionsReturnType, FirstParameter> = T extends (...args: any[]) => TargetFunctionsReturnType ? (firstArg: FirstParameter, ...args: Parameters<T>) => ReturnType<T> : T;
/**
 * Allows to add a first parameter to functions of a type.
 */
export type AddFirstParameterToFunctions<Target, TargetFunctionsReturnType, FirstParameter> = {
    [K in keyof Target]: AddFirstParameterToFunction<Target[K], TargetFunctionsReturnType, FirstParameter>;
};
/**
 * Mapped-type that replaces all occurrences of URI with UriComponents
 */
export type UriDto<T> = {
    [K in keyof T]: T[K] extends URI ? UriComponents : UriDto<T[K]>;
};
/**
 * Mapped-type that replaces all occurrences of URI with UriComponents and
 * drops all functions.
 */
export type Dto<T> = T extends {
    toJSON(): infer U;
} ? U : T extends object ? {
    [k in keyof T]: Dto<T[k]>;
} : T;
export declare function NotImplementedProxy<T>(name: string): {
    new (): T;
};
export declare function assertNever(value: never, message?: string): void;
export {};
