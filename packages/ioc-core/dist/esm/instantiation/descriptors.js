export class SyncDescriptor {
    constructor(ctor, staticArguments = [], supportDelayedInstantiation = false) {
        this.ctor = ctor;
        this.staticArguments = staticArguments;
        this.supportDelayedInstantiation = supportDelayedInstantiation;
    }
}
export const createSyncDescriptor = (ctor, ...staticArguments) => {
    return new SyncDescriptor(ctor, staticArguments);
};
