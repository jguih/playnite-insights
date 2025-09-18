import { m } from '$lib/paraglide/messages';
import {
	loadCompanies,
	loadGames,
	loadGenres,
	loadLibraryMetrics,
	loadPlatforms,
	loadRecentGameSessions,
} from './app-state/AppData.svelte';
import { toast } from './app-state/toast.svelte';

export class ServiceWorkerUpdater {
	#newVersionAvailable: boolean;

	constructor() {
		this.#newVersionAvailable = $state(false);
	}

	private handleMessage = (event: MessageEvent) => {
		if (!event.data || !Object.hasOwn(event.data, 'type')) return;
		const type = event.data.type;
		switch (type) {
			case 'GAMES_UPDATE': {
				loadGames();
				break;
			}
			case 'COMPANY_UPDATE': {
				loadCompanies();
				break;
			}
			case 'RECENT_SESSION_UPDATE': {
				loadRecentGameSessions();
				break;
			}
			case 'GENRE_UPDATE': {
				loadGenres();
				break;
			}
			case 'PLATFORM_UPDATE': {
				loadPlatforms();
				break;
			}
			case 'LIBRARY_METRICS_UPDATE': {
				loadLibraryMetrics();
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
