import type { HTMLButtonAttributes } from 'svelte/elements';

export type BaseButtonSize = 'sm' | 'md' | 'lg';
export type BaseButtonProps = HTMLButtonAttributes & {
	size?: BaseButtonSize;
	button?: HTMLButtonElement;
};
