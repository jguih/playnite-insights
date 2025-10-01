import type { KeyValueRepository } from '$lib/client/db/keyValueRepository.svelte';
import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import type { ApplicationSettings } from '@playnite-insights/lib/client';

export type ApplicationSettingsStoreDeps = {
	keyValueRepository: KeyValueRepository;
};

const defaultSettings: ApplicationSettings = {
	desconsiderHiddenGames: true,
};

export class ApplicationSettingsStore {
	#keyValueRepository: KeyValueRepository;
	#settingsSignal: ApplicationSettings;

	constructor({ keyValueRepository }: ApplicationSettingsStoreDeps) {
		this.#keyValueRepository = keyValueRepository;
		this.#settingsSignal = $state(defaultSettings);
	}

	loadSettings = async () => {
		try {
			const settings = await this.#keyValueRepository.getAsync({ key: 'application-settings' });
			if (settings) this.#settingsSignal = settings;
		} catch (error) {
			handleClientErrors(error, `[loadSettings] failed`);
		}
	};

	saveSettings = async (settings: ApplicationSettings) => {
		try {
			await this.#keyValueRepository.putAsync({
				keyvalue: { Key: 'application-settings', Value: { ...settings } },
			});
		} catch (error) {
			handleClientErrors(error, `[loadSettings] failed`);
		}
	};

	get settingsSignal() {
		return this.#settingsSignal;
	}
}
