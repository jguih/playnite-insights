import { pushState } from '$app/navigation';
import { page } from '$app/state';

export class ScreenshotsGallery {
	#isOpen: boolean;

	static PAGE_STATE_KEY = 'screenshotsGalleryPanel';

	constructor() {
		this.#isOpen = $derived(Object.hasOwn(page.state, ScreenshotsGallery.PAGE_STATE_KEY));
	}

	get isOpen() {
		return this.#isOpen;
	}

	open = () => {
		pushState('', { ...page.state, [ScreenshotsGallery.PAGE_STATE_KEY]: true });
	};

	close = () => {
		history.back();
	};
}
