import { globals } from './platform';
/**
 * performance提供高精度的时间精度，Date只能精确到千分之一秒，performance可以拿到毫秒的千分之一精度
 */
const hasPerformanceNow = globals.performance && typeof globals.performance.now === 'function';
export class StopWatch {
    static create(highResolution = true) {
        return new StopWatch(highResolution);
    }
    constructor(highResolution) {
        this._highResolution = hasPerformanceNow && highResolution;
        this._startTime = this._now();
        this._stopTime = -1;
    }
    _now() {
        return this._highResolution ? globals.performance.now() : Date.now();
    }
    stop() {
        this._stopTime = this._now();
    }
    elapsed() {
        if (this._stopTime !== -1) {
            return this._stopTime - this._startTime;
        }
        return this._now() - this._startTime;
    }
}
