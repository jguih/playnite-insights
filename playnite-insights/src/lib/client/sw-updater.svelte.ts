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
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							this.#newVersionAvailable = true;
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
