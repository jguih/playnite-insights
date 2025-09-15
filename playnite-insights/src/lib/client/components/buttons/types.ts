import type { HTMLButtonAttributes } from 'svelte/elements';
import type { SemanticColors } from '../types';

export type BaseButtonProps = HTMLButtonAttributes & {
	button?: HTMLButtonElement;
	justify?: 'center' | 'between' | 'start';
	color?: SemanticColors;
	rounded?: boolean;
	size?: 'sm' | 'md' | 'lg';
};
export type LightButtonProps = BaseButtonProps & { selected?: boolean };
