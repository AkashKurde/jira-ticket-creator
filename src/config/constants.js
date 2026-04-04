/**
 * Jira connection defaults — used by the Express backend (`server/index.js`) when calling Jira.
 * Base URL: root of your Jira instance (no trailing slash).
 */
export const JIRA_BASE_URL = "https://your-domain.atlassian.net";

/** Express listen port (must match Vite dev proxy in `vite.config.js`). */
export const API_PORT = 3001;

/**
 * Backend API base URL (no trailing slash).
 * Use "" for relative `/api` (dev with Vite proxy, or same-origin reverse proxy in production).
 * Set to a full origin if the SPA is hosted on a different domain than the API.
 */
export const API_BASE_URL = "";

/** Project where new issues will be created */
export const PROJECT_KEY = "PROJ";

/**
 * Issue type name as shown in Jira (e.g. Task, Bug, Story).
 * Must exist in the project’s issue type scheme.
 */
export const ISSUE_TYPE_NAME = "Story";

/** Dummy watcher labels for UI only; real watcher API needs account IDs (see Jira docs). */
export const DUMMY_WATCHERS = ["Aman", "Rahul", "Priya", "Neha", "Vikram"];
