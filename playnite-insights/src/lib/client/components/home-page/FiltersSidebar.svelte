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
	import { m } from '$lib/paraglide/messages';
	import FilterDropdown from './FilterDropdown.svelte';
	import HeaderSearchBar from '../HeaderSearchBar.svelte';
	import type { Developer } from '@playnite-insights/lib/client/developer';

	let {
		setSearchParam,
		installed,
		notInstalled,
		sortOrder,
		sortBy,
		renderSortOrderOptions,
		renderSortByOptions,
		developers
	}: {
		setSearchParam: (key: HomePageSearchParamKeys, value: string | boolean) => void;
		installed: boolean;
		notInstalled: boolean;
		sortOrder: GameSortOrder;
		sortBy: GameSortBy;
		renderSortOrderOptions: Snippet;
		renderSortByOptions: Snippet;
		developers?: Developer[];
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
				<label for="installed" class="text-md flex flex-row items-center gap-2 p-2">
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
				<label for="not_installed" class="text-md flex flex-row items-center gap-2 p-2">
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
			<FilterDropdown label="Genres">
				<p>testing</p>
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown label="Platforms">
				<p>testing</p>
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown label="Publishers">
				<p>testing</p>
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown label="Developers">
				{#if developers}
					<HeaderSearchBar value={''} onChange={() => undefined} />
					<fieldset class="h-48 overflow-y-auto">
						{#each developers as dev}
							<label for={`dev-${dev.Id}`} class="text-md flex flex-row items-center gap-2 p-2">
								<Checkbox
									checked={false}
									name="developers"
									id={`dev-${dev.Id}`}
									onchange={(e) => {
										setSearchParam('developers', dev.Id);
									}}
								/>
								{dev.Name}
							</label>
						{/each}
					</fieldset>
				{:else}
					<p>No devs to show</p>
				{/if}
			</FilterDropdown>
		</SidebarBody>
	</Sidebar>
{/if}
