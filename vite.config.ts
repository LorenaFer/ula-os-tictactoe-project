import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './src/lib/server/sockets';

export default defineConfig({
	plugins: [
		tailwindcss(), 
		sveltekit(),
		{
			name: 'socket-io-server',
			configureServer(server) {
				if (server.httpServer) {
					const io = new Server(server.httpServer);
					setupSocketHandlers(io);
					
					console.log('Socket.IO server has been initialized');
				}
			}
		}
	],
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
