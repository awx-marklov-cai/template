import { _util, IInstantiationService, optional } from '../instantiation/instantiation';
import { ServiceCollection } from '../instantiation/serviceCollection';
import { SyncDescriptor } from '../instantiation/descriptors';
import { illegalState, IdleValue } from 'ts-base';
import { Graph } from '../instantiation/graph';
const _enableTracing = false;
class CyclicDependencyError extends Error {
    constructor(graph) {
        var _a;
        super('cycle dependency between services');
        this.message = (_a = graph.findCycleSlow()) !== null && _a !== void 0 ? _a : `UNABLE to detect cycle, dumping graph: \n${graph.toString()}`;
    }
}
export class InstantiationService {
    constructor(services = new ServiceCollection(), strict = false, parent) {
        this._activeInstantiations = new Set();
        this._services = services;
        this._strict = strict;
        this._parent = parent;
        this._services.set(IInstantiationService, this);
    }
    createChild(services) {
        return new InstantiationService(services, this._strict, this);
    }
    invokeFunction(fn, ...args) {
        const _trace = Trace.traceCreation(fn);
        let _done = false;
        try {
            const accessor = {
                get: (id, isOptional) => {
                    if (_done) {
                        throw illegalState('service accessor is only valid during the invocation of its target method');
                    }
                    const result = this._getOrCreateServiceInstance(id, _trace);
                    if (!result && isOptional !== optional) {
                        throw new Error(`[invokeFunction] unknown service ${id}`);
                    }
                    return result;
                },
            };
            return fn(accessor, ...args);
        }
        finally {
            _done = true;
            _trace.stop();
        }
    }
    createInstance(ctorOrDescriptor, ...rest) {
        let _trace;
        let result;
        if (ctorOrDescriptor instanceof SyncDescriptor) {
            _trace = Trace.traceCreation(ctorOrDescriptor.ctor);
            result = this._createInstance(ctorOrDescriptor.ctor, ctorOrDescriptor.staticArguments.concat(rest), _trace);
        }
        else {
            _trace = Trace.traceCreation(ctorOrDescriptor);
            result = this._createInstance(ctorOrDescriptor, rest, _trace);
        }
        _trace.stop();
        return result;
    }
    _createInstance(ctor, args = [], _trace) {
        const serviceDependencies = _util.getServiceDependencies(ctor).sort((a, b) => a.index - b.index);
        const serviceArgs = [];
        for (const dependency of serviceDependencies) {
            const service = this._getOrCreateServiceInstance(dependency.id, _trace);
            if (!service && this._strict && !dependency.optional) {
                throw new Error(`[createInstance] ${ctor.name}`);
            }
            serviceArgs.push(service);
        }
        const firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
        if (args.length !== firstServiceArgPos) {
            console.warn(`[createInstance First service dependency of ${ctor.name}] at position ${firstServiceArgPos + 1} conflicts with ${args.length} static arguments`);
            const delta = firstServiceArgPos - args.length;
            if (delta > 0) {
                args = args.concat(new Array(delta));
            }
            else {
                args = args.slice(0, firstServiceArgPos);
            }
        }
        return new ctor(...[...args, ...serviceArgs]);
    }
    _setServiceInstance(id, instance) {
        if (this._services.get(id) instanceof SyncDescriptor) {
            this._services.set(id, instance);
        }
        else if (this._parent) {
            this._parent._setServiceInstance(id, instance);
        }
        else {
            throw new Error('illegalState - setting UNKNOWN service instance');
        }
    }
    _getServiceInstanceOrDescriptor(id) {
        const instanceOrDesc = this._services.get(id);
        if (!instanceOrDesc && this._parent) {
            return this._parent._getServiceInstanceOrDescriptor(id);
        }
        else {
            return instanceOrDesc;
        }
    }
    _getOrCreateServiceInstance(id, _trace) {
        const thing = this._getServiceInstanceOrDescriptor(id);
        if (thing instanceof SyncDescriptor) {
            return this._safeCreateAndCacheServiceInstance(id, thing, _trace.branch(id, true));
        }
        else {
            _trace.branch(id, false);
            return thing;
        }
    }
    _safeCreateAndCacheServiceInstance(id, desc, _trace) {
        if (this._activeInstantiations.has(id)) {
            // 递归创建
            throw new Error(`illegal state - RECURSIVELY instantiating service '${id}'`);
        }
        this._activeInstantiations.add(id);
        try {
            return this._createAndCacheServiceInstance(id, desc, _trace);
        }
        finally {
            this._activeInstantiations.delete(id);
        }
    }
    _createAndCacheServiceInstance(id, desc, _trace) {
        const graph = new Graph((data) => data.id.toString());
        let cycleCount = 0;
        const stack = [{ id, desc, _trace }];
        while (stack.length) {
            const item = stack.pop();
            graph.lookupOrInsertNode(item);
            if (cycleCount++ > 1000) {
                throw new CyclicDependencyError(graph);
            }
            for (const dependency of _util.getServiceDependencies(item.desc.ctor)) {
                const instanceOrDesc = this._getServiceInstanceOrDescriptor(dependency.id);
                if (!instanceOrDesc && !instanceOrDesc.optional) {
                    console.warn(`[createInstance] ${id} depends on ${dependency.id} which is NOT registered.`);
                }
                if (instanceOrDesc instanceof SyncDescriptor) {
                    const node = {
                        id: dependency.id,
                        desc: instanceOrDesc,
                        _trace: item._trace.branch(dependency.id, true),
                    };
                    graph.insertEdge(item, node);
                    stack.push(node);
                }
            }
        }
        while (true) {
            const roots = graph.roots();
            // 没有根节点，但是不为空，说明是循环依赖
            if (roots.length === 0) {
                if (!graph.isEmpty()) {
                    throw new CyclicDependencyError(graph);
                }
                break;
            }
            for (const { data } of roots) {
                const instanceOrDesc = this._getServiceInstanceOrDescriptor(data.id);
                if (instanceOrDesc instanceof SyncDescriptor) {
                    const instance = this._createServiceInstanceWithOwner(data.id, data.desc.ctor, data.desc.staticArguments, data.desc.supportDelayedInstantiation, data._trace);
                    this._setServiceInstance(data.id, instance);
                }
                graph.removeNode(data);
            }
        }
        return this._getServiceInstanceOrDescriptor(id);
    }
    _createServiceInstanceWithOwner(id, ctor, args = [], supportDelayedInstantiation, _trace) {
        if (this._services.get(id) instanceof SyncDescriptor) {
            return this._createServiceInstance(ctor, args, supportDelayedInstantiation, _trace);
        }
        else if (this._parent) {
            return this._parent._createServiceInstanceWithOwner(id, ctor, args, supportDelayedInstantiation, _trace);
        }
        else {
            throw new Error(`illegalState - creating UNKNOWN service instance ${ctor.name}`);
        }
    }
    _createServiceInstance(ctor, args = [], _supportDelayedInstantiation, _trace) {
        if (!_supportDelayedInstantiation) {
            return this._createInstance(ctor, args, _trace);
        }
        else {
            const idle = new IdleValue(() => this._createInstance(ctor, args, _trace));
            return new Proxy(Object.create(null), {
                get(target, propertyKey) {
                    if (propertyKey in target) {
                        return target[propertyKey];
                    }
                    const obj = idle.value;
                    let prop = obj[propertyKey];
                    if (typeof prop !== 'function') {
                        return prop;
                    }
                    prop = prop.bind(obj);
                    target[propertyKey] = prop;
                    return prop;
                },
                set(target, propertyKey, value) {
                    idle.value[propertyKey] = value;
                    return true;
                },
            });
        }
    }
}
var TraceType;
(function (TraceType) {
    TraceType[TraceType["None"] = 0] = "None";
    TraceType[TraceType["Creation"] = 1] = "Creation";
    TraceType[TraceType["Invocation"] = 2] = "Invocation";
    TraceType[TraceType["Branch"] = 3] = "Branch";
})(TraceType || (TraceType = {}));
class Trace {
    static traceInvocation(ctor) {
        return !_enableTracing ? Trace._None : new Trace(2 /* TraceType.Invocation */, ctor.name || ctor.toString().substring(0, 42).replace(/\n/g, ''));
    }
    static traceCreation(ctor) {
        return !_enableTracing ? Trace._None : new Trace(1 /* TraceType.Creation */, ctor.name);
    }
    constructor(type, name) {
        this.type = type;
        this.name = name;
        this._start = Date.now();
        this._dep = [];
    }
    branch(id, first) {
        const child = new Trace(3 /* TraceType.Branch */, id.toString());
        this._dep.push([id, first, child]);
        return child;
    }
    stop() {
        const dur = Date.now() - this._start;
        Trace._totals += dur;
        let causedCreation = false;
        function printChild(n, trace) {
            const res = [];
            const prefix = new Array(n + 1).join('\t');
            for (const [id, first, child] of trace._dep) {
                if (first && child) {
                    causedCreation = true;
                    res.push(`${prefix}CREATES -> ${id}`);
                    const nested = printChild(n + 1, child);
                    if (nested) {
                        res.push(nested);
                    }
                }
                else {
                    res.push(`${prefix}uses -> ${id}`);
                }
            }
            return res.join('\n');
        }
        const lines = [`${this.type === 1 /* TraceType.Creation */ ? 'CREATE' : 'CALL'} ${this.name}`, `${printChild(1, this)}`, `DONE, took ${dur.toFixed(2)}ms (grand total ${Trace._totals.toFixed(2)}ms)`];
        if (dur > 2 || causedCreation) {
            console.log(lines.join('\n'));
        }
    }
}
Trace._None = new (class extends Trace {
    constructor() {
        super(0 /* TraceType.None */, null);
    }
    stop() { }
    branch() {
        return this;
    }
})();
Trace._totals = 0;
