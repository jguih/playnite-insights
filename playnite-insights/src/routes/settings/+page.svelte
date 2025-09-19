<script lang="ts">
	import { clientServiceLocator } from '$lib/client/app-state/AppData.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Select from '$lib/client/components/forms/Select.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import ConfigSection from '$lib/client/components/settings-page/ConfigSection.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, locales, setLocale, type Locale } from '$lib/paraglide/runtime';
	import { AlertCircle, ArrowLeft, CheckCircle } from '@lucide/svelte';
	import type { ChangeEventHandler } from 'svelte/elements';

	let currentLocale = $state(getLocale());
	let serverConnectionStatusText = $derived(
		clientServiceLocator.eventSourceManager.serverConnectionStatusText,
	);
	let serverConnectionStatus = $derived(
		clientServiceLocator.eventSourceManager.serverConnectionStatus,
	);

	const isValidLocale = (value: string): value is Locale => {
		return locales.includes(value as Locale);
	};

	const handleOnChangeLocale: ChangeEventHandler<HTMLSelectElement> = (e) => {
		const value = e.currentTarget.value;
		if (isValidLocale(value)) setLocale(value);
	};
</script>

<BaseAppLayout>
	<Header>
		{#snippet action()}
			<LightButton onclick={() => history.back()}>
				<ArrowLeft class={['size-md']} />
			</LightButton>
		{/snippet}
		<div class="flex w-full justify-end">
			{#if serverConnectionStatus === true}
				<p class="text-success-light-fg wrap-normal block text-sm">
					{serverConnectionStatusText}
					<CheckCircle class={['size-sm inline-block']} />
				</p>
			{:else}
				<p class="text-warning-light-fg wrap-normal block text-sm">
					{serverConnectionStatusText}
					<AlertCircle class={['size-sm inline-block']} />
				</p>
			{/if}
		</div>
	</Header>
	<Main>
		<ConfigSection title="Idioma">
			<label
				for="settings-language"
				class="flex flex-col items-start gap-2"
			>
				Selecionar idioma
				<Select
					onchange={handleOnChangeLocale}
					id="settings-language"
					class={['bg-background-2! w-full']}
					value={currentLocale}
				>
					{#each locales as locale (locale)}
						<option value={locale}>
							{m.language_name({}, { locale: locale })}
						</option>
					{/each}
				</Select>
			</label>
		</ConfigSection>
	</Main>
	<BottomNav>
		<Home />
		<Dashboard />
		<Settings selected={true} />
	</BottomNav>
</BaseAppLayout>
