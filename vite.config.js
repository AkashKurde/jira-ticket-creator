import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { API_PORT } from "./src/config/constants.js";

/** Dev: `/api` → Express (`server/index.js`). Port from `src/config/constants.js` (`API_PORT`). */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
