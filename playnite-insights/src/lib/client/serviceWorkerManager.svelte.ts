import { m } from '$lib/paraglide/messages';
import type { CompanyStore } from './app-state/stores/companyStore.svelte';
import type { GameSessionStore } from './app-state/stores/gameSessionStore.svelte';
import type { GameStore } from './app-state/stores/gameStore.svelte';
import type { GenreStore } from './app-state/stores/genreStore.svelte';
import type { LibraryMetricsStore } from './app-state/stores/libraryMetricsStore.svelte';
import type { PlatformStore } from './app-state/stores/platformStore.svelte';
import type { ScreenshotStore } from './app-state/stores/screenshotStore.svelte';
import { toast } from './app-state/toast.svelte';

export type ServiceWorkerManagerDeps = {
	gameStore: GameStore;
	companyStore: CompanyStore;
	platformStore: PlatformStore;
	libraryMetricsStore: LibraryMetricsStore;
	genreStore: GenreStore;
	gameSessionStore: GameSessionStore;
	screenshotStore: ScreenshotStore;
};

export class ServiceWorkerManager {
	#newVersionAvailable: boolean;
	// Stores
	#gameStore: GameStore;
	#companyStore: CompanyStore;
	#platformStore: PlatformStore;
	#libraryMetricsStore: LibraryMetricsStore;
	#genreStore: GenreStore;
	#gameSessionStore: GameSessionStore;
	#screenshotStore: ScreenshotStore;

	constructor({
		gameStore,
		companyStore,
		platformStore,
		libraryMetricsStore,
		genreStore,
		gameSessionStore,
		screenshotStore,
	}: ServiceWorkerManagerDeps) {
		this.#newVersionAvailable = $state(false);

		this.#gameStore = gameStore;
		this.#companyStore = companyStore;
		this.#platformStore = platformStore;
		this.#libraryMetricsStore = libraryMetricsStore;
		this.#genreStore = genreStore;
		this.#gameSessionStore = gameSessionStore;
		this.#screenshotStore = screenshotStore;
	}

	private handleMessage = (event: MessageEvent) => {
		if (!event.data || !Object.hasOwn(event.data, 'type')) return;
		const type = event.data.type;
		switch (type) {
			case 'GAMES_UPDATE': {
				this.#gameStore.loadGames();
				break;
			}
			case 'COMPANY_UPDATE': {
				this.#companyStore.loadCompanies();
				break;
			}
			case 'RECENT_SESSION_UPDATE': {
				this.#gameSessionStore.loadRecentSessions();
				break;
			}
			case 'GENRE_UPDATE': {
				this.#genreStore.loadGenres();
				break;
			}
			case 'PLATFORM_UPDATE': {
				this.#platformStore.loadPlatforms();
				break;
			}
			case 'LIBRARY_METRICS_UPDATE': {
				this.#libraryMetricsStore.loadLibraryMetrics();
				break;
			}
			case 'ALL_SCREENSHOT_UPDATE': {
				this.#screenshotStore.loadScreenshots();
				break;
			}
		}
	};

	watchServiceWorkerUpdates = () => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then((registration) => {
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					if (!newWorker) return;

					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							const waitingWorker = registration.waiting || newWorker;
							toast.success({
								title: m.toast_new_update_available_title(),
								message: m.toast_new_update_available_message(),
								durationMs: 999_999,
								action: () => {
									waitingWorker.postMessage({ action: 'skipWaiting' });
									this.newVersionAvailable = false;
								},
								category: 'app',
							});
						}
					});
				});
			});

			navigator.serviceWorker.addEventListener('controllerchange', () => {
				window.location.reload();
			});
		}
	};

	setupGlobalListeners = () => {
		this.clearGlobalListeners();
		navigator.serviceWorker?.addEventListener('message', this.handleMessage);
	};

	clearGlobalListeners = () => {
		navigator.serviceWorker?.removeEventListener('message', this.handleMessage);
	};

	get newVersionAvailable() {
		return this.#newVersionAvailable;
	}

	set newVersionAvailable(value: boolean) {
		this.#newVersionAvailable = value;
	}
}
