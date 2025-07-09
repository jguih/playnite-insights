import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		headless: true,
		video: 'on',
		screenshot: 'on'
	},
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		stdout: 'pipe',
		stderr: 'pipe'
	},
	testDir: 'tests/playwright',
	outputDir: 'playwright-results',
	reporter: [['list'], ['html', { outputFolder: 'playwright-results', open: 'never' }]]
});
