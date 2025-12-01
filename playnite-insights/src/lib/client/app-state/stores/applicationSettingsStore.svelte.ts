import { IndexedDBNotInitializedError } from '$lib/client/db/errors/indexeddbNotInitialized';
import type { KeyValueRepository } from '$lib/client/db/keyValueRepository.svelte';
import type { ILogService } from '$lib/client/logService.svelte';
import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import { AppClientError, type ApplicationSettings } from '@playnite-insights/lib/client';

export type ApplicationSettingsStoreDeps = {
	keyValueRepository: KeyValueRepository;
	logService: ILogService;
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
	#keyValueRepository: ApplicationSettingsStoreDeps['keyValueRepository'];
	#logService: ApplicationSettingsStoreDeps['logService'];
	#settingsSignal: ApplicationSettings;
	#changeListeners: Set<SettingsChangeListener>;

	constructor({ keyValueRepository, logService }: ApplicationSettingsStoreDeps) {
		this.#keyValueRepository = keyValueRepository;
		this.#logService = logService;
		this.#settingsSignal = $state(defaultSettings);
		this.#changeListeners = new Set();
	}

	loadSettings = async () => {
		try {
			const settings = await this.#keyValueRepository.getAsync({ key: 'application-settings' });
			if (settings) this.#settingsSignal = settings;
		} catch (error) {
			if (error instanceof IndexedDBNotInitializedError) {
				this.#logService.error(
					`IndexedDb not initialized while loading application settings: ${error.message}`,
				);
				throw new AppClientError(
					{
						code: 'indexeddb_not_initialized',
						message: 'IndexedDb not initialized while loading application settings',
					},
					error,
				);
			} else if (error instanceof DOMException) {
				this.#logService.error(
					`DOMException while loading application settings (${error.name}): ${error.message}`,
					error,
				);
				throw new AppClientError(
					{
						code: 'dom_exception',
						message: `DOMException while loading application settings`,
					},
					error,
				);
			}
			this.#logService.error(`Unknown error while loading application settings`, error);
			throw new AppClientError(
				{
					code: 'load_application_settings_failed',
					message: 'Unknown error while loading application settings',
				},
				error,
			);
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
