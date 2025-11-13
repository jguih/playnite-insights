import { m } from '$lib/paraglide/messages';
import { EmptyStrategy, type IFetchClient, type RemoteAction } from '@playnite-insights/lib/client';
import { toast } from '../app-state/toast.svelte';

export type PlayniteRemoteActionDeps = {
	httpClient: IFetchClient;
};

export class PlayniteRemoteAction {
	#httpClient: PlayniteRemoteActionDeps['httpClient'];
	#actionLoadingState: { takeScreenShot: boolean };

	constructor({ httpClient }: PlayniteRemoteActionDeps) {
		this.#httpClient = httpClient;

		this.#actionLoadingState = $state({ takeScreenShot: false });
	}

	takeScreenshotAsync = async () => {
		try {
			this.#actionLoadingState.takeScreenShot = true;
			toast.info({
				title: m.toast_remote_action_take_screenshot_in_progress_title(),
				message: m.toast_remote_action_take_screenshot_in_progress_message(),
				category: 'network',
			});
			const command: RemoteAction = {
				action: 'screenshot',
			};
			await this.#httpClient.httpPostAsync({
				endpoint: '/api/action',
				body: command,
				strategy: new EmptyStrategy(),
			});
			toast.success({
				title: m.toast_remote_action_take_screenshot_success_title(),
				message: m.toast_remote_action_take_screenshot_success_message(),
				category: 'network',
			});
		} catch (error) {
			console.error(error);
			toast.error({
				title: m.toast_remote_action_take_screenshot_error_title(),
				message: m.toast_remote_action_take_screenshot_error_message(),
				category: 'network',
			});
		} finally {
			this.#actionLoadingState.takeScreenShot = false;
		}
	};

	get actionLoadingState() {
		return this.#actionLoadingState;
	}
}
