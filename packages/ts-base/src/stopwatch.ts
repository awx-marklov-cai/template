import { globals } from '@/platform';

/**
 * performance提供高精度的时间精度，Date只能精确到千分之一秒，performance可以拿到毫秒的千分之一精度
 */
const hasPerformanceNow = globals.performance && typeof globals.performance.now === 'function';

export class StopWatch {
	private _highResolution: boolean;
	private _startTime: number;
	private _stopTime: number;

	public static create(highResolution: boolean = true): StopWatch {
		return new StopWatch(highResolution);
	}
	constructor(highResolution: boolean) {
		this._highResolution = hasPerformanceNow && highResolution;
		this._startTime = this._now();
		this._stopTime = -1;
	}

	private _now(): number {
		return this._highResolution ? globals.performance.now() : Date.now();
	}

	public stop(): void {
		this._stopTime = this._now();
	}

	public elapsed(): number {
		if (this._stopTime !== -1) {
			return this._stopTime - this._startTime;
		}
		return this._now() - this._startTime;
	}
}
