export interface ILogServicePort {
	error: (message: string, error?: unknown, ...extra: unknown[]) => void;
	warning: (message: string, ...extra: unknown[]) => void;
	info: (message: string, ...extra: unknown[]) => void;
	success: (message: string, ...extra: unknown[]) => void;
	debug: (message: string, ...extra: unknown[]) => void;
}
