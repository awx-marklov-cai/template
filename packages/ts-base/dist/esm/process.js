/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isWindows, isMacintosh, setImmediate, globals } from './platform';
let safeProcess;
// Native sandbox environment
if (typeof globals.vscode !== 'undefined' && typeof globals.vscode.process !== 'undefined') {
    const sandboxProcess = globals.vscode.process;
    safeProcess = {
        get platform() {
            return sandboxProcess.platform;
        },
        get env() {
            return sandboxProcess.env;
        },
        cwd() {
            return sandboxProcess.cwd();
        },
        nextTick(callback) {
            return setImmediate(callback);
        },
    };
}
// Native node.js environment
else if (typeof process !== 'undefined') {
    safeProcess = {
        get platform() {
            return process.platform;
        },
        get env() {
            return process.env;
        },
        cwd() {
            return process.env['VSCODE_CWD'] || process.cwd();
        },
        nextTick(callback) {
            return process.nextTick(callback);
        },
    };
}
// Web environment
else {
    safeProcess = {
        // Supported
        get platform() {
            return isWindows ? 'win32' : isMacintosh ? 'darwin' : 'linux';
        },
        nextTick(callback) {
            return setImmediate(callback);
        },
        // Unsupported
        get env() {
            return {};
        },
        cwd() {
            return '/';
        },
    };
}
/**
 * Provides safe access to the `cwd` property in node.js, sandboxed or web
 * environments.
 *
 * Note: in web, this property is hardcoded to be `/`.
 */
export const cwd = safeProcess.cwd;
/**
 * Provides safe access to the `env` property in node.js, sandboxed or web
 * environments.
 *
 * Note: in web, this property is hardcoded to be `{}`.
 */
export const env = safeProcess.env;
/**
 * Provides safe access to the `platform` property in node.js, sandboxed or web
 * environments.
 */
export const platform = safeProcess.platform;
/**
 * Provides safe access to the `nextTick` method in node.js, sandboxed or web
 * environments.
 */
export const nextTick = safeProcess.nextTick;
