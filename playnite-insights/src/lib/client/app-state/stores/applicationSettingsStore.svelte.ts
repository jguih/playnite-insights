import type { KeyValueRepository } from '$lib/client/db/keyValueRepository.svelte';
import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import type { ApplicationSettings } from '@playnite-insights/lib/client';

export type ApplicationSettingsStoreDeps = {
	keyValueRepository: KeyValueRepository;
};

const defaultSettings: ApplicationSettings = {
	desconsiderHiddenGames: true,
};

export type SettingsChangeListener = (settings: ApplicationSettings) => void | Promise<void>;

export interface IApplicationSettingsStore {
	loadSettings: () => Promise<void>;
	saveSettings: (settings: ApplicationSettings) => Promise<void>;
	addListener: (listener: SettingsChangeListener) => () => void;
	settingsSignal: ApplicationSettings;
}

export class ApplicationSettingsStore implements IApplicationSettingsStore {
	#keyValueRepository: KeyValueRepository;
	#settingsSignal: ApplicationSettings;
	#changeListeners: Set<SettingsChangeListener>;

	constructor({ keyValueRepository }: ApplicationSettingsStoreDeps) {
		this.#keyValueRepository = keyValueRepository;
		this.#settingsSignal = $state(defaultSettings);
		this.#changeListeners = new Set();
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
			const newSettings = { ...settings };
			await this.#keyValueRepository.putAsync({
				keyvalue: { Key: 'application-settings', Value: newSettings },
			});
			this.#settingsSignal = newSettings;
			for (const listener of this.#changeListeners) {
				listener(newSettings);
			}
		} catch (error) {
			handleClientErrors(error, `[loadSettings] failed`);
		}
	};

	addListener = (listener: SettingsChangeListener) => {
		this.#changeListeners.add(listener);
		return () => {
			this.#changeListeners.delete(listener);
		};
	};

	get settingsSignal() {
		return this.#settingsSignal;
	}
}
