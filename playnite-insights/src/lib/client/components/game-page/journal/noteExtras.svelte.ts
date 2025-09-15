import { pushState } from '$app/navigation';
import { page } from '$app/state';
import { withHttpClient } from '$lib/client/app-state/AppData.svelte';
import { JsonStrategy, uploadScreenshotResponseSchema } from '@playnite-insights/lib/client';

export class NoteExtras {
	#isOpen: boolean;

	constructor() {
		this.#isOpen = $derived(Object.hasOwn(page.state, 'imagePicker'));
	}

	get isOpen() {
		return this.#isOpen;
	}

	open = () => {
		pushState('', { ...page.state, imagePicker: true });
	};

	close = () => {
		history.back();
	};

	/**
	 * Sends an image to the backend server for persistent storage
	 * @param file The image file to upload
	 * @returns Path of the uploaded image
	 */
	uploadImageAsync = async (file: File): Promise<string> => {
		return await withHttpClient(async ({ client }) => {
			const formData = new FormData();
			formData.append('file', file);
			const uploadedFiles = await client.httpPostAsync({
				endpoint: '/api/assets/upload/screenshot',
				body: formData,
				strategy: new JsonStrategy(uploadScreenshotResponseSchema),
			});
			const uploadedImage = uploadedFiles.uploaded[0];
			return uploadedImage;
		});
	};
}
