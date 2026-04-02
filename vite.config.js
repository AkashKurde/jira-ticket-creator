import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { JIRA_BASE_URL } from "./src/config/constants.js";

/**
 * Dev-only: `/jira/...` → proxied to `JIRA_BASE_URL` from `src/config/constants.js`.
 * Production builds call `JIRA_BASE_URL` directly from the client (CORS may apply).
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/jira": {
        target: JIRA_BASE_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/jira/, ""),
      },
    },
  },
});
