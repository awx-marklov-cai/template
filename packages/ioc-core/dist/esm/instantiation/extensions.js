import { SyncDescriptor } from './descriptors';
const _registry = [];
export function registerSingleton(id, ctorDescriptor, supportsDelayedInstantiation) {
    if (!(ctorDescriptor instanceof SyncDescriptor)) {
        ctorDescriptor = new SyncDescriptor(ctorDescriptor, [], supportsDelayedInstantiation);
    }
    _registry.push([id, ctorDescriptor]);
}
export function getSingletonServiceDescriptors() {
    return _registry;
}
