"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLocalResource = exports.DataUri = exports.distinctParents = exports.addTrailingPathSeparator = exports.removeTrailingPathSeparator = exports.hasTrailingPathSeparator = exports.isEqualAuthority = exports.isAbsolutePath = exports.resolvePath = exports.relativePath = exports.normalizePath = exports.joinPath = exports.dirname = exports.extname = exports.basename = exports.basenameOrAuthority = exports.getComparisonKey = exports.isEqualOrParent = exports.isEqual = exports.extUriIgnorePathCase = exports.extUriBiasedIgnorePathCase = exports.extUri = exports.ExtUri = exports.originalFSPath = void 0;
const extpath = __importStar(require("./extpath"));
const paths = __importStar(require("./path"));
const uri_1 = require("./uri");
const strings_1 = require("./strings");
const network_1 = require("./network");
const platform_1 = require("./platform");
function originalFSPath(uri) {
    return (0, uri_1.uriToFsPath)(uri, true);
}
exports.originalFSPath = originalFSPath;
class ExtUri {
    constructor(_ignorePathCasing) {
        this._ignorePathCasing = _ignorePathCasing;
    }
    compare(uri1, uri2, ignoreFragment = false) {
        if (uri1 === uri2) {
            return 0;
        }
        return (0, strings_1.compare)(this.getComparisonKey(uri1, ignoreFragment), this.getComparisonKey(uri2, ignoreFragment));
    }
    isEqual(uri1, uri2, ignoreFragment = false) {
        if (uri1 === uri2) {
            return true;
        }
        if (!uri1 || !uri2) {
            return false;
        }
        return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri2, ignoreFragment);
    }
    getComparisonKey(uri, ignoreFragment = false) {
        return uri
            .with({
            path: this._ignorePathCasing(uri) ? uri.path.toLowerCase() : undefined,
            fragment: ignoreFragment ? null : undefined,
        })
            .toString();
    }
    ignorePathCasing(uri) {
        return this._ignorePathCasing(uri);
    }
    isEqualOrParent(base, parentCandidate, ignoreFragment = false) {
        if (base.scheme === parentCandidate.scheme) {
            if (base.scheme === network_1.Schemas.file) {
                return (extpath.isEqualOrParent(originalFSPath(base), originalFSPath(parentCandidate), this._ignorePathCasing(base)) &&
                    base.query === parentCandidate.query &&
                    (ignoreFragment || base.fragment === parentCandidate.fragment));
            }
            if ((0, exports.isEqualAuthority)(base.authority, parentCandidate.authority)) {
                return (extpath.isEqualOrParent(base.path, parentCandidate.path, this._ignorePathCasing(base), '/') &&
                    base.query === parentCandidate.query &&
                    (ignoreFragment || base.fragment === parentCandidate.fragment));
            }
        }
        return false;
    }
    // --- path math
    joinPath(resource, ...pathFragment) {
        return uri_1.URI.joinPath(resource, ...pathFragment);
    }
    basenameOrAuthority(resource) {
        return (0, exports.basename)(resource) || resource.authority;
    }
    basename(resource) {
        return paths.posix.basename(resource.path);
    }
    extname(resource) {
        return paths.posix.extname(resource.path);
    }
    dirname(resource) {
        if (resource.path.length === 0) {
            return resource;
        }
        let dirname;
        if (resource.scheme === network_1.Schemas.file) {
            dirname = uri_1.URI.file(paths.dirname(originalFSPath(resource))).path;
        }
        else {
            dirname = paths.posix.dirname(resource.path);
            if (resource.authority && dirname.length && dirname.charCodeAt(0) !== 47 /* CharCode.Slash */) {
                console.error(`dirname("${resource.toString})) resulted in a relative path`);
                dirname = '/'; // If a URI contains an authority component, then the path component must either be empty or begin with a CharCode.Slash ("/") character
            }
        }
        return resource.with({
            path: dirname,
        });
    }
    normalizePath(resource) {
        if (!resource.path.length) {
            return resource;
        }
        let normalizedPath;
        if (resource.scheme === network_1.Schemas.file) {
            normalizedPath = uri_1.URI.file(paths.normalize(originalFSPath(resource))).path;
        }
        else {
            normalizedPath = paths.posix.normalize(resource.path);
        }
        return resource.with({
            path: normalizedPath,
        });
    }
    relativePath(from, to) {
        if (from.scheme !== to.scheme || !(0, exports.isEqualAuthority)(from.authority, to.authority)) {
            return undefined;
        }
        if (from.scheme === network_1.Schemas.file) {
            const relativePath = paths.relative(originalFSPath(from), originalFSPath(to));
            return platform_1.isWindows ? extpath.toSlashes(relativePath) : relativePath;
        }
        let fromPath = from.path || '/', toPath = to.path || '/';
        if (this._ignorePathCasing(from)) {
            // make casing of fromPath match toPath
            let i = 0;
            for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
                if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
                    if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
                        break;
                    }
                }
            }
            fromPath = toPath.substr(0, i) + fromPath.substr(i);
        }
        return paths.posix.relative(fromPath, toPath);
    }
    resolvePath(base, path) {
        if (base.scheme === network_1.Schemas.file) {
            const newURI = uri_1.URI.file(paths.resolve(originalFSPath(base), path));
            return base.with({
                authority: newURI.authority,
                path: newURI.path,
            });
        }
        path = extpath.toPosixPath(path); // we allow path to be a windows path
        return base.with({
            path: paths.posix.resolve(base.path, path),
        });
    }
    // --- misc
    isAbsolutePath(resource) {
        return !!resource.path && resource.path[0] === '/';
    }
    isEqualAuthority(a1, a2) {
        return a1 === a2 || (0, strings_1.equalsIgnoreCase)(a1, a2);
    }
    hasTrailingPathSeparator(resource, sep = paths.sep) {
        if (resource.scheme === network_1.Schemas.file) {
            const fsp = originalFSPath(resource);
            return fsp.length > extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
        }
        else {
            const p = resource.path;
            return p.length > 1 && p.charCodeAt(p.length - 1) === 47 /* CharCode.Slash */ && !/^[a-zA-Z]:(\/$|\\$)/.test(resource.fsPath); // ignore the slash at offset 0
        }
    }
    removeTrailingPathSeparator(resource, sep = paths.sep) {
        // Make sure that the path isn't a drive letter. A trailing separator there is not removable.
        if ((0, exports.hasTrailingPathSeparator)(resource, sep)) {
            return resource.with({
                path: resource.path.substr(0, resource.path.length - 1),
            });
        }
        return resource;
    }
    addTrailingPathSeparator(resource, sep = paths.sep) {
        let isRootSep = false;
        if (resource.scheme === network_1.Schemas.file) {
            const fsp = originalFSPath(resource);
            isRootSep = fsp !== undefined && fsp.length === extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
        }
        else {
            sep = '/';
            const p = resource.path;
            isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === 47 /* CharCode.Slash */;
        }
        if (!isRootSep && !(0, exports.hasTrailingPathSeparator)(resource, sep)) {
            return resource.with({ path: resource.path + '/' });
        }
        return resource;
    }
}
exports.ExtUri = ExtUri;
/**
 * Unbiased utility that takes uris "as they are". This means it can be interchanged with
 * uri#toString() usages. The following is true
 * ```
 * assertEqual(aUri.toString() === bUri.toString(), exturi.isEqual(aUri, bUri))
 * ```
 */
