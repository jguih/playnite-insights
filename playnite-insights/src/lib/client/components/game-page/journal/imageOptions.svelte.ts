import { pushState } from '$app/navigation';
import { page } from '$app/state';

export class ImageOptions {
	#isOpen: boolean;

	static PAGE_STATE_KEY = 'noteImageOptions';

	constructor() {
		this.#isOpen = $derived(Object.hasOwn(page.state, ImageOptions.PAGE_STATE_KEY));
	}

	get isOpen() {
		return this.#isOpen;
	}

	open = () => {
		pushState('', { ...page.state, [ImageOptions.PAGE_STATE_KEY]: true });
	};

	close = () => {
		history.back();
	};
}
