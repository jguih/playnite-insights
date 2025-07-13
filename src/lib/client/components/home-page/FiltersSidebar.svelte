<script lang="ts">
	import { XIcon } from '@lucide/svelte';
	import LightButton from '../buttons/LightButton.svelte';
	import Backdrop from '../sidebar/Backdrop.svelte';
	import Sidebar from '../sidebar/Sidebar.svelte';
	import SidebarBody from '../sidebar/SidebarBody.svelte';
	import SidebarHeader from '../sidebar/SidebarHeader.svelte';
	import { filtersState } from './store.svelte';
	import { page } from '$app/state';
	import Divider from '../Divider.svelte';
	import { goto } from '$app/navigation';

	let installed: boolean = $derived(page.url.searchParams.get('installed') === '1');
	let notInstalled: boolean = $state(page.url.searchParams.get('notInstalled') === '1');

	const pushValue = (key: string, checked: boolean) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', '1');
		if (checked) params.set(key, '1');
		else params.delete(key);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		goto(newUrl, { replaceState: true, keepFocus: true });
	};
</script>

{#if filtersState.show}
	<Backdrop onclick={() => (filtersState.show = !filtersState.show)} />
	<Sidebar width={80}>
		<SidebarHeader>
			<h1 class="text-2xl">Filters</h1>
			<LightButton
				class="opacity-80"
				size="md"
				onclick={() => (filtersState.show = !filtersState.show)}
			>
				<XIcon />
			</LightButton>
		</SidebarHeader>
		<SidebarBody>
			<fieldset class="flex flex-col justify-center gap-2">
				<label for="installed">
					<input
						bind:checked={installed}
						type="checkbox"
						name="installed"
						id="installed"
						onchange={(e) => {
							pushValue('installed', e.currentTarget.checked);
						}}
					/>
					Installed
				</label>
				<label for="not_installed">
					<input
						bind:checked={notInstalled}
						type="checkbox"
						name="not_installed"
						id="not_installed"
						onchange={(e) => {
							pushValue('notInstalled', e.currentTarget.checked);
						}}
					/>
					Not Installed
				</label>
			</fieldset>
		</SidebarBody>
	</Sidebar>
{/if}
