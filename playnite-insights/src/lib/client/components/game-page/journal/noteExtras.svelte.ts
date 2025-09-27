import { pushState } from '$app/navigation';
import { page } from '$app/state';
import {
	HttpClientNotSetError,
	JsonStrategy,
	uploadScreenshotResponseSchema,
	type IFetchClient,
} from '@playnite-insights/lib/client';

export type NoteExtrasDeps = {
	httpClient: IFetchClient | null;
};

export class NoteExtras {
	#isOpen: boolean;
	#httpClient: NoteExtrasDeps['httpClient'];

	constructor({ httpClient }: NoteExtrasDeps) {
		this.#isOpen = $derived(Object.hasOwn(page.state, 'imagePicker'));
		this.#httpClient = httpClient;
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
		if (!this.#httpClient) throw new HttpClientNotSetError();
		const formData = new FormData();
		formData.append('file', file);
		const uploadedFiles = await this.#httpClient.httpPostAsync({
			endpoint: '/api/assets/upload/screenshot',
			body: formData,
			strategy: new JsonStrategy(uploadScreenshotResponseSchema),
			headers: {
				'X-Upload-Source': 'web-ui',
			},
		});
		const uploadedImage = uploadedFiles.uploaded[0];
		return uploadedImage;
	};
}
