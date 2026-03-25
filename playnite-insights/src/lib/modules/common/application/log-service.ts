import type { IClockPort } from "./clock.port";
import type { ILogServicePort } from "./log-service.port";

export type LogServiceDeps = {
	context: string;
	clock: IClockPort;
};

export class LogService implements ILogServicePort {
	private readonly context: string;

	constructor(private readonly deps: LogServiceDeps) {
		this.context = deps.context;
	}

	private getDateTimeString = (): string => {
		const now = this.deps.clock.now();
		return now.toLocaleString();
	};

	error: ILogServicePort["error"] = (message, error, extra) => {
		const baseMessage = `[${this.getDateTimeString()}] [ERROR] [${this.context}] ${message}`;
		if (error && extra) console.error(baseMessage, error, extra);
		else if (error) console.error(baseMessage, error);
		else console.error(baseMessage, extra);
	};

	warning: ILogServicePort["warning"] = (message, extra) => {
		const baseMessage = `[${this.getDateTimeString()}] [WARNING] [${this.context}] ${message}`;
		if (extra) console.warn(baseMessage, extra);
		console.warn(baseMessage);
	};

	info: ILogServicePort["info"] = (message, extra) => {
		const baseMessage = `[${this.getDateTimeString()}] [INFO] [${this.context}] ${message}`;
		if (extra) console.info(baseMessage, extra);
		console.info(baseMessage);
	};

	success: ILogServicePort["success"] = (message, extra) => {
		const baseMessage = `[${this.getDateTimeString()}] [SUCCESS] [${this.context}] ${message}`;
		if (extra) console.info(baseMessage, extra);
		console.info(baseMessage);
	};

	debug: ILogServicePort["debug"] = (message, extra) => {
		const baseMessage = `[${this.getDateTimeString()}] [DEBUG] [${this.context}] ${message}`;
		if (extra) console.debug(baseMessage, extra);
		console.debug(baseMessage);
	};
}
