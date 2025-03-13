export class Node {
    constructor(data) {
        this.incoming = new Map();
        this.outgoing = new Map();
        this.data = data;
    }
}
export class Graph {
    constructor(_hasFn) {
        this._hasFn = _hasFn;
        this._nodes = new Map();
    }
    roots() {
        const ret = [];
        for (let node of this._nodes.values()) {
            if (node.outgoing.size === 0) {
                ret.push(node);
            }
        }
        return ret;
    }
    insertEdge(from, to) {
        const fromNode = this.lookupOrInsertNode(from);
        const toNode = this.lookupOrInsertNode(to);
        fromNode.outgoing.set(this._hasFn(to), toNode);
        toNode.incoming.set(this._hasFn(from), fromNode);
    }
    removeNode(data) {
        const key = this._hasFn(data);
        this._nodes.delete(key);
        for (let node of this._nodes.values()) {
            node.outgoing.delete(key);
            node.incoming.delete(key);
        }
    }
    lookupOrInsertNode(data) {
        const key = this._hasFn(data);
        let node = this._nodes.get(key);
        if (!node) {
            node = new Node(data);
            this._nodes.set(key, node);
        }
        return node;
    }
    lookup(data) {
        return this._nodes.get(this._hasFn(data));
    }
    isEmpty() {
        return this._nodes.size === 0;
    }
    toString() {
        let data = [];
        for (let [key, value] of this._nodes) {
            data.push(`${key}, (incoming)[${[...value.incoming.keys()].join(', ')}], (outgoing)[${[...value.outgoing.keys()].join(', ')}]`);
        }
        return data.join('\n');
    }
    findCycleSlow() {
        for (let [id, node] of this._nodes) {
            const seen = new Set([id]);
            const res = this._findCycle(node, seen);
            if (res) {
                return res;
            }
        }
        return undefined;
    }
    _findCycle(node, seen) {
        for (let [id, outgoing] of node.outgoing) {
            if (seen.has(id)) {
                return [...seen, id].join(' -> ');
            }
            seen.add(id);
            const value = this._findCycle(outgoing, seen);
            if (value) {
                return value;
            }
            seen.delete(id);
        }
        return undefined;
    }
}
