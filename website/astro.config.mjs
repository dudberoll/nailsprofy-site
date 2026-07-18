// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// The production site is fully static and is emitted to website/dist.
export default defineConfig({
	integrations: [react()],
});
