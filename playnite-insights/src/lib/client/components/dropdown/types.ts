import type { Snippet } from 'svelte';
import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';

export type DropdownProps = {
	body?: Snippet;
	button: Snippet<
		[
			{
				/**
				 * Toggles the dropdown body hidden state when called.
				 */
				onclick: MouseEventHandler<HTMLButtonElement>;
				/**
				 * Dropdown body show state. When `true` the body is shown.
				 */
				show: boolean;
			},
		]
	>;
	hideOnClickOutside?: boolean;
} & HTMLAttributes<HTMLDivElement>;
