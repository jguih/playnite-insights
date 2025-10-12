import type { KeyValueRepository } from '../db/keyValueRepository.svelte';

export type AuthServiceDeps = {
	keyValueRepository: KeyValueRepository;
};

export class AuthService {
	#keyValueRepository: AuthServiceDeps['keyValueRepository'];
	#sessionId: string | null = null;

	constructor({ keyValueRepository }: AuthServiceDeps) {
		this.#keyValueRepository = keyValueRepository;
	}

	getSessionId = async (): Promise<string | null> => {
		if (this.#sessionId) return this.#sessionId;
		const sessionId = await this.#keyValueRepository.getAsync({ key: 'session-id' });
		if (sessionId) this.#sessionId = sessionId;
		return this.#sessionId;
	};
}
