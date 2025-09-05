import type { HTMLAttributes } from 'svelte/elements';

export type SidebarProps = HTMLAttributes<HTMLElement> & {
	width?: number;
};

export type BottomSheetProps = HTMLAttributes<HTMLElement> & { height?: number };
