<script lang="ts">
	import { XIcon } from '@lucide/svelte';
	import LightButton from '../buttons/LightButton.svelte';
	import Backdrop from '../sidebar/Backdrop.svelte';
	import Sidebar from '../sidebar/Sidebar.svelte';
	import SidebarBody from '../sidebar/SidebarBody.svelte';
	import SidebarHeader from '../sidebar/SidebarHeader.svelte';
	import { filtersState } from './store.svelte';
	import Divider from '../Divider.svelte';
	import Select from '../forms/Select.svelte';
	import type { Snippet } from 'svelte';
	import Checkbox from '../forms/Checkbox.svelte';
	import type { HomePageSearchParamKeys } from '@playnite-insights/lib/client/home-page';
	import type { GameSortBy, GameSortOrder } from '@playnite-insights/lib/client/playnite-game';
	import FilterDropdown from './FilterDropdown.svelte';
	import SearchBar from '../SearchBar.svelte';
	import FilterCheckboxFieldset from './FilterCheckboxFieldset.svelte';
	import FilterCheckboxLabel from './FilterCheckboxLabel.svelte';
	import { m } from '$lib/paraglide/messages';
	import { companySignal, genreSignal, platformSignal } from '$lib/client/app-state/AppData.svelte';

	const {
		setSearchParam,
		appendSearchParam,
		removeSearchParam,
		installedParam,
		notInstalledParam,
		sortOrderParam,
		sortByParam,
		developersParam,
		publishersParam,
		genresParam,
		platformsParam,
		renderSortOrderOptions,
		renderSortByOptions,
		onClearAllFilters,
	}: {
		setSearchParam: (key: HomePageSearchParamKeys, value: string | boolean) => void;
		appendSearchParam: (key: HomePageSearchParamKeys, value: string) => void;
		removeSearchParam: (key: HomePageSearchParamKeys, value?: string | null) => void;
		installedParam: boolean;
		notInstalledParam: boolean;
		sortOrderParam: GameSortOrder;
		sortByParam: GameSortBy;
		developersParam: string[];
		publishersParam: string[];
		genresParam: string[];
		platformsParam: string[];
		renderSortOrderOptions: Snippet;
		renderSortByOptions: Snippet;
		onClearAllFilters: () => void;
	} = $props();

	const MAX_RENDER_OPTIONS = 30;

	const companyList = $derived(companySignal.raw);
	const platformList = $derived(platformSignal.raw);
	const genreList = $derived(genreSignal.raw);

	let developerSearchFilter: string | null = $state(null);
	let developerListFiltered = $derived.by(() => {
		if (!companyList) return companyList;
		let items = [...companyList];
		if (developerSearchFilter) {
			items = items.filter((c) =>
				c.Name.toLowerCase().includes((developerSearchFilter as string).toLowerCase()),
			);
		}
		return items.slice(0, Math.min(MAX_RENDER_OPTIONS, companyList.length));
	});

	let publisherSearchFilter: string | null = $state(null);
	let publisherListFiltered = $derived.by(() => {
		if (!companyList) return companyList;
		let items = [...companyList];
		if (publisherSearchFilter) {
			items = items.filter((c) =>
				c.Name.toLowerCase().includes((publisherSearchFilter as string).toLowerCase()),
			);
		}
		return items.slice(0, Math.min(MAX_RENDER_OPTIONS, companyList.length));
	});

	let platformSearchFilter: string | null = $state(null);
	let platformListFiltered = $derived.by(() => {
		if (!platformList) return platformList;
		let items = [...platformList];
		if (platformSearchFilter) {
			items = items.filter((p) =>
				p.Name.toLowerCase().includes((platformSearchFilter as string).toLowerCase()),
			);
		}
		return items.slice(0, Math.min(MAX_RENDER_OPTIONS, platformList.length));
	});

	let genreSearchFilter: string | null = $state(null);
	let genreListFiltered = $derived.by(() => {
		if (!genreList) return genreList;
		let items = [...genreList];
		if (genreSearchFilter) {
			items = items.filter((p) =>
				p.Name.toLowerCase().includes((genreSearchFilter as string).toLowerCase()),
			);
		}
		return items.splice(0, Math.min(MAX_RENDER_OPTIONS, genreList.length));
	});

	const handleOnChange = (
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		key: HomePageSearchParamKeys,
		value: string,
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
			<LightButton
				class={['opacity-80']}
				color="neutral"
				onclick={() => (filtersState.show = !filtersState.show)}
			>
				<XIcon />
			</LightButton>
		</SidebarHeader>
		<SidebarBody>
			<div class="flex flex-col gap-2">
				<label
					for="sort-order"
					class="text-md"
				>
					{m.label_sort_order()}
					<Select
						id="sort-order"
						class={['bg-background-2! mt-1 w-full']}
						value={sortOrderParam}
						onchange={(e) => setSearchParam('sortOrder', e.currentTarget.value)}
					>
						{@render renderSortOrderOptions()}
					</Select>
				</label>
				<label
					for="sort-by"
					class="text-md"
				>
					{m.label_sort_by()}
					<Select
						id="sort-by"
						class={['bg-background-2! mt-1 w-full']}
						value={sortByParam}
						onchange={(e) => setSearchParam('sortBy', e.currentTarget.value)}
					>
						{@render renderSortByOptions()}
					</Select>
				</label>
			</div>
			<Divider class={['border-1 my-2']} />
			<LightButton
				color="primary"
				selected
				onclick={onClearAllFilters}>{m.clear_all_filters()}</LightButton
			>
			<fieldset class="bg-background-2 mt-2 flex flex-col justify-center">
				<label
					for="installed"
					class="text-md flex flex-row items-center gap-2 p-2"
				>
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
				<label
					for="not_installed"
					class="text-md flex flex-row items-center gap-2 p-2"
				>
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
			<Divider class={['border-1 my-2']} />
			<FilterDropdown
				label={m.label_filter_genres()}
				counter={genresParam.length}
				onClear={() => removeSearchParam('genre')}
			>
				<SearchBar
					value={genreSearchFilter}
					onChange={(v) => (genreSearchFilter = v)}
					delay={0}
				/>
				{#if genreListFiltered && genreListFiltered.length > 0}
					{#key genreSearchFilter}
						<FilterCheckboxFieldset>
							{#each genreListFiltered as genre}
								<FilterCheckboxLabel for={`genre-${genre.Id}`}>
									<Checkbox
										checked={genresParam.includes(genre.Id)}
										name="genres"
										id={`genre-${genre.Id}`}
										onchange={(e) => handleOnChange(e, 'genre', genre.Id)}
									/>
									{genre.Name}
								</FilterCheckboxLabel>
							{/each}
						</FilterCheckboxFieldset>
					{/key}
				{:else}
					<p class="mt-2 text-center">{m.no_genres_found()}</p>
				{/if}
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown
				label={m.label_filter_platforms()}
				counter={platformsParam.length}
				onClear={() => removeSearchParam('platform')}
			>
				<SearchBar
					value={platformSearchFilter}
					onChange={(v) => (platformSearchFilter = v)}
					delay={0}
				/>
				{#if platformListFiltered && platformListFiltered.length > 0}
					{#key platformSearchFilter}
						<FilterCheckboxFieldset>
							{#each platformListFiltered as platform}
								<FilterCheckboxLabel for={`platform-${platform.Id}`}>
									<Checkbox
										checked={platformsParam.includes(platform.Id)}
										name="platforms"
										id={`platform-${platform.Id}`}
										onchange={(e) => handleOnChange(e, 'platform', platform.Id)}
									/>
									{platform.Name}
								</FilterCheckboxLabel>
							{/each}
						</FilterCheckboxFieldset>
					{/key}
				{:else}
					<p class="mt-2 text-center">{m.no_platforms_found()}</p>
				{/if}
			</FilterDropdown>
			<hr class="border-background-1" />
			<FilterDropdown
				label={m.label_filter_publishers()}
				counter={publishersParam.length}
				onClear={() => removeSearchParam('publisher')}
			>
				<SearchBar
					value={publisherSearchFilter}
					onChange={(v) => (publisherSearchFilter = v)}
					delay={0}
				/>
				{#if publisherListFiltered && publisherListFiltered.length > 0}
					{#key publisherSearchFilter}
						<FilterCheckboxFieldset>
							{#each publisherListFiltered as publisher}
								<FilterCheckboxLabel for={`publisher-${publisher.Id}`}>
									<Checkbox
										checked={publishersParam.includes(publisher.Id)}
										name="publishers"
										id={`publisher-${publisher.Id}`}
										onchange={(e) => handleOnChange(e, 'publisher', publisher.Id)}
									/>
									{publisher.Name}
								</FilterCheckboxLabel>
							{/each}
						</FilterCheckboxFieldset>
					{/key}
				{:else}
					<p class="mt-2 text-center">{m.no_publishers_found()}</p>
				{/if}
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
					{#key developerSearchFilter}
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
					{/key}
				{:else}
					<p class="mt-2 text-center">{m.no_developers_found()}</p>
				{/if}
			</FilterDropdown>
		</SidebarBody>
	</Sidebar>
{/if}
