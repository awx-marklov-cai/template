import { IInstantiationService, ServicesAccessor } from '../instantiation/instantiation';
import { Disposable, Event, IDisposable, IJSONSchema } from 'ts-base';
import { TypeConstraint } from 'ts-base';
export interface ICommandEvent {
    commandId: string;
    args: any[];
}
export interface ICommandService {
    readonly _serviceBrand: undefined;
    onWillExecuteCommand: Event<ICommandEvent>;
    onDidExecuteCommand: Event<ICommandEvent>;
    executeCommand<T = any>(commandId: string, ...args: any[]): Promise<T | undefined>;
}
export declare const ICommandService: import("../instantiation/instantiation").ServiceIdentifier<ICommandService>;
export interface ICommandHandler {
    (accessor: ServicesAccessor, ...args: any[]): void;
}
export interface ICommand {
    id: string;
    handler: ICommandHandler;
    description?: ICommandHandlerDescription | null;
}
export interface ICommandHandlerDescription {
    readonly description: string;
    readonly args: ReadonlyArray<{
        readonly name: string;
        readonly isOptional?: boolean;
        readonly constraint?: TypeConstraint;
        readonly schema?: IJSONSchema;
    }>;
    readonly returns?: string;
}
export type ICommandsMap = Map<string, ICommand>;
export interface ICommandRegistry {
    onDidRegisterCommand: Event<string>;
    registerCommand(id: string, command: ICommandHandler): IDisposable;
    registerCommand(command: ICommand): IDisposable;
    registerCommandAlias(oldId: string, newId: string): IDisposable;
    getCommand(id: string): ICommand | undefined;
    getCommands(): ICommandsMap;
}
export declare const CommandsRegistry: ICommandRegistry;
export declare class CommandService extends Disposable implements ICommandService {
    private readonly _instantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onWillExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    private readonly _onDidExecuteCommand;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(_instantiationService: IInstantiationService);
    executeCommand<T = any>(id: string, ...args: any[]): Promise<T | undefined>;
    _tryExecuteCommand(id: string, ...args: any[]): Promise<any>;
}
export interface ISyncCommandService {
    readonly _serviceBrand: undefined;
    onWillExecuteCommand: Event<ICommandEvent>;
    onDidExecuteCommand: Event<ICommandEvent>;
    executeCommand<T = any>(commandId: string, ...args: any[]): T | undefined;
}
export declare const ISyncCommandService: import("../instantiation/instantiation").ServiceIdentifier<ISyncCommandService>;
export declare class SyncCommandService extends Disposable implements ISyncCommandService {
    private readonly _instantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onWillExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    private readonly _onDidExecuteCommand;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(_instantiationService: IInstantiationService);
    executeCommand<T = any>(id: string, ...args: any[]): T | undefined;
    _tryExecuteCommand(id: string, ...args: any[]): any;
}
