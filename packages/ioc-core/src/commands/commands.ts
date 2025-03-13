import { registerSingleton } from '@/instantiation/extensions';
import { IInstantiationService, ServicesAccessor, createDecorator } from '@/instantiation/instantiation';
import {
	Disposable,
	Emitter,
	Event,
	IDisposable,
	IJSONSchema,
	Iterable,
	LinkedList,
	toDisposable,
} from 'ts-base';
import { TypeConstraint, validateConstraints } from 'ts-base';

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

export const ICommandService = createDecorator<ICommandService>('commandService');

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

export const CommandsRegistry: ICommandRegistry = new (class implements ICommandRegistry {
	private readonly _commands = new Map<string, LinkedList<ICommand>>();

	private readonly _onDidRegisterCommand = new Emitter<string>();
	readonly onDidRegisterCommand: Event<string> = this._onDidRegisterCommand.event;

	registerCommand(idOrCommand: string | ICommand, handler?: ICommandHandler): IDisposable {
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
			const constrains: Array<TypeConstraint | undefined> = [];
			for (const arg of idOrCommand.description.args) {
				constrains.push(arg.constraint);
			}
			const actualHandler = idOrCommand.handler;
			idOrCommand.handler = function (accessor, ...args: any[]) {
				validateConstraints(args, constrains);
				return actualHandler(accessor, ...args);
			};
		}

		const { id } = idOrCommand;
		let commands = this._commands.get(id);
		if (!commands) {
			commands = new LinkedList();
			this._commands.set(id, commands);
		}
		const removeFn = commands.unshift(idOrCommand);
		const ret = toDisposable(() => {
			removeFn();
			const command = this._commands.get(id);
			if (command?.isEmpty()) {
				this._commands.delete(id);
			}
		});
		this._onDidRegisterCommand.fire(id);
		return ret;
	}

	registerCommandAlias(oldId: string, newId: string): IDisposable {
		return CommandsRegistry.registerCommand(oldId, (accessor, args) =>
			accessor.get(ICommandService).executeCommand(newId, ...args),
		);
	}

	getCommand(id: string): ICommand | undefined {
		const list = this._commands.get(id);
		if (!list || list.isEmpty()) {
			return undefined;
		}
		return Iterable.first(list);
	}

	getCommands(): ICommandsMap {
		const result = new Map<string, ICommand>();
		for (const key of this._commands.keys()) {
			const command = this.getCommand(key);
			if (command) {
				result.set(key, command);
			}
		}
		return result;
	}
})();

export class CommandService extends Disposable implements ICommandService {
	declare readonly _serviceBrand: undefined;

	private readonly _onWillExecuteCommand: Emitter<ICommandEvent> = this._register(new Emitter<ICommandEvent>());
	public readonly onWillExecuteCommand: Event<ICommandEvent> = this._onWillExecuteCommand.event;

	private readonly _onDidExecuteCommand: Emitter<ICommandEvent> = new Emitter<ICommandEvent>();
	public readonly onDidExecuteCommand: Event<ICommandEvent> = this._onDidExecuteCommand.event;

	constructor(@IInstantiationService private readonly _instantiationService: IInstantiationService) {
		super();
	}

	executeCommand<T = any>(id: string, ...args: any[]): Promise<T | undefined> {
		return this._tryExecuteCommand(id, args);
	}

	_tryExecuteCommand(id: string, ...args: any[]): Promise<any> {
		const command = CommandsRegistry.getCommand(id);
		if (!command) {
			return Promise.reject(new Error(`command ${id} not found`));
		}
		try {
			this._onWillExecuteCommand.fire({ commandId: id, args });
			const result = this._instantiationService.invokeFunction(command.handler, ...args);
			this._onDidExecuteCommand.fire({ commandId: id, args });
			return Promise.resolve(result);
		} catch (err) {
			return Promise.reject(err);
		}
	}
}

export interface ISyncCommandService {
	readonly _serviceBrand: undefined;
	onWillExecuteCommand: Event<ICommandEvent>;
	onDidExecuteCommand: Event<ICommandEvent>;
	executeCommand<T = any>(commandId: string, ...args: any[]): T | undefined;
}

export const ISyncCommandService = createDecorator<ISyncCommandService>('syncCommandService');

export class SyncCommandService extends Disposable implements ISyncCommandService {
	declare readonly _serviceBrand: undefined;

	private readonly _onWillExecuteCommand: Emitter<ICommandEvent> = this._register(new Emitter<ICommandEvent>());
	public readonly onWillExecuteCommand: Event<ICommandEvent> = this._onWillExecuteCommand.event;

	private readonly _onDidExecuteCommand: Emitter<ICommandEvent> = new Emitter<ICommandEvent>();
	public readonly onDidExecuteCommand: Event<ICommandEvent> = this._onDidExecuteCommand.event;

	constructor(
		@IInstantiationService
		private readonly _instantiationService: IInstantiationService,
	) {
		super();
	}

	executeCommand<T = any>(id: string, ...args: any[]): T | undefined {
		return this._tryExecuteCommand(id, args);
	}

	_tryExecuteCommand(id: string, ...args: any[]): any {
		const command = CommandsRegistry.getCommand(id);
		if (!command) {
			return Promise.reject(new Error(`command ${id} not found`));
		}
		try {
			this._onWillExecuteCommand.fire({ commandId: id, args });
			const result = this._instantiationService.invokeFunction(command.handler, ...args);
			this._onDidExecuteCommand.fire({ commandId: id, args });
			return result;
		} catch (err) {
			return Promise.reject(err);
		}
	}
}

registerSingleton(ICommandService, CommandService, true);
registerSingleton(ISyncCommandService, SyncCommandService, true);
