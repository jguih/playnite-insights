export const LOG_LEVELS = {
	none: 1000,
	debug: 0,
	info: 1,
	success: 2,
	warning: 3,
	error: 4
};

const getLogLevel = () => {
	if (process.env.LOG_LEVEL) {
		return Number(process.env.LOG_LEVEL);
	}
	if (process.env.NODE_ENV == 'production') {
		return LOG_LEVELS.info;
	}
	return LOG_LEVELS.debug;
};

export const CURRENT_LOG_LEVEL = getLogLevel();

const getDateTimeString = (): string => {
	const now = new Date();
	return now.toISOString().replace('T', ' ').replace('Z', '').trim();
};

export const logError = (message: string, error?: Error): void => {
	if (CURRENT_LOG_LEVEL > LOG_LEVELS.error) {
		return;
	}
	console.error(`[${getDateTimeString()}][ERROR] ${message}`);
	if (error) {
		console.error(error);
	}
};

export const logWarning = (message: string): void => {
	if (CURRENT_LOG_LEVEL > LOG_LEVELS.warning) {
		return;
	}
	console.warn(`[${getDateTimeString()}][WARNING] ${message}`);
};

export const logDebug = (message: string): void => {
	if (CURRENT_LOG_LEVEL > LOG_LEVELS.debug) {
		return;
	}
	console.debug(`[${getDateTimeString()}][DEBUG] ${message}`);
};

export const logSuccess = (message: string): void => {
	if (CURRENT_LOG_LEVEL > LOG_LEVELS.success) {
		return;
	}
	console.log(`[${getDateTimeString()}][SUCCESS] ${message}`);
};

export const logInfo = (message: string): void => {
	if (CURRENT_LOG_LEVEL > LOG_LEVELS.info) {
		return;
	}
	console.info(`[${getDateTimeString()}][INFO] ${message}`);
};
