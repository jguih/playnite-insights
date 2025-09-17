import { m } from '$lib/paraglide/messages';
import { toast } from './app-state/toast.svelte';

export class ServiceWorkerUpdater {
	#newVersionAvailable: boolean;

	constructor() {
		this.#newVersionAvailable = $state(false);
	}

	watchServiceWorkerUpdates = () => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then((registration) => {
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					if (!newWorker) return;

					newWorker.addEventListener('statechange', () => {
						if (
							newWorker.state === 'installed' &&
							navigator.serviceWorker.controller &&
							registration.waiting
						) {
							toast.success({
								title: m.toast_new_update_available_title(),
								message: m.toast_new_update_available_message(),
								durationMs: 999_999,
								action: () => {
									registration.waiting?.postMessage({ action: 'skipWaiting' });
									this.newVersionAvailable = false;
								},
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

	get newVersionAvailable() {
		return this.#newVersionAvailable;
	}

	set newVersionAvailable(value: boolean) {
		this.#newVersionAvailable = value;
	}
}
