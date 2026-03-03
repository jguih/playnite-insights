<script lang="ts">
	import { normalize } from "$lib/modules/common/common";
	import { m } from "$lib/paraglide/messages";
	import LightButton from "$lib/ui/components/buttons/LightButton.svelte";
	import SolidButton from "$lib/ui/components/buttons/SolidButton.svelte";
	import SolidChip from "$lib/ui/components/chip/SolidChip.svelte";
	import Divider from "$lib/ui/components/Divider.svelte";
	import Spinner from "$lib/ui/components/Spinner.svelte";
	import type { ComponentVariant } from "$lib/ui/components/types";
	import type { ExtensionRegistrationResponseDto } from "@playatlas/auth/dtos";
	import { extensionRegistrationAuthorizationAction } from "./extension-registration-card.constants";
	import type { ExtensionRegistrationAuthorizationAction } from "./extension-registration-card.types";

	type ExtensionRegistrationCardProps = {
		registration: ExtensionRegistrationResponseDto;
		onAuthorizationActionAsync: (action: ExtensionRegistrationAuthorizationAction) => Promise<void>;
	};

	const { registration, onAuthorizationActionAsync }: ExtensionRegistrationCardProps = $props();

	const osName = $derived.by(() => {
		const os = registration.Os;
		if (os && normalize(os).includes("windows")) {
			return "Windows";
		}
		return "Unknown";
	});

	const requestedAt = $derived.by(() => {
		const createdAt = new Date(registration.CreatedAt);
		const createdAtMs = createdAt.getTime();
		const diffMs = Date.now() - createdAtMs;
		const diffS = Math.floor(diffMs / 1000);
		const diffMins = Math.floor(diffS / 60);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffS <= 60) return `just now`;

		if (diffMins <= 60) return m["duration.minutes_ago"]({ mins: diffMins });

		if (diffHours <= 24) return m["duration.hours_ago"]({ hours: diffHours });

		if (diffDays <= 7) return m["duration.days_ago"]({ days: diffDays });

		return createdAt.toLocaleString();
	});

	const registrationAuthorizationState: Record<
		ExtensionRegistrationAuthorizationAction,
		{ loading: boolean; disabled: boolean }
	> = $state({
		trust: { loading: false, disabled: false },
		reject: { loading: false, disabled: false },
		revoke: { loading: false, disabled: false },
		remove: { loading: false, disabled: false },
	});

	const handleRegistrationAuthorizationAsync = async (
		action: ExtensionRegistrationAuthorizationAction,
	) => {
		if (
			extensionRegistrationAuthorizationAction.some(
				(a) => registrationAuthorizationState[a].loading,
			)
		)
			return;

		registrationAuthorizationState[action].loading = true;

		for (const action of extensionRegistrationAuthorizationAction)
			registrationAuthorizationState[action].disabled = true;

		try {
			await onAuthorizationActionAsync(action);
		} finally {
			registrationAuthorizationState[action].loading = false;
			extensionRegistrationAuthorizationAction.forEach(
				(a) => (registrationAuthorizationState[a].disabled = false),
			);
		}
	};

	const actionButtonMeta = {
		trust: {
			label: () => m["onboarding_page.extension_registration.trust_registration_action_label"](),
			variant: "success",
			action: () => handleRegistrationAuthorizationAsync("trust"),
			isLoading: () => registrationAuthorizationState.trust.loading,
			isDisabled: () => registrationAuthorizationState.trust.disabled,
		},
		reject: {
			label: () => m["onboarding_page.extension_registration.reject_registration_action_label"](),
			variant: "error",
			action: () => handleRegistrationAuthorizationAsync("reject"),
			isLoading: () => registrationAuthorizationState.reject.loading,
			isDisabled: () => registrationAuthorizationState.reject.disabled,
		},
		revoke: {
			label: () => m["onboarding_page.extension_registration.revoke_registration_action_label"](),
			variant: "error",
			action: () => handleRegistrationAuthorizationAsync("revoke"),
			isLoading: () => registrationAuthorizationState.revoke.loading,
			isDisabled: () => registrationAuthorizationState.revoke.disabled,
		},
		remove: {
			label: () => m["onboarding_page.extension_registration.remove_registration_action_label"](),
			variant: "neutral",
			action: () => handleRegistrationAuthorizationAsync("remove"),
			isLoading: () => registrationAuthorizationState.remove.loading,
			isDisabled: () => registrationAuthorizationState.remove.disabled,
		},
	} as const satisfies Record<
		ExtensionRegistrationAuthorizationAction,
		{
			label: () => string;
			variant: ComponentVariant;
			action: () => Promise<void>;
			isLoading: () => boolean;
			isDisabled: () => boolean;
		}
	>;

	type ActionButtonMeta = (typeof actionButtonMeta)[keyof typeof actionButtonMeta];

	const actionButtons = $derived.by(() => {
		const status = registration.Status;
		const buttons: ActionButtonMeta[] = [];

		switch (status) {
			case "trusted": {
				buttons.push(actionButtonMeta.revoke);
				break;
			}
			case "pending": {
				buttons.push(actionButtonMeta.reject, actionButtonMeta.trust);
				break;
			}
			case "rejected": {
				buttons.push(actionButtonMeta.remove);
				break;
			}
		}

		return buttons;
	});

	const fingerprintFromPemAsync = async (pem: string): Promise<string> => {
		const base64 = pem
			.replace(/-----BEGIN PUBLIC KEY-----/g, "")
			.replace(/-----END PUBLIC KEY-----/g, "")
			.replace(/\s/g, "");

		const binary = atob(base64);
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

		const hash = await crypto.subtle.digest("SHA-256", bytes);
		const arr = Array.from(new Uint8Array(hash)).slice(0, 6);

		return arr.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(":");
	};
