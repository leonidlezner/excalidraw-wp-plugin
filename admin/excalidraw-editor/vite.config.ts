import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
