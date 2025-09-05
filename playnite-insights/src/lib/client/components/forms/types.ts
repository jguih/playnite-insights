import type { HTMLInputAttributes, HTMLSelectAttributes } from 'svelte/elements';
import type { SemanticColors } from '../types';

export type BaseInputProps = { value?: string | number | null } & HTMLInputAttributes;
export type BaseCheckboxProps = { checked: boolean; color?: SemanticColors } & BaseInputProps;
export type BaseSelectProps = { value?: string | number | null } & Omit<
	HTMLSelectAttributes,
	'value'
>;
