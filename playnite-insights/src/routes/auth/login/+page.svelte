<script lang="ts">
	import { goto } from '$app/navigation';
	import { locator } from '$lib/client/app-state/serviceLocator.svelte';
	import { toast } from '$lib/client/app-state/toast.svelte';
	import SolidButton from '$lib/client/components/buttons/SolidButton.svelte';
	import BaseInput from '$lib/client/components/forms/BaseInput.svelte';
	import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
	import { m } from '$lib/paraglide/messages';
	import {
		AppError,
		HttpClientNotSetError,
		JsonStrategy,
		loginInstanceResponseSchema,
		type LoginInstanceCommand,
	} from '@playnite-insights/lib/client';
	import type { FormEventHandler } from 'svelte/elements';

	let password: string | null = $state(null);
	let isLoading: boolean = $state(false);

	const loginInstance = async () => {
		if (!password) throw new AppError('Instance password cannot be null');
		if (!locator.httpClient) throw new HttpClientNotSetError();
		const command: LoginInstanceCommand = { password };
		const response = await locator.httpClient.httpPostAsync({
			endpoint: '/api/auth/login',
			strategy: new JsonStrategy(loginInstanceResponseSchema),
			body: command,
		});
		return response.sessionId;
	};

	const handleOnSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		isLoading = true;
		loginInstance()
			.then(async (sessionId) => {
				await locator.keyValueRepository.putAsync({
					keyvalue: { Key: 'session-id', Value: sessionId },
				});
				await goto('/', { replaceState: true });
				isLoading = false;
			})
			.catch((error) => {
				handleClientErrors(error, `[loginInstance] failed`);
				toast.error({ category: 'app', message: 'Failed to login' });
				isLoading = false;
			});
	};
</script>

<main class="flex h-full w-full items-center justify-center">
	<form
		class="block max-w-80"
		onsubmit={handleOnSubmit}
	>
		<label for="instance-password">
			<h1 class="mb-4 text-3xl">
				{@html m.login_label_enter_password({
					begin_span: '<span class="text-primary-light-active-fg">',
					end_span: '</span>',
				})}
			</h1>
			<BaseInput
				class={['bg-background-1 p-2']}
				type="password"
				id="instance-password"
				name="password"
				bind:value={password}
				placeholder={m.auth_placeholder_instance_password()}
				minlength={4}
				required
			/>
		</label>
		<SolidButton
			class={['ml-auto mt-4 block']}
			size="lg"
			type="submit"
			{isLoading}
		>
			{m.label_login()}
		</SolidButton>
	</form>
</main>
