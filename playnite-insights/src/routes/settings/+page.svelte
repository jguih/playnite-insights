<script lang="ts">
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
	import { ArrowLeft } from '@lucide/svelte';

	let currentLocale = $derived(getLocale());
</script>

<BaseAppLayout>
	<Header>
		{#snippet action()}
			<LightButton onclick={() => history.back()}>
				<ArrowLeft class={['size-md']} />
			</LightButton>
		{/snippet}
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
