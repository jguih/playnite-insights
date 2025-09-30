<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { locator } from '$lib/client/app-state/serviceLocator.svelte';
	import { toast } from '$lib/client/app-state/toast.svelte';
	import SolidButton from '$lib/client/components/buttons/SolidButton.svelte';
	import BaseInput from '$lib/client/components/forms/BaseInput.svelte';
	import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
	import { m } from '$lib/paraglide/messages';
	import {
		AppError,
		EmptyStrategy,
		HttpClientNotSetError,
		type RegisterInstanceCommand,
	} from '@playnite-insights/lib/client';
	import type { FormEventHandler } from 'svelte/elements';

	let password: string | null = $state(null);
	let isLoading: boolean = $state(false);

	if (browser) {
		locator.instanceManager
			.isRegistered()
			.then((registered) => {
				if (registered) goto('/', { replaceState: true });
			})
			.catch(() => {});
	}

	const registerInstance = async () => {
		if (!password) throw new AppError('Instance password cannot be null');
		if (!locator.httpClient) throw new HttpClientNotSetError();
		const command: RegisterInstanceCommand = { password };
		await locator.httpClient.httpPostAsync({
			endpoint: '/api/auth/register',
			strategy: new EmptyStrategy(),
			body: command,
		});
	};

	const handleOnSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		registerInstance()
			.then(async () => {
				await goto('/auth/login', { replaceState: true });
				isLoading = false;
			})
			.catch((error) => {
				handleClientErrors(error, `[registerInstance] failed`);
				toast.error({ category: 'app', message: 'Failed to register instance' });
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
				{@html m.register_label_create_password({
					begin_span: '<span class="text-primary-light-active-fg"">',
					end_span: '</span>',
				})}
			</h1>
			<BaseInput
				class={['bg-background-1 p-2']}
				type="password"
				id="instance-password"
				name="password"
				placeholder={m.auth_placeholder_instance_password()}
				autocomplete="new-password"
				bind:value={password}
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
			{m.label_save()}
		</SolidButton>
	</form>
</main>
