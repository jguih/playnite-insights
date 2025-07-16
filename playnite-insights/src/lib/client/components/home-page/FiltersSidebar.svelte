<script lang="ts">
	import { XIcon } from '@lucide/svelte';
	import LightButton from '../buttons/LightButton.svelte';
	import Backdrop from '../sidebar/Backdrop.svelte';
	import Sidebar from '../sidebar/Sidebar.svelte';
	import SidebarBody from '../sidebar/SidebarBody.svelte';
	import SidebarHeader from '../sidebar/SidebarHeader.svelte';
	import { filtersState } from './store.svelte';
	import Divider from '../Divider.svelte';
	import Select from '../Select.svelte';
	import type { Snippet } from 'svelte';
	import Checkbox from '../forms/Checkbox.svelte';
	import type { HomePageSearchParamKeys } from '@playnite-insights/lib/client/home-page';
	import type { GameSortBy, GameSortOrder } from '@playnite-insights/lib/client/playnite-game';

	let {
		setSearchParam,
		installed,
		notInstalled,
		sortOrder,
		sortBy,
		renderSortOrderOptions,
		renderSortByOptions
	}: {
		setSearchParam: (key: HomePageSearchParamKeys, value: string | boolean) => void;
		installed: boolean;
		notInstalled: boolean;
		sortOrder: GameSortOrder;
		sortBy: GameSortBy;
		renderSortOrderOptions: Snippet;
		renderSortByOptions: Snippet;
	} = $props();
</script>

{#if filtersState.show}
	<Backdrop onclick={() => (filtersState.show = !filtersState.show)} />
	<Sidebar width={80}>
		<SidebarHeader>
			<h1 class="text-xl">Filters</h1>
			<LightButton
				class="opacity-80"
				size="md"
				onclick={() => (filtersState.show = !filtersState.show)}
			>
				<XIcon />
			</LightButton>
		</SidebarHeader>
		<SidebarBody>
			<label for="sort-order" class="text-md">
				Sort Order
				<Select
					id="sort-order"
					class="bg-background-2 mt-1 w-full"
					value={sortOrder}
					onchange={(e) => setSearchParam('sortOrder', e.currentTarget.value)}
				>
					{@render renderSortOrderOptions()}
				</Select>
			</label>
			<label for="sort-by" class="text-md">
				Sort By
				<Select
					id="sort-by"
					class="bg-background-2 mt-1 w-full"
					value={sortBy}
					onchange={(e) => setSearchParam('sortBy', e.currentTarget.value)}
				>
					{@render renderSortByOptions()}
				</Select>
			</label>
			<Divider class="border-1 my-2" />
			<fieldset class="bg-background-2 flex flex-col justify-center">
				<label for="installed" class="text-md flex flex-row items-center gap-2 p-3">
					<Checkbox
						checked={installed}
						name="installed"
						id="installed"
						onchange={(e) => {
							setSearchParam('installed', e.currentTarget.checked);
						}}
					/>
					Installed
				</label>
				<hr class="border-background-1" />
				<label for="not_installed" class="text-md flex flex-row items-center gap-2 p-3">
					<Checkbox
						checked={notInstalled}
						name="not_installed"
						id="not_installed"
						onchange={(e) => {
							setSearchParam('notInstalled', e.currentTarget.checked);
						}}
					/>
					Not Installed
				</label>
			</fieldset>
		</SidebarBody>
	</Sidebar>
{/if}
