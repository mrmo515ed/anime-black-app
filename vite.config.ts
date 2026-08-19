import { viteSingleFile } from 'vite-plugin-singlefile';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      viteSingleFile(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          short_name: "AnimeBlack",
          name: "Anime Black | أنمي بلاك",
          description: "تطبيق أنمي بلاك - شبكة التواصل الاجتماعي الشاملة للأوتاكو ومتابعي الأنمي والمانجا",
          icons: [
            {
              src: "/icon-192.png",
              type: "image/png",
              sizes: "192x192",
              purpose: "any maskable"
            },
            {
              src: "/icon-512.png",
              type: "image/png",
              sizes: "512x512",
              purpose: "any maskable"
            }
          ],
          start_url: "/",
          background_color: "#0A0A0A",
          theme_color: "#FF3D00",
          display: "standalone",
          orientation: "portrait"
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
          maximumFileSizeToCacheInBytes: 15000000
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Allow the Arena live-preview proxy host (and any *.e2b.app host).
      allowedHosts: true as const,
    },
  };
});
