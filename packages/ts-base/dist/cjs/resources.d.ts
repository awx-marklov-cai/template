import { URI } from './uri';
export declare function originalFSPath(uri: URI): string;
export interface IExtUri {
    /**
     * Compares two uris.
     *
     * @param uri1 Uri
     * @param uri2 Uri
     * @param ignoreFragment Ignore the fragment (defaults to `false`)
     */
    compare(uri1: URI, uri2: URI, ignoreFragment?: boolean): number;
    /**
     * Tests whether two uris are equal
     *
     * @param uri1 Uri
     * @param uri2 Uri
     * @param ignoreFragment Ignore the fragment (defaults to `false`)
     */
    isEqual(uri1: URI | undefined, uri2: URI | undefined, ignoreFragment?: boolean): boolean;
    /**
     * Tests whether a `candidate` URI is a parent or equal of a given `base` URI.
     *
     * @param base A uri which is "longer" or at least same length as `parentCandidate`
     * @param parentCandidate A uri which is "shorter" or up to same length as `base`
     * @param ignoreFragment Ignore the fragment (defaults to `false`)
     */
    isEqualOrParent(base: URI, parentCandidate: URI, ignoreFragment?: boolean): boolean;
    /**
     * Creates a key from a resource URI to be used to resource comparison and for resource maps.
     * @see {@link ResourceMap}
     * @param uri Uri
     * @param ignoreFragment Ignore the fragment (defaults to `false`)
     */
    getComparisonKey(uri: URI, ignoreFragment?: boolean): string;
    /**
     * Whether the casing of the path-component of the uri should be ignored.
     */
    ignorePathCasing(uri: URI): boolean;
    basenameOrAuthority(resource: URI): string;
    /**
     * Returns the basename of the path component of an uri.
     * @param resource
     */
    basename(resource: URI): string;
    /**
     * Returns the extension of the path component of an uri.
     * @param resource
     */
    extname(resource: URI): string;
    /**
     * Return a URI representing the directory of a URI path.
     *
     * @param resource The input URI.
     * @returns The URI representing the directory of the input URI.
     */
    dirname(resource: URI): URI;
    /**
     * Join a URI path with path fragments and normalizes the resulting path.
     *
     * @param resource The input URI.
     * @param pathFragment The path fragment to add to the URI path.
     * @returns The resulting URI.
     */
    joinPath(resource: URI, ...pathFragment: string[]): URI;
    /**
     * Normalizes the path part of a URI: Resolves `.` and `..` elements with directory names.
     *
     * @param resource The URI to normalize the path.
     * @returns The URI with the normalized path.
     */
    normalizePath(resource: URI): URI;
    /**
     *
     * @param from
     * @param to
     */
    relativePath(from: URI, to: URI): string | undefined;
    /**
     * Resolves an absolute or relative path against a base URI.
     * The path can be relative or absolute posix or a Windows path
     */
    resolvePath(base: URI, path: string): URI;
    /**
     * Returns true if the URI path is absolute.
     */
    isAbsolutePath(resource: URI): boolean;
    /**
     * Tests whether the two authorities are the same
     */
    isEqualAuthority(a1: string, a2: string): boolean;
    /**
     * Returns true if the URI path has a trailing path separator
     */
    hasTrailingPathSeparator(resource: URI, sep?: string): boolean;
    /**
     * Removes a trailing path separator, if there's one.
     * Important: Doesn't remove the first slash, it would make the URI invalid
     */
    removeTrailingPathSeparator(resource: URI, sep?: string): URI;
    /**
     * Adds a trailing path separator to the URI if there isn't one already.
     * For example, c:\ would be unchanged, but c:\users would become c:\users\
     */
    addTrailingPathSeparator(resource: URI, sep?: string): URI;
}
export declare class ExtUri implements IExtUri {
    private _ignorePathCasing;
    constructor(_ignorePathCasing: (uri: URI) => boolean);
    compare(uri1: URI, uri2: URI, ignoreFragment?: boolean): number;
    isEqual(uri1: URI | undefined, uri2: URI | undefined, ignoreFragment?: boolean): boolean;
    getComparisonKey(uri: URI, ignoreFragment?: boolean): string;
    ignorePathCasing(uri: URI): boolean;
    isEqualOrParent(base: URI, parentCandidate: URI, ignoreFragment?: boolean): boolean;
    joinPath(resource: URI, ...pathFragment: string[]): URI;
    basenameOrAuthority(resource: URI): string;
    basename(resource: URI): string;
    extname(resource: URI): string;
    dirname(resource: URI): URI;
    normalizePath(resource: URI): URI;
    relativePath(from: URI, to: URI): string | undefined;
    resolvePath(base: URI, path: string): URI;
    isAbsolutePath(resource: URI): boolean;
    isEqualAuthority(a1: string, a2: string): boolean;
    hasTrailingPathSeparator(resource: URI, sep?: string): boolean;
    removeTrailingPathSeparator(resource: URI, sep?: string): URI;
    addTrailingPathSeparator(resource: URI, sep?: string): URI;
}
/**
 * Unbiased utility that takes uris "as they are". This means it can be interchanged with
 * uri#toString() usages. The following is true
 * ```
 * assertEqual(aUri.toString() === bUri.toString(), exturi.isEqual(aUri, bUri))
 * ```
 */
