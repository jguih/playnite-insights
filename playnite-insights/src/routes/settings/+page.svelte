<script lang="ts">
	import { clientServiceLocator } from '$lib/client/app-state/AppData.svelte';
	import Dashboard from '$lib/client/components/bottom-nav/Dashboard.svelte';
	import Home from '$lib/client/components/bottom-nav/Home.svelte';
	import Settings from '$lib/client/components/bottom-nav/Settings.svelte';
	import BottomNav from '$lib/client/components/BottomNav.svelte';
	import LightButton from '$lib/client/components/buttons/LightButton.svelte';
	import Header from '$lib/client/components/Header.svelte';
	import BaseAppLayout from '$lib/client/components/layout/BaseAppLayout.svelte';
	import Main from '$lib/client/components/Main.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';
	import { AlertCircle, ArrowLeft, CheckCircle } from '@lucide/svelte';

	let currentLocale = $derived(getLocale());
	let serverConnectionStatusText = $derived(
		clientServiceLocator.eventSourceManager.serverConnectionStatusText,
	);
	let serverConnectionStatus = $derived(
		clientServiceLocator.eventSourceManager.serverConnectionStatus,
	);
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
		<ul>
			{#each locales as locale (locale)}
				<li>
					{#if currentLocale === locale}
						<LightButton
							onclick={() => setLocale(locale)}
							selected
						>
							{m.language_name({}, { locale: locale })}
						</LightButton>
					{:else}
						<LightButton onclick={() => setLocale(locale)}>
							{m.language_name({}, { locale: locale })}
						</LightButton>
					{/if}
				</li>
			{/each}
		</ul>
	</Main>
	<BottomNav>
		<Home />
		<Dashboard />
		<Settings selected={true} />
	</BottomNav>
</BaseAppLayout>
