// See https://svelte.dev/docs/kit/types#app.d.ts

import type { ServerServices } from '$lib/server/setup-services';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			services: ServerServices;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
