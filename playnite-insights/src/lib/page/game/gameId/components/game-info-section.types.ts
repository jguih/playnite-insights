import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type GameInfoSectionProps = HTMLAttributes<HTMLElement> & {
	title: string;
	children?: Snippet;
};
