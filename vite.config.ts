import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	server: {
		port: 3000,
		allowedHosts: true
	},
	test: {
		reporters: ['default', ['json', { outputFile: 'test-results/vitest-results.json' }]],
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/e2e/**', 'src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'api integration',
					include: ['tests/integration/api/**/*.test.ts'],
					environment: 'node',
					setupFiles: ['tests/integration/api/setup.ts'] // optional
				}
			}
		]
	}
});
