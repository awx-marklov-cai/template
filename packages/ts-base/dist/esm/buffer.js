var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as streams from './stream';
import * as strings from './strings';
const hasBuffer = typeof Buffer !== 'undefined';
const hasTextEncoder = typeof TextEncoder !== 'undefined';
const hasTextDecoder = typeof TextDecoder !== 'undefined';
let textEncoder;
let textDecoder;
export class QMBuffer {
    static alloc(byteLength) {
        if (hasBuffer) {
            return new QMBuffer(Buffer.allocUnsafe(byteLength));
        }
        else {
            return new QMBuffer(new Uint8Array(byteLength));
        }
    }
    static wrap(actual) {
        if (hasBuffer && !Buffer.isBuffer(actual)) {
            actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
        }
        return new QMBuffer(actual);
    }
    static fromString(source, options) {
        const dontUseNodeBuffer = (options === null || options === void 0 ? void 0 : options.dontUseNodeBuffer) || false;
        if (!dontUseNodeBuffer && hasBuffer) {
            return new QMBuffer(Buffer.from(source));
        }
        else if (hasTextEncoder) {
            if (!textEncoder) {
                textEncoder = new TextEncoder();
            }
            return new QMBuffer(textEncoder.encode(source));
        }
        else {
            return new QMBuffer(strings.encodeUTF8(source));
        }
    }
    static concat(buffers, totalLength) {
        if (typeof totalLength === 'undefined') {
            totalLength = 0;
            for (let i = 0, len = buffers.length; i < len; i++) {
                totalLength += buffers[i].byteLength;
            }
        }
        const ret = QMBuffer.alloc(totalLength);
        let offset = 0;
        for (let i = 0, len = buffers.length; i < len; i++) {
            const element = buffers[i];
            ret.set(element, offset);
            offset += element.byteLength;
        }
        return ret;
    }
    constructor(buffer) {
        this.buffer = buffer;
        this.byteLength = this.buffer.length;
    }
    toString() {
        if (hasBuffer) {
            return this.buffer.toString();
        }
        else if (hasTextDecoder) {
            if (!textDecoder) {
                textDecoder = new TextDecoder();
            }
            return textDecoder.decode(this.buffer);
        }
        else {
            return strings.decodeUTF8(this.buffer);
        }
    }
    slice(start, end) {
        return new QMBuffer(this.buffer.subarray(start, end));
    }
    set(array, offset) {
        if (array instanceof QMBuffer) {
            this.buffer.set(array.buffer, offset);
        }
        else {
            this.buffer.set(array, offset);
        }
    }
    readUInt32BE(offset) {
        return readUInt32BE(this.buffer, offset);
    }
    writeUInt32BE(value, offset) {
        writeUInt32BE(this.buffer, value, offset);
    }
    readUInt32LE(offset) {
        return readUInt32LE(this.buffer, offset);
    }
    writeUInt32LE(value, offset) {
        writeUInt32LE(this.buffer, value, offset);
    }
    readUInt8(offset) {
        return readUInt8(this.buffer, offset);
    }
    writeUInt8(value, offset) {
        writeUInt8(this.buffer, value, offset);
    }
}
export function readUInt16LE(source, offset) {
    return ((source[offset + 0] << 0) >>> 0) | ((source[offset + 1] << 8) >>> 0);
}
export function writeUInt16LE(destination, value, offset) {
    destination[offset + 0] = value & 0b11111111;
    value = value >>> 8;
    destination[offset + 1] = value & 0b11111111;
}
export function readUInt32BE(source, offset) {
    return source[offset] * Math.pow(2, 24) + source[offset + 1] * Math.pow(2, 16) + source[offset + 2] * Math.pow(2, 8) + source[offset + 3];
}
export function writeUInt32BE(destination, value, offset) {
    destination[offset + 3] = value;
    value = value >>> 8;
    destination[offset + 2] = value;
    value = value >>> 8;
    destination[offset + 1] = value;
    value = value >>> 8;
    destination[offset] = value;
}
export function readUInt32LE(source, offset) {
    return (((source[offset + 0] << 0) >>> 0) |
        ((source[offset + 1] << 8) >>> 0) |
        ((source[offset + 2] << 16) >>> 0) |
        ((source[offset + 3] << 24) >>> 0));
}
export function writeUInt32LE(destination, value, offset) {
    destination[offset + 0] = value & 0b11111111;
    value = value >>> 8;
    destination[offset + 1] = value & 0b11111111;
    value = value >>> 8;
    destination[offset + 2] = value & 0b11111111;
    value = value >>> 8;
    destination[offset + 3] = value & 0b11111111;
}
export function readUInt8(source, offset) {
    return source[offset];
}
export function writeUInt8(destination, value, offset) {
    destination[offset] = value;
}
export function readableToBuffer(readable) {
    return streams.consumeReadable(readable, (chunks) => QMBuffer.concat(chunks));
}
export function bufferToReadable(buffer) {
    return streams.toReadable(buffer);
}
export function streamToBuffer(stream) {
    return streams.consumeStream(stream, (chunks) => QMBuffer.concat(chunks));
}
export function bufferedStreamToBuffer(bufferedStream) {
    return __awaiter(this, void 0, void 0, function* () {
        if (bufferedStream.ended) {
            return QMBuffer.concat(bufferedStream.buffer);
        }
        return QMBuffer.concat([
            // Include already read chunks...
            ...bufferedStream.buffer,
            // ...and all additional chunks
            yield streamToBuffer(bufferedStream.stream),
        ]);
    });
}
export function bufferToStream(buffer) {
    return streams.toStream(buffer, (chunks) => QMBuffer.concat(chunks));
}
export function streamToBufferReadableStream(stream) {
    return streams.transform(stream, {
        data: (data) => (typeof data === 'string' ? QMBuffer.fromString(data) : QMBuffer.wrap(data)),
    }, (chunks) => QMBuffer.concat(chunks));
}
export function newWriteableBufferStream(options) {
    return streams.newWriteableStream((chunks) => QMBuffer.concat(chunks), options);
}
export function prefixedBufferReadable(prefix, readable) {
    return streams.prefixedReadable(prefix, readable, (chunks) => QMBuffer.concat(chunks));
}
export function prefixedBufferStream(prefix, stream) {
    return streams.prefixedStream(prefix, stream, (chunks) => QMBuffer.concat(chunks));
}
