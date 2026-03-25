import type { ILogServicePort } from "./log-service.port";

export type ILogServiceFactory = {
	build: (context: string) => ILogServicePort;
};
