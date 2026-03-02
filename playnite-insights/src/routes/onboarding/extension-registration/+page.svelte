<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { getClientApiContext } from "$lib/modules/bootstrap/application";
	import type { ExtensionRegistrationAuthorizationAction } from "$lib/page/onboarding/extension-registration/extension-registration-card.types";
	import ExtensionRegistrationCard from "$lib/page/onboarding/extension-registration/ExtensionRegistrationCard.svelte";
	import { m } from "$lib/paraglide/messages";
	import Divider from "$lib/ui/components/Divider.svelte";
	import AppLayout from "$lib/ui/components/layout/AppLayout.svelte";
	import Main from "$lib/ui/components/Main.svelte";
	import Spinner from "$lib/ui/components/Spinner.svelte";
	import type { ExtensionRegistrationResponseDto } from "@playatlas/auth/dtos";

	const api = getClientApiContext();
	const registrationState: {
		registrations: ExtensionRegistrationResponseDto[];
		pendingRegistrations: ExtensionRegistrationResponseDto[];
		loading: boolean;
	} = $state({
		registrations: [],
		pendingRegistrations: [],
		loading: true,
	});

	const loadRegistrationsAsync = () =>
		api()
			.Auth.ExtensionRegistrationClient.getAllAsync()
			.then(({ registrations }) => {
				registrationState.registrations = registrations;
				registrationState.registrations.sort((a, b) => {
					const aCreatedAt = new Date(a.CreatedAt).getTime();
					const bCreatedAt = new Date(b.CreatedAt).getTime();

					if (aCreatedAt - bCreatedAt !== 0) return bCreatedAt - aCreatedAt;

					return a.Id - b.Id;
				});

				registrationState.pendingRegistrations = registrationState.registrations.filter(
					(r) => r.Status !== "trusted",
				);
			})
			.finally(() => (registrationState.loading = false));

	void loadRegistrationsAsync();

	const handleRegistrationAuthorizationAsync = async (
		registrationId: ExtensionRegistrationResponseDto["Id"],
		action: ExtensionRegistrationAuthorizationAction,
	) => {
		switch (action) {
			case "trust": {
				const result =
					await api().Auth.ExtensionAuthorizationService.authorizeAsync(registrationId);
				if (result.success) return await goto(resolve("/"));
				break;
			}
			case "reject": {
				await api().Auth.ExtensionAuthorizationService.rejectAsync(registrationId);
				break;
			}
			case "revoke": {
				await api().Auth.ExtensionAuthorizationService.revokeAsync(registrationId);
				break;
			}
		}
		await loadRegistrationsAsync();
	};
</script>

<AppLayout>
	<Main class="h-dvh w-full flex items-center justify-center">
		{#if registrationState.loading}
			<Spinner variant="primary" />
		{:else}
			<div class="w-full">
				<h1 class="text-3xl mb-4">
					<span class="text-primary-light-active-fg">
						{m["product_extension_name"]()}
					</span>
					{m["onboarding_page.extension_registration.title.suffix"]()}
				</h1>
				{#if registrationState.pendingRegistrations.length > 0}
					<p class="text-sm mb-2">
						{m["onboarding_page.extension_registration.make_sure_fingerprint_matches.prefix"]()}
						<span class="font-semibold">{m.product_extension_name()}</span>.
					</p>
					<Divider />
					<ul class="space-y-4 overflow-y-auto max-h-[65dvh] w-full p-2">
						{#each registrationState.pendingRegistrations as registration (registration.Id)}
							<li>
								<ExtensionRegistrationCard
									{registration}
									onAuthorizationActionAsync={(action) =>
										handleRegistrationAuthorizationAsync(registration.Id, action)}
								/>
							</li>
						{/each}
					</ul>
				{:else}
					<p>
						{m["onboarding_page.extension_registration.description.prefix"]()}
						<span class="font-semibold">
							{m.product_extension_name()}
						</span>
						{m["onboarding_page.extension_registration.description.suffix"]()}
					</p>
					<img
						src="/onboarding/exporter-register-extension.jpg"
						width="400"
						height="200"
						alt="PlayAtlas exporter extension config screenshot"
						class="shadow-default my-4 object-cover w-full aspect-auto"
					/>
					<Divider />
					<div class="w-fit mx-auto space-y-2 my-4">
						<ol class="list-decimal ms-8">
							<li>{m["onboarding_page.extension_registration.request_approval_steps.step_1"]()}</li>
							<li>
								{m["onboarding_page.extension_registration.request_approval_steps.step_2.action"]()}
								<span class="font-semibold">
									{m[
										"onboarding_page.extension_registration.request_approval_steps.step_2.target"
									]()}
								</span>
							</li>
							<li>
								{m["onboarding_page.extension_registration.request_approval_steps.step_3.action"]()}
								<span class="font-semibold">
									{m[
										"onboarding_page.extension_registration.request_approval_steps.step_3.target"
									]()}
								</span>
							</li>
							<li>{m["onboarding_page.extension_registration.request_approval_steps.step_4"]()}</li>
						</ol>
						<p class="text-sm text-foreground/80">
							{m["onboarding_page.extension_registration.request_approval_steps.hint"]()}
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</Main>
</AppLayout>
