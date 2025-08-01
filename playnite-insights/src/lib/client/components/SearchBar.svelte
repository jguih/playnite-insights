<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Search, XIcon } from '@lucide/svelte';
	import type {
		ChangeEventHandler,
		EventHandler,
		FocusEventHandler,
		HTMLInputAttributes
	} from 'svelte/elements';
	import SearchBarButton from './buttons/SearchBarButton.svelte';

	let {
		value = $bindable(),
		onChange,
		delay = 1000,
		...props
	}: {
		value: string | null;
		onChange: (value: string | null) => void;
		delay?: number;
	} & Omit<HTMLInputAttributes, 'value'> = $props();
	let input: HTMLInputElement;
	let clearBtn: HTMLButtonElement | undefined = $state();
	let timeout: ReturnType<typeof setTimeout> | null = $state(null);

	const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		const value = e.currentTarget.value;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			onChange(value);
		}, delay);
	};

	const handleOnBlur: FocusEventHandler<HTMLInputElement> = () => {
		if (timeout) {
			clearTimeout(timeout);
		}
		onChange(input.value);
	};

	const handleSubmit: EventHandler<SubmitEvent> = (e) => {
		e.preventDefault();
		if (timeout) {
			clearTimeout(timeout);
		}
		onChange(input.value);
		input.blur();
	};

	const handleOnClear: EventHandler<MouseEvent> = (e) => {
		onChange(null);
		clearBtn?.blur();
	};
</script>

<form
	class={`bg-background-2 hover:border-primary-500 focus-within:border-primary-700 active-within:border-primary-700 flex w-full grow flex-row items-center justify-center gap-2 border-2 border-solid border-transparent p-1`}
	onsubmit={handleSubmit}
>
	<SearchBarButton>
		<Search class="h-5 w-5 opacity-80" />
	</SearchBarButton>
	<input
		{...props}
		class={`bg-background-2 m-0 w-full p-0 outline-0 ${props.class ?? ''}`}
		bind:this={input}
		bind:value
		oninput={handleOnChange}
		placeholder={m.home_search_bar_placeholder()}
		onblur={handleOnBlur}
	/>
	<SearchBarButton button={clearBtn} onclick={handleOnClear} type="button">
		<XIcon class="h-5 w-5 opacity-80" />
	</SearchBarButton>
</form>
