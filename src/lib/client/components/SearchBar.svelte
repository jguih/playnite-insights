<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Search } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { ChangeEventHandler, HTMLInputAttributes } from 'svelte/elements';

	let { ...props }: HTMLInputAttributes = $props();
	let input: HTMLInputElement;
	let timeout: NodeJS.Timeout | null = $state(null);

	const baseClass = 'bg-background-1 m-0 p-0 outline-0 w-full';
	let fullClass = $derived(`${baseClass} ${props.class ?? ''}`);

	const divBaseClass =
		'bg-background-1 flex flex-row justify-center gap-2 border-2 border-solid border-transparent p-1';
	const divHoverClass = 'hover:border-primary-500';
	const divFocusClass = 'focus-within:border-primary-700 active-within:border-primary-700';
	let divFullClass = $derived(`${divBaseClass} ${divHoverClass} ${divFocusClass}`);

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

<div class={divFullClass}>
	<Search class="aspect-square shrink-0" />
	<input {...props} class={fullClass} bind:this={input} oninput={handleOnChange} />
</div>
