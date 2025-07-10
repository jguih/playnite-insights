<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { Search, XIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type {
		ChangeEventHandler,
		EventHandler,
		FocusEventHandler,
		HTMLInputAttributes
	} from 'svelte/elements';

	let { ...props }: HTMLInputAttributes = $props();
	let input: HTMLInputElement;
	let value: string | null = $derived(page.url.searchParams.get('query'));
	let clearBtn: HTMLButtonElement;
	let timeout: NodeJS.Timeout | null = $state(null);

	const pushValue = (value: string | null) => {
		const params = new URLSearchParams(page.url.searchParams);
		if (!value) {
			params.delete('query');
		} else {
			params.set('page', '1');
			params.set('query', value);
		}
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		goto(newUrl, { replaceState: true, keepFocus: true });
	};

	const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		const value = e.currentTarget.value;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			pushValue(value);
		}, 1000);
	};

	const handleOnBlur: FocusEventHandler<HTMLInputElement> = () => {
		if (timeout) {
			clearTimeout(timeout);
		}
		pushValue(input.value);
	};

	const handleSubmit: EventHandler<SubmitEvent> = (e) => {
		e.preventDefault();
		if (timeout) {
			clearTimeout(timeout);
		}
		pushValue(input.value);
		input.blur();
	};

	const handleOnClear: EventHandler<MouseEvent> = (e) => {
		pushValue(null);
		clearBtn?.blur();
	};
</script>

<form
	class={`bg-background-2 hover:border-primary-500 focus-within:border-primary-700 active-within:border-primary-700 flex flex-row items-center justify-center gap-2 border-2 border-solid border-transparent p-1`}
	onsubmit={handleSubmit}
>
	<Search class="aspect-square shrink-0 opacity-80" size="20" />
	<input
		{...props}
		class={`bg-background-2 m-0 w-full p-0 outline-0 ${props.class ?? ''}`}
		bind:this={input}
		bind:value
		oninput={handleOnChange}
		placeholder={m.home_search_bar_placeholder()}
		onblur={handleOnBlur}
	/>
	<button bind:this={clearBtn} class="m-0 p-0" onclick={handleOnClear} type="button">
		<XIcon class="aspect-square shrink-0 opacity-80" size="20" />
	</button>
</form>
