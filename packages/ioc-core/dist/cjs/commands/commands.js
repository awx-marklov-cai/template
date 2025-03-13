"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncCommandService = exports.ISyncCommandService = exports.CommandService = exports.CommandsRegistry = exports.ICommandService = void 0;
const extensions_1 = require("../instantiation/extensions");
const instantiation_1 = require("../instantiation/instantiation");
const ts_base_1 = require("ts-base");
const ts_base_2 = require("ts-base");
exports.ICommandService = (0, instantiation_1.createDecorator)('commandService');
exports.CommandsRegistry = new (class {
    constructor() {
        this._commands = new Map();
        this._onDidRegisterCommand = new ts_base_1.Emitter();
        this.onDidRegisterCommand = this._onDidRegisterCommand.event;
    }
    registerCommand(idOrCommand, handler) {
        if (!idOrCommand) {
            throw new Error('invalid Command');
        }
        if (typeof idOrCommand === 'string') {
            if (!handler) {
                throw new Error(`invalid command`);
            }
            return this.registerCommand({ id: idOrCommand, handler });
        }
        if (idOrCommand.description) {
            const constrains = [];
            for (const arg of idOrCommand.description.args) {
                constrains.push(arg.constraint);
            }
            const actualHandler = idOrCommand.handler;
            idOrCommand.handler = function (accessor, ...args) {
                (0, ts_base_2.validateConstraints)(args, constrains);
                return actualHandler(accessor, ...args);
            };
        }
        const { id } = idOrCommand;
        let commands = this._commands.get(id);
        if (!commands) {
            commands = new ts_base_1.LinkedList();
            this._commands.set(id, commands);
        }
        const removeFn = commands.unshift(idOrCommand);
        const ret = (0, ts_base_1.toDisposable)(() => {
            removeFn();
            const command = this._commands.get(id);
            if (command === null || command === void 0 ? void 0 : command.isEmpty()) {
                this._commands.delete(id);
            }
        });
        this._onDidRegisterCommand.fire(id);
        return ret;
    }
    registerCommandAlias(oldId, newId) {
        return exports.CommandsRegistry.registerCommand(oldId, (accessor, args) => accessor.get(exports.ICommandService).executeCommand(newId, ...args));
    }
    getCommand(id) {
        const list = this._commands.get(id);
        if (!list || list.isEmpty()) {
            return undefined;
        }
        return ts_base_1.Iterable.first(list);
    }
    getCommands() {
        const result = new Map();
        for (const key of this._commands.keys()) {
            const command = this.getCommand(key);
            if (command) {
                result.set(key, command);
            }
        }
        return result;
    }
})();
let CommandService = class CommandService extends ts_base_1.Disposable {
    constructor(_instantiationService) {
        super();
        this._instantiationService = _instantiationService;
        this._onWillExecuteCommand = this._register(new ts_base_1.Emitter());
        this.onWillExecuteCommand = this._onWillExecuteCommand.event;
        this._onDidExecuteCommand = new ts_base_1.Emitter();
        this.onDidExecuteCommand = this._onDidExecuteCommand.event;
    }
    executeCommand(id, ...args) {
        return this._tryExecuteCommand(id, args);
    }
    _tryExecuteCommand(id, ...args) {
        const command = exports.CommandsRegistry.getCommand(id);
        if (!command) {
            return Promise.reject(new Error(`command ${id} not found`));
        }
        try {
            this._onWillExecuteCommand.fire({ commandId: id, args });
            const result = this._instantiationService.invokeFunction(command.handler, ...args);
            this._onDidExecuteCommand.fire({ commandId: id, args });
            return Promise.resolve(result);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
};
exports.CommandService = CommandService;
exports.CommandService = CommandService = __decorate([
    __param(0, instantiation_1.IInstantiationService),
    __metadata("design:paramtypes", [Object])
], CommandService);
exports.ISyncCommandService = (0, instantiation_1.createDecorator)('syncCommandService');
let SyncCommandService = class SyncCommandService extends ts_base_1.Disposable {
    constructor(_instantiationService) {
        super();
        this._instantiationService = _instantiationService;
        this._onWillExecuteCommand = this._register(new ts_base_1.Emitter());
        this.onWillExecuteCommand = this._onWillExecuteCommand.event;
        this._onDidExecuteCommand = new ts_base_1.Emitter();
        this.onDidExecuteCommand = this._onDidExecuteCommand.event;
    }
    executeCommand(id, ...args) {
        return this._tryExecuteCommand(id, args);
    }
    _tryExecuteCommand(id, ...args) {
        const command = exports.CommandsRegistry.getCommand(id);
        if (!command) {
            return Promise.reject(new Error(`command ${id} not found`));
        }
        try {
            this._onWillExecuteCommand.fire({ commandId: id, args });
            const result = this._instantiationService.invokeFunction(command.handler, ...args);
            this._onDidExecuteCommand.fire({ commandId: id, args });
            return result;
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
};
exports.SyncCommandService = SyncCommandService;
exports.SyncCommandService = SyncCommandService = __decorate([
    __param(0, instantiation_1.IInstantiationService),
    __metadata("design:paramtypes", [Object])
], SyncCommandService);
(0, extensions_1.registerSingleton)(exports.ICommandService, CommandService, true);
(0, extensions_1.registerSingleton)(exports.ISyncCommandService, SyncCommandService, true);
