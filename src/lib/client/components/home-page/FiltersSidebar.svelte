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
	import Select from '../Select.svelte';

	let installed: boolean = $derived(page.url.searchParams.get('installed') === '1');
	let notInstalled: boolean = $derived(page.url.searchParams.get('notInstalled') === '1');
	let sortOrder: string = $derived(page.url.searchParams.get('sortOrder') ?? '');
	let sortBy: string = $derived(page.url.searchParams.get('sortBy') ?? '');

	const pushChecked = (key: string, checked: boolean) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', '1');
		if (checked) params.set(key, '1');
		else params.delete(key);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		goto(newUrl, { replaceState: true, keepFocus: true });
	};

	const pushValue = (key: string, value: string) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', '1');
		if (value === '') params.delete(key);
		else params.set(key, value);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		goto(newUrl, { replaceState: true, keepFocus: true });
	};
</script>

{#if filtersState.show}
	<Backdrop onclick={() => (filtersState.show = !filtersState.show)} />
	<Sidebar width={80}>
		<SidebarHeader>
			<h1 class="text-2xl">Filters and Sorting</h1>
			<LightButton
				class="opacity-80"
				size="md"
				onclick={() => (filtersState.show = !filtersState.show)}
			>
				<XIcon />
			</LightButton>
		</SidebarHeader>
		<SidebarBody>
			<h2 class="text-xl">Sorting</h2>
			<Divider class="mb-2 border-1" />
			<label for="sort-order">
				Order
				<Select
					id="sort-order"
					class="bg-background-2"
					value={sortOrder}
					onchange={(e) => pushValue('sortOrder', e.currentTarget.value)}
				>
					<option value="asc">Ascending</option>
					<option value="desc">Descending</option>
				</Select>
			</label>
			<Divider />
			<fieldset class="flex flex-col justify-center gap-2">
				<label for="installed">
					<input
						bind:checked={installed}
						type="checkbox"
						name="installed"
						id="installed"
						onchange={(e) => {
							pushChecked('installed', e.currentTarget.checked);
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
							pushChecked('notInstalled', e.currentTarget.checked);
						}}
					/>
					Not Installed
				</label>
			</fieldset>
		</SidebarBody>
	</Sidebar>
{/if}
