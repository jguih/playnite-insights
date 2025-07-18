/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
const GAMES_CACHE = `games-data-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (![CACHE, GAMES_CACHE].includes(key)) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

/**
 * 
 * @param {Request} request 
 * @param {string} cacheName
 */
async function staleWhileRevalidate(request, cacheName) {
	const cache = await caches.open(cacheName);
	const cachedResponse = await cache.match(request);

	// Start revalidation in the background
	const fetchAndUpdate = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
				cache.put(request, networkResponse.clone());
			}
			return networkResponse;
		})
		.catch(() => {
			// Ignore fetch errors
		});

	// Respond with cache if available
	if (cachedResponse) {
		return cachedResponse;
	}

	// Else, wait for the network
	return fetchAndUpdate;
}

/**
 * @param {Request} request 
 */
async function defaultFetchHandler(request) {
	const url = new URL(request.url);
	const cache = await caches.open(CACHE);

	if (ASSETS.includes(url.pathname)) {
		const response = await cache.match(url.pathname);
		if (response) return response;
	}

	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch (err) {
		const fallback = await cache.match(request);
		if (fallback) return fallback;
    
		console.warn(`SW failed to fetch and found no cache for ${event.request.url}`, err);
		return new Response("Network error and no cache available", { status: 503 });
	}
}


self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	if (url.pathname.startsWith('/api/game')) {
		event.respondWith(staleWhileRevalidate(event.request, GAMES_CACHE));
		return;
	}

	event.respondWith(defaultFetchHandler(event.request));
});