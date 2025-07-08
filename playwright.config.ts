import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		headless: true,
		video: 'on',
		screenshot: 'on'
	},
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests/playwright',
	reporter: [
		['list'],
		['junit', { outputFile: 'test-results/playwright-results.xml' }],
		['html', { outputFolder: 'test-results', open: 'never' }]
	]
});
