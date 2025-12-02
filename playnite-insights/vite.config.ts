import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
		}),
	],
	server: { port: 3000, allowedHosts: true },
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		expect: { requireAssertions: true },
		globals: true,
		reporters: ['default', ['junit', { outputFile: '../test-results/svelte-app.xml' }]],
		setupFiles: ['./src/vitest.unit-testing.setup.ts'],
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
		],
	},
	build: {
		rollupOptions: {
			external: ['sharp'],
		},
	},
});
