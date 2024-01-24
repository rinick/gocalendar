import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [react() /*legacy()*/],
  server: {
    hmr: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
