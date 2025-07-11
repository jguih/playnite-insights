import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		headless: true,
		video: 'on',
		screenshot: 'on',
		baseURL: process.env.BASE_URL || 'http://app-test-run:3000'
	},
	testDir: 'tests/playwright',
	outputDir: 'playwright-results',
	reporter: [['list'], ['html', { outputFolder: 'playwright-results', open: 'never' }]]
});
