import type { IClockPort } from "$lib/modules/common/application";
import type { SessionId, SessionIdAggregate } from "../domain";
import type { ISessionIdRepositoryPort } from "../infra";
import type { ISessionIdProviderPort } from "./session-id.provider.port";

export type SessionIdProviderDeps = {
	sessionIdRepository: ISessionIdRepositoryPort;
	clock: IClockPort;
};

export class SessionIdProvider implements ISessionIdProviderPort {
	private sessionIdSignal: SessionId | undefined | null = $state(undefined);

	constructor(private readonly deps: SessionIdProviderDeps) {}

	get(): SessionId | null {
		if (this.sessionIdSignal === undefined) throw new Error("SessionId not loaded");

		return this.sessionIdSignal;
	}

	hasSession: ISessionIdProviderPort["hasSession"] = () => {
		return this.get() !== null;
	};

	async setAsync(sessionId: SessionId): Promise<void> {
		const now = this.deps.clock.now();

		const sessionIdAggregate: SessionIdAggregate = {
			Id: sessionId,
			SourceLastUpdatedAt: now,
		};

		await this.deps.sessionIdRepository.setAsync(sessionIdAggregate);

		this.sessionIdSignal = sessionId;
	}

	async loadFromDbAsync(): Promise<void> {
		const aggregate = await this.deps.sessionIdRepository.getAsync();
		this.sessionIdSignal = aggregate?.Id ?? null;
	}
}
