// See https://svelte.dev/docs/kit/types#app.d.ts

import type { ServerServices } from '$lib/server/setup-services';
import type { PlayAtlasApi } from '@playatlas/bootstrap/application';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			services: ServerServices;
			api: PlayAtlasApi;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
