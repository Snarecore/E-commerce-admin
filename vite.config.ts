import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [
		tailwindcss(),
		tsconfigPaths(),
		react()
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('react-quill') || id.includes('quill')) {
							return 'editor-vendor';
						}
						if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
							return 'charts-vendor';
						}
						if (id.includes('react-icons')) {
							return 'icons-vendor';
						}
						if (id.includes('@tanstack/react-query')) {
							return 'query-vendor';
						}
						if (
							id.includes('/react/') ||
							id.includes('/react-dom/') ||
							id.includes('/react-router/') ||
							id.includes('/react-router-dom/')
						) {
							return 'react-core';
						}
					}
				}
			}
		}
	}
});