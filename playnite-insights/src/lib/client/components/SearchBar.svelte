<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { Search, XIcon } from '@lucide/svelte';
	import type {
		ChangeEventHandler,
		EventHandler,
		FocusEventHandler,
		HTMLInputAttributes,
	} from 'svelte/elements';
	import LightButton from './buttons/LightButton.svelte';

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
	class={[
		'hover:border-primary-hover-bg',
		'focus-within:border-primary-active-bg',
		'active-within:border-primary-active-bg',
		'border-2 border-solid border-transparent',
		'bg-background-2 flex w-full grow flex-row items-center justify-center gap-2 p-1',
	]}
	onsubmit={handleSubmit}
>
	<LightButton class="p-0!">
		<Search class="h-5 w-5 opacity-80" />
	</LightButton>
	<input
		{...props}
		class={`bg-background-2 m-0 w-full p-0 outline-0 ${props.class ?? ''}`}
		bind:this={input}
		bind:value
		oninput={handleOnChange}
		placeholder={m.home_search_bar_placeholder()}
		onblur={handleOnBlur}
	/>
	<LightButton
		button={clearBtn}
		onclick={handleOnClear}
		type="button"
		class="p-0!"
	>
		<XIcon class="h-5 w-5 opacity-80" />
	</LightButton>
</form>
