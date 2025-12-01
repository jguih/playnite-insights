export interface ILogService {
	error: (message: string, error?: unknown) => void;
	warning: (message: string) => void;
	info: (message: string) => void;
	success: (message: string) => void;
	debug: (message: string) => void;
}

export class LogService implements ILogService {
	error = (message: string, error?: unknown) => {
		console.error(`${message}`, error);
	};
	warning = (message: string) => {
		console.warn(message);
	};
	info = (message: string) => {
		console.info(message);
	};
	success = (message: string) => {
		console.info(message);
	};
	debug = (message: string) => {
		console.debug(message);
	};
}
