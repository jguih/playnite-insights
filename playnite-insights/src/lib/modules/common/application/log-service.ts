import type { ILogServicePort } from "./log-service.port";

export class LogService implements ILogServicePort {
	error: ILogServicePort["error"] = (message, error, extra) => {
		console.error(`${message}`, error, extra);
	};
	warning: ILogServicePort["warning"] = (message, extra) => {
		console.warn(message, extra);
	};
	info: ILogServicePort["info"] = (message, extra) => {
		console.info(message, extra);
	};
	success: ILogServicePort["success"] = (message, extra) => {
		console.info(message, extra);
	};
	debug: ILogServicePort["debug"] = (message, extra) => {
		console.debug(message, extra);
	};
}
