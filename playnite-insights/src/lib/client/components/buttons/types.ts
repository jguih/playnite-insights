import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ComponentSize, SemanticColors } from '../types';

export type BaseButtonProps = HTMLButtonAttributes & {
	button?: HTMLButtonElement;
	justify?: 'center' | 'between' | 'start';
	color?: SemanticColors;
	rounded?: boolean;
	size?: ComponentSize;
	isLoading?: boolean;
};
export type LightButtonProps = BaseButtonProps & { selected?: boolean };
