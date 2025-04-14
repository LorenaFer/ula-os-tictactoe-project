// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

// This gets called by SvelteKit when the server starts
export const handle: Handle = async ({ event, resolve }) => {
  return await resolve(event);
};