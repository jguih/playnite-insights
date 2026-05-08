import { logLevel, type ILogServicePort, type LogLevelNumber } from "@playatlas/common/application";

export const DEFAULT_SOURCE = "PlayAtlasServer";

export const makeLogService = (
	source: string = DEFAULT_SOURCE,
	getCurrentLogLevel: () => LogLevelNumber,
): ILogServicePort => {
	const getDateTimeString = (): string => {
		const now = new Date();
		return now.toLocaleString();
	};

	const replacer = (_: string, value: unknown) => {
		if (value instanceof Error) {
			return {
				name: value.name,
				message: value.message,
				stack: value.stack,
				cause: value.cause,
			};
		}

		if (value instanceof Date) {
			return value.toISOString();
		}

		return value;
	};

	const logError = (message: string, error?: unknown, details?: unknown): void => {
		if (getCurrentLogLevel() > logLevel.error) {
			return;
		}
		const baseMessage = `[${getDateTimeString()}] [ERROR] [${source}] ${message}`;
		const errorMessage = JSON.stringify(error, replacer);
		if (error && details)
			console.error(baseMessage, `${errorMessage}`, `${JSON.stringify(details, replacer)}`);
		else if (error) console.error(baseMessage, `${errorMessage}`);
		else console.error(baseMessage);
	};

	const logWarning = (message: string, details?: unknown): void => {
		if (getCurrentLogLevel() > logLevel.warning) {
			return;
		}
		const baseMessage = `[${getDateTimeString()}] [WARNING] [${source}] ${message}`;
		if (details) console.warn(baseMessage, `${JSON.stringify(details, replacer)}`);
		else console.warn(baseMessage);
	};

	const logDebug: ILogServicePort["debug"] = (message, details): void => {
		if (getCurrentLogLevel() > logLevel.debug) {
			return;
		}
		const baseMessage = `[${getDateTimeString()}] [DEBUG] [${source}] ${message}`;
		if (details) console.debug(baseMessage, `${JSON.stringify(details, replacer)}`);
		else console.debug(baseMessage);
	};

	const logSuccess: ILogServicePort["success"] = (message, details) => {
		if (getCurrentLogLevel() > logLevel.success) {
			return;
		}
		const baseMessage = `[${getDateTimeString()}] [INFO] [${source}] ${message}`;
		if (details) console.info(baseMessage, `${JSON.stringify(details, replacer)}`);
		else console.info(baseMessage);
	};

	const logInfo: ILogServicePort["info"] = (message, details): void => {
		if (getCurrentLogLevel() > logLevel.info) {
			return;
		}
		const baseMessage = `[${getDateTimeString()}] [INFO] [${source}] ${message}`;
		if (details) console.info(baseMessage, `${JSON.stringify(details, replacer)}`);
		else console.info(baseMessage);
	};

	const getRequestDescription: ILogServicePort["getRequestDescription"] = (request) => {
		const url = new URL(request.url);
		return `${request.method} ${url.pathname}`;
	};

	return {
		error: logError,
		warning: logWarning,
		info: logInfo,
		success: logSuccess,
		debug: logDebug,
		getRequestDescription,
	};
};
