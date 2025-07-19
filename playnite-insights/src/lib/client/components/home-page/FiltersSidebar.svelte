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
	import SearchBar from '../SearchBar.svelte';
	import type { Developer } from '@playnite-insights/lib/client/developer';
	import FilterCheckboxFieldset from './FilterCheckboxFieldset.svelte';
	import FilterCheckboxLabel from './FilterCheckboxLabel.svelte';

	let {
		setSearchParam,
		appendSearchParam,
		removeSearchParam,
		installedParam,
		notInstalledParam,
		sortOrderParam,
		sortByParam,
		developersParam,
		renderSortOrderOptions,
		renderSortByOptions,
		developerList
	}: {
		setSearchParam: (key: HomePageSearchParamKeys, value: string | boolean) => void;
		appendSearchParam: (key: HomePageSearchParamKeys, value: string) => void;
		removeSearchParam: (key: HomePageSearchParamKeys, value?: string | null) => void;
		installedParam: boolean;
		notInstalledParam: boolean;
		sortOrderParam: GameSortOrder;
		sortByParam: GameSortBy;
		developersParam: string[];
		renderSortOrderOptions: Snippet;
		renderSortByOptions: Snippet;
		developerList?: Developer[];
	} = $props();

	let developerSearchFilter: string | null = $state(null);
	let developerListFiltered = $derived.by(() => {
		if (!developerList) return developerList;
		if (!developerSearchFilter) return developerList;
		return developerList.filter((d) =>
			d.Name.toLowerCase().includes(developerSearchFilter!.toLowerCase())
		);
	});

	const handleOnChange = (
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		key: HomePageSearchParamKeys,
		value: string
	) => {
		if (event.currentTarget.checked) {
			appendSearchParam(key, value);
		} else {
			removeSearchParam(key, value);
		}
	};
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
					value={sortOrderParam}
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
					value={sortByParam}
					onchange={(e) => setSearchParam('sortBy', e.currentTarget.value)}
				>
					{@render renderSortByOptions()}
				</Select>
			</label>
			<Divider class="border-1 my-2" />
			<fieldset class="bg-background-2 flex flex-col justify-center">
				<label for="installed" class="text-md flex flex-row items-center gap-2 p-2">
					<Checkbox
						checked={installedParam}
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
						checked={notInstalledParam}
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
			<FilterDropdown label="Genres" onClear={() => {}}>
				<p>testing</p>
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown label="Platforms" onClear={() => {}}>
				<p>testing</p>
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown label="Publishers" onClear={() => {}}>
				<p>testing</p>
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown
				label={m.label_filter_developers()}
				counter={developersParam.length}
				onClear={() => removeSearchParam('developer')}
			>
				<SearchBar
					value={developerSearchFilter}
					onChange={(v) => (developerSearchFilter = v)}
					delay={0}
				/>
				{#if developerListFiltered && developerListFiltered.length > 0}
					<FilterCheckboxFieldset>
						{#each developerListFiltered as dev}
							<FilterCheckboxLabel for={`dev-${dev.Id}`}>
								<Checkbox
									checked={developersParam.includes(dev.Id)}
									name="developers"
									id={`dev-${dev.Id}`}
									onchange={(e) => handleOnChange(e, 'developer', dev.Id)}
								/>
								{dev.Name}
							</FilterCheckboxLabel>
						{/each}
					</FilterCheckboxFieldset>
				{:else}
					<p class="mt-2 text-center">{m.no_developers_found()}</p>
				{/if}
			</FilterDropdown>
		</SidebarBody>
	</Sidebar>
{/if}