</script>

{#snippet statusChip(status: ExtensionRegistrationResponseDto["Status"])}
	{#if status === "pending"}
		<SolidChip variant="warning">
			{m["onboarding_page.extension_registration.registration_status.pending"]()}
		</SolidChip>
	{:else if status === "rejected"}
		<SolidChip variant="error">
			{m["onboarding_page.extension_registration.registration_status.rejected"]()}
		</SolidChip>
	{:else if status === "trusted"}
		<SolidChip variant="primary">
			{m["onboarding_page.extension_registration.registration_status.trusted"]()}
		</SolidChip>
	{/if}
{/snippet}

<div class="bg-background-1 px-4 py-2">
	<p>
		<span class="text-primary-light-active-fg text-lg">{registration.Hostname}</span> •
		<span class="">{osName}</span>
	</p>
	<p class="font-semibold text-sm text-foreground/80">
		{m["onboarding_page.extension_registration.registration_requested_at.prefix"]()}
		{requestedAt}
	</p>
	<Divider class="mt-2 mb-4" />
	<div class="mb-2 w-fit mx-auto">
		{@render statusChip(registration.Status)}
	</div>
	{#if registration.Status === "rejected"}
		<p class="text-foreground/80 text-sm mb-4 text-left">
			{m["onboarding_page.extension_registration.reject_registration_status_explanation"]()}
		</p>
	{/if}
	<div class="my-4">
		<p class="font-semibold w-fit mx-auto mb-1">Fingerprint:</p>
		<p class="px-1 py-0.5 bg-neutral-bg/40 font-mono w-fit mx-auto tracking-widest">
			{#await fingerprintFromPemAsync(registration.PublicKey)}
				<Spinner size="sm" />
			{:then fingerprint}
				{fingerprint}
			{:catch}
				invalid fingerprint
			{/await}
		</p>
	</div>
	<div class="mt-6 flex gap-2 justify-end">
		{#each actionButtons as button, i (button.label)}
			{#if i === actionButtons.length - 1}
				<SolidButton
					variant={button.variant}
					onclick={() => button.action()}
					state={button.isLoading() ? "loading" : button.isDisabled() ? "disabled" : "default"}
					disabled={button.isDisabled()}
				>
					{button.label()}
				</SolidButton>
			{:else}
				<LightButton
					variant={button.variant}
					onclick={() => button.action()}
					state={button.isLoading() ? "loading" : button.isDisabled() ? "disabled" : "default"}
					disabled={button.isDisabled()}
				>
					{button.label()}
				</LightButton>
			{/if}
		{/each}
	</div>
</div>