exports.extUri = new ExtUri(() => false);
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
exports.extUriBiasedIgnorePathCase = new ExtUri((uri) => {
    // A file scheme resource is in the same platform as code, so ignore case for non linux platforms
    // Resource can be from another platform. Lowering the case as an hack. Should come from File system provider
    return uri.scheme === network_1.Schemas.file ? !platform_1.isLinux : true;
});
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
exports.extUriIgnorePathCase = new ExtUri((_) => true);
exports.isEqual = exports.extUri.isEqual.bind(exports.extUri);
exports.isEqualOrParent = exports.extUri.isEqualOrParent.bind(exports.extUri);
exports.getComparisonKey = exports.extUri.getComparisonKey.bind(exports.extUri);
exports.basenameOrAuthority = exports.extUri.basenameOrAuthority.bind(exports.extUri);
exports.basename = exports.extUri.basename.bind(exports.extUri);
exports.extname = exports.extUri.extname.bind(exports.extUri);
exports.dirname = exports.extUri.dirname.bind(exports.extUri);
exports.joinPath = exports.extUri.joinPath.bind(exports.extUri);
exports.normalizePath = exports.extUri.normalizePath.bind(exports.extUri);
exports.relativePath = exports.extUri.relativePath.bind(exports.extUri);
exports.resolvePath = exports.extUri.resolvePath.bind(exports.extUri);
exports.isAbsolutePath = exports.extUri.isAbsolutePath.bind(exports.extUri);
exports.isEqualAuthority = exports.extUri.isEqualAuthority.bind(exports.extUri);
exports.hasTrailingPathSeparator = exports.extUri.hasTrailingPathSeparator.bind(exports.extUri);
exports.removeTrailingPathSeparator = exports.extUri.removeTrailingPathSeparator.bind(exports.extUri);
exports.addTrailingPathSeparator = exports.extUri.addTrailingPathSeparator.bind(exports.extUri);
//#endregion
function distinctParents(items, resourceAccessor) {
    const distinctParents = [];
    for (let i = 0; i < items.length; i++) {
        const candidateResource = resourceAccessor(items[i]);
        if (items.some((otherItem, index) => {
            if (index === i) {
                return false;
            }
            return (0, exports.isEqualOrParent)(candidateResource, resourceAccessor(otherItem));
        })) {
            continue;
        }
        distinctParents.push(items[i]);
    }
    return distinctParents;
}
exports.distinctParents = distinctParents;
/**
 * Data URI related helpers.
 */
var DataUri;
(function (DataUri) {
    DataUri.META_DATA_LABEL = 'label';
    DataUri.META_DATA_DESCRIPTION = 'description';
    DataUri.META_DATA_SIZE = 'size';
    DataUri.META_DATA_MIME = 'mime';
    function parseMetaData(dataUri) {
        const metadata = new Map();
        // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
        // the metadata is: size:2313;label:SomeLabel;description:SomeDescription
        const meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
        meta.split(';').forEach((property) => {
            const [key, value] = property.split(':');
            if (key && value) {
                metadata.set(key, value);
            }
        });
        // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
        // the mime is: image/png
        const mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));
        if (mime) {
            metadata.set(DataUri.META_DATA_MIME, mime);
        }
        return metadata;
    }
    DataUri.parseMetaData = parseMetaData;
})(DataUri || (exports.DataUri = DataUri = {}));
function toLocalResource(resource, authority, localScheme) {
    if (authority) {
        let path = resource.path;
        if (path && path[0] !== paths.posix.sep) {
            path = paths.posix.sep + path;
        }
        return resource.with({ scheme: localScheme, authority, path });
    }
    return resource.with({ scheme: localScheme });
}
exports.toLocalResource = toLocalResource;
