<script lang="ts">
	import { ChevronDown, XIcon } from '@lucide/svelte';
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
	import { m } from '$lib/paraglide/messages';
	import Dropdown from '../dropdown/Dropdown.svelte';
	import DropdownBody from '../dropdown/DropdownBody.svelte';

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
			<h1 class="text-xl">{m.filters_title()}</h1>
			<LightButton class="opacity-80" onclick={() => (filtersState.show = !filtersState.show)}>
				<XIcon />
			</LightButton>
		</SidebarHeader>
		<SidebarBody>
			<label for="sort-order" class="text-md">
				{m.label_sort_order()}
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
				{m.label_sort_by()}
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
					{m.label_filter_installed()}
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
					{m.label_filter_not_installed()}
				</label>
			</fieldset>
			<Divider class="border-1 my-2" />
			<Dropdown class=" w-full">
				{#snippet button({ onclick })}
					<LightButton {onclick} class="bg-background-2 w-full p-2">
						Genres <ChevronDown class="h-5 w-5" />
					</LightButton>
				{/snippet}
				{#snippet body()}
					<DropdownBody>Testing</DropdownBody>
				{/snippet}
			</Dropdown>
			<hr class="border-background-1" />
			<Dropdown class=" w-full">
				{#snippet button({ onclick })}
					<LightButton {onclick} class="bg-background-2 w-full p-2">
						Platforms<ChevronDown class="h-5 w-5" />
					</LightButton>
				{/snippet}
				{#snippet body()}
					<DropdownBody>Testing</DropdownBody>
				{/snippet}
			</Dropdown>
			<hr class="border-background-1" />
			<Dropdown class=" w-full">
				{#snippet button({ onclick })}
					<LightButton {onclick} class="bg-background-2 w-full p-2">
						Publishers<ChevronDown class="h-5 w-5" />
					</LightButton>
				{/snippet}
				{#snippet body()}
					<DropdownBody>Testing</DropdownBody>
				{/snippet}
			</Dropdown>
			<hr class="border-background-1" />
			<Dropdown class=" w-full">
				{#snippet button({ onclick })}
					<LightButton {onclick} class="bg-background-2 w-full p-2">
						Developers<ChevronDown class="h-5 w-5" />
					</LightButton>
				{/snippet}
				{#snippet body()}
					<DropdownBody>Testing</DropdownBody>
				{/snippet}
			</Dropdown>
		</SidebarBody>
	</Sidebar>
{/if}
