import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      manifest: {
        name: "Loya",
        short_name: "Loya",
        description: "Gestion locative mobile-first",
        lang: "fr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#fcfcfc",
        theme_color: "#0c2433",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{html,js,css,svg,webmanifest}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/v1(?:\/|$)/],
        runtimeCaching: [],
      },
    }),
  ],
  server: {
    proxy: {
      "/v1": "http://127.0.0.1:8787",
    },
  },
});
