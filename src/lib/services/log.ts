import { ZodError } from 'zod';

export const LOG_LEVELS = {
	none: 1000,
	debug: 0,
	info: 1,
	success: 2,
	warning: 3,
	error: 4
};

export type LogService = {
	error: (message: string, error?: Error) => void;
	warning: (message: string) => void;
	info: (message: string) => void;
	success: (message: string) => void;
	debug: (message: string) => void;
	LOG_LEVELS: typeof LOG_LEVELS;
};

export const makeLogService = (CURRENT_LOG_LEVEL: number) => {
	const getDateTimeString = (): string => {
		const now = new Date();
		return now.toISOString().replace('T', ' ').replace('Z', '').trim();
	};

	const logError = (message: string, error?: unknown): void => {
		if (CURRENT_LOG_LEVEL > LOG_LEVELS.error) {
			return;
		}
		console.error(`[${getDateTimeString()}][ERROR] ${message}`);
		if (error && error instanceof ZodError) {
			const formattedIssues = error.issues
				.map((i) => `- ${i.path.join('.') || '(root)'}: ${i.message}`)
				.join('\n');
			console.error(formattedIssues);
			return;
		}
		if (error) {
			console.error(error);
		}
	};

	const logWarning = (message: string): void => {
		if (CURRENT_LOG_LEVEL > LOG_LEVELS.warning) {
			return;
		}
		console.warn(`[${getDateTimeString()}][WARNING] ${message}`);
	};

	const logDebug = (message: string): void => {
		if (CURRENT_LOG_LEVEL > LOG_LEVELS.debug) {
			return;
		}
		console.debug(`[${getDateTimeString()}][DEBUG] ${message}`);
	};

	const logSuccess = (message: string): void => {
		if (CURRENT_LOG_LEVEL > LOG_LEVELS.success) {
			return;
		}
		console.log(`[${getDateTimeString()}][SUCCESS] ${message}`);
	};

	const logInfo = (message: string): void => {
		if (CURRENT_LOG_LEVEL > LOG_LEVELS.info) {
			return;
		}
		console.info(`[${getDateTimeString()}][INFO] ${message}`);
	};

	return {
		error: logError,
		warning: logWarning,
		info: logInfo,
		success: logSuccess,
		debug: logDebug,
		LOG_LEVELS,
		CURRENT_LOG_LEVEL
	};
};
