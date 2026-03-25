import type { IClockPort } from "./clock.port";
import { LogService } from "./log-service";
import type { ILogServiceFactory } from "./log-service.factory.port";

export type LogServiceFactoryDeps = {
	clock: IClockPort;
};

export class LogServiceFactory implements ILogServiceFactory {
	constructor(private readonly deps: LogServiceFactoryDeps) {}

	build: ILogServiceFactory["build"] = (context) => {
		return new LogService({ context, clock: this.deps.clock });
	};
}
