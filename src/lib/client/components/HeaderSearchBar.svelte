<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Search } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { ChangeEventHandler, HTMLInputAttributes } from 'svelte/elements';

	let { ...props }: HTMLInputAttributes = $props();
	let input: HTMLInputElement;
	let timeout: NodeJS.Timeout | null = $state(null);

	const setSearchParams = $derived((key: string, value: string) => {
		const params = new URLSearchParams(page.url.searchParams);
		params.set(key, value);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		goto(newUrl, { replaceState: true, keepFocus: true });
	});

	const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		const value = e.currentTarget.value;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			setSearchParams('query', value);
		}, 1000);
	};

	onMount(() => {
		const query = page.url.searchParams.get('query');
		if (query) {
			input.value = query;
		}
		input.focus();
	});
</script>

<div
	class={`bg-background-2 hover:border-primary-500 focus-within:border-primary-700 active-within:border-primary-700 flex flex-row justify-center gap-2 border-2 border-solid border-transparent p-1`}
>
	<Search class="aspect-square shrink-0" />
	<input
		{...props}
		class={`bg-background-2 m-0 w-full p-0 outline-0 ${props.class ?? ''}`}
		bind:this={input}
		oninput={handleOnChange}
	/>
</div>
