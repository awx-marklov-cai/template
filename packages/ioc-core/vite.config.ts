import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	test: {
		coverage: {
			enabled: true,
			provider: 'v8',
			reporter: ['text', 'html', 'clover', 'json', 'lcov'],
		},
	},
});
