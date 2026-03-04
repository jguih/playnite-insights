import type { SessionId } from "../domain";
import type { ISessionIdCheckerPort } from "./session-id.checker.port";

export interface ISessionIdProviderPort extends ISessionIdCheckerPort {
	get: () => SessionId | null;
	setAsync: (sessionId: SessionId) => Promise<void>;
	loadFromDbAsync: () => Promise<void>;
}
