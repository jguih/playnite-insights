export type ILogServicePort = {
	error: (message: string, error?: unknown, details?: unknown) => void;
	warning: (message: string, details?: unknown) => void;
	info: (message: string, details?: unknown) => void;
	success: (message: string, details?: unknown) => void;
	debug: (message: string, details?: unknown) => void;
	getRequestDescription: (request: Request) => string;
};

export type ILogServiceFactoryPort = {
	build: (context?: string) => ILogServicePort;
};
