import type { HTMLButtonAttributes } from 'svelte/elements';

export type BaseButtonProps = HTMLButtonAttributes & {
	button?: HTMLButtonElement;
	justify?: 'center' | 'between';
	color?: 'neutral' | 'primary';
};
