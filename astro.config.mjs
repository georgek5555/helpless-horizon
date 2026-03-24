// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL ?? 'https://www.134.network';

export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