export declare const extUri: ExtUri;
/**
 * BIASED utility that _mostly_ ignored the case of urs paths. ONLY use this util if you
 * understand what you are doing.
 *
 * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
 *
 * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
 * because those uris come from a "trustworthy source". When creating unknown uris it's always
 * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
 * casing matters.
 */
export declare const extUriBiasedIgnorePathCase: ExtUri;
/**
 * BIASED utility that always ignores the casing of uris paths. ONLY use this util if you
 * understand what you are doing.
 *
 * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
 *
 * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
 * because those uris come from a "trustworthy source". When creating unknown uris it's always
 * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
 * casing matters.
 */
export declare const extUriIgnorePathCase: ExtUri;
export declare const isEqual: (uri1: URI | undefined, uri2: URI | undefined, ignoreFragment?: boolean) => boolean;
export declare const isEqualOrParent: (base: URI, parentCandidate: URI, ignoreFragment?: boolean) => boolean;
export declare const getComparisonKey: (uri: URI, ignoreFragment?: boolean) => string;
export declare const basenameOrAuthority: (resource: URI) => string;
export declare const basename: (resource: URI) => string;
export declare const extname: (resource: URI) => string;
export declare const dirname: (resource: URI) => URI;
export declare const joinPath: (resource: URI, ...pathFragment: string[]) => URI;
export declare const normalizePath: (resource: URI) => URI;
export declare const relativePath: (from: URI, to: URI) => string | undefined;
export declare const resolvePath: (base: URI, path: string) => URI;
export declare const isAbsolutePath: (resource: URI) => boolean;
export declare const isEqualAuthority: (a1: string, a2: string) => boolean;
export declare const hasTrailingPathSeparator: (resource: URI, sep?: string) => boolean;
export declare const removeTrailingPathSeparator: (resource: URI, sep?: string) => URI;
export declare const addTrailingPathSeparator: (resource: URI, sep?: string) => URI;
export declare function distinctParents<T>(items: T[], resourceAccessor: (item: T) => URI): T[];
/**
 * Data URI related helpers.
 */
export declare namespace DataUri {
    const META_DATA_LABEL = "label";
    const META_DATA_DESCRIPTION = "description";
    const META_DATA_SIZE = "size";
    const META_DATA_MIME = "mime";
    function parseMetaData(dataUri: URI): Map<string, string>;
}
export declare function toLocalResource(resource: URI, authority: string | undefined, localScheme: string): URI;
