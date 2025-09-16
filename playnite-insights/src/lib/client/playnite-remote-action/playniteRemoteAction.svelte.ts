import { m } from '$lib/paraglide/messages';
import {
	EmptyStrategy,
	HttpClientNotSetError,
	type IFetchClient,
	type RemoteAction,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../app-state/AppData.types';
import { toast } from '../app-state/toast.svelte';

export type PlayniteRemoteActionDeps = {
	httpClientSignal: HttpClientSignal;
};

export class PlayniteRemoteAction {
	#httpClientSignal: PlayniteRemoteActionDeps['httpClientSignal'];
	#actionLoadingState: { takeScreenShot: boolean };

	constructor({ httpClientSignal }: PlayniteRemoteActionDeps) {
		this.#httpClientSignal = httpClientSignal;

		this.#actionLoadingState = $state({ takeScreenShot: false });
	}

	protected withHttpClient = async <T>(
		cb: (props: { client: IFetchClient }) => Promise<T>,
	): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	takeScreenshotAsync = async () => {
		try {
			await this.withHttpClient(async ({ client }) => {
				this.#actionLoadingState.takeScreenShot = true;
				toast.info({
					title: m.toast_remote_action_take_screenshot_in_progress_title(),
					message: m.toast_remote_action_take_screenshot_in_progress_message(),
				});
				const command: RemoteAction = {
					action: 'screenshot',
				};
				await client.httpPostAsync({
					endpoint: '/api/action',
					body: command,
					strategy: new EmptyStrategy(),
				});
				toast.success({
					title: m.toast_remote_action_take_screenshot_success_title(),
					message: m.toast_remote_action_take_screenshot_success_message(),
				});
			});
		} catch (error) {
			console.error(error);
			toast.error({
				title: m.toast_remote_action_take_screenshot_error_title(),
				message: m.toast_remote_action_take_screenshot_error_message(),
			});
		} finally {
			this.#actionLoadingState.takeScreenShot = false;
		}
	};

	get actionLoadingState() {
		return this.#actionLoadingState;
	}
}
