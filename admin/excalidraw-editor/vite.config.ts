import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@excalidraw/excalidraw/dist/excalidraw-assets/*",
          dest: "../../../public/assets/dist/excalidraw-assets",
        },
        {
          src: "node_modules/@excalidraw/excalidraw/dist/excalidraw-assets/*",
          dest: "../../../public/assets/excalidraw-assets",
        },
        {
          src: "node_modules/@excalidraw/excalidraw/dist/excalidraw-assets-dev/*",
          dest: "../../../public/assets/excalidraw-assets-dev",
        },
      ],
    }),
  ],
  build: {
    manifest: true,
    rollupOptions: {
      input: ["src/App.tsx", "src/App.css"],
    },
  },
  define: {
    "process.env.IS_PREACT": JSON.stringify("false"),
  },
});
