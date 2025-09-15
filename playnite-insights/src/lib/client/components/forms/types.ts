import type {
	HTMLInputAttributes,
	HTMLSelectAttributes,
	HTMLTextareaAttributes,
} from 'svelte/elements';
import type { SemanticColors } from '../types';

export type BaseInputProps = {
	value?: string | number | null;
	input?: HTMLInputElement | null;
	onMount?: (props: { input?: HTMLInputElement | null }) => void;
} & HTMLInputAttributes;
export type BaseTextareaProps = {
	value?: string | number | null;
	textArea?: HTMLTextAreaElement | null;
	onMount?: (props: { textArea?: HTMLTextAreaElement | null }) => void;
} & Omit<HTMLTextareaAttributes, 'value'>;
export type BaseCheckboxProps = { checked: boolean; color?: SemanticColors } & BaseInputProps;
export type BaseSelectProps = { value?: string | number | null } & Omit<
	HTMLSelectAttributes,
	'value'
>;
