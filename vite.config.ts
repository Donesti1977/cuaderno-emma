import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Rutas relativas: funciona igual en local, en GitHub Pages con subcarpeta
  // y si algún día se mueve a un dominio propio.
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "iconos/apple-touch-icon.png"],
      manifest: {
        name: "El cuaderno de Emma",
        short_name: "Cuaderno",
        description:
          "Un cuaderno tranquilo para estudiar 3º de Primaria: misiones cortas, ejercicios y progreso.",
        lang: "es",
        theme_color: "#faf4e6",
        background_color: "#d7e3da",
        display: "standalone",
        orientation: "any",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "iconos/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "iconos/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "iconos/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
      },
    }),
  ],
  server: {
    host: true,
  },
});
