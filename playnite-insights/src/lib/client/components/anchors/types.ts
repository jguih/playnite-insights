import type { HTMLAnchorAttributes } from 'svelte/elements';

export type BaseAnchorProps = HTMLAnchorAttributes;
export type LightAnchorProps = BaseAnchorProps & { selected?: boolean };
