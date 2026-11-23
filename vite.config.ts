import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react';

export default defineConfig({
	server: {
		proxy: {
			"/api/v1": {
				target: "http://localhost:5000",
				changeOrigin: true,
				secure: false,
			},
			"/socket.io": {
				target: "http://localhost:5000",
				changeOrigin: true,
				ws: true,
			},
		},
	},
	plugins: [
		tailwindcss(),
		tsconfigPaths(),
		react()
	]
});