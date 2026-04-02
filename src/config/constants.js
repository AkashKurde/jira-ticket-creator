/**
 * Jira connection defaults — edit here for your site/project.
 * Base URL: root of your Jira instance (no trailing slash).
 * `npm run dev` uses the Vite proxy (`/jira` → this URL); production uses this URL in the client.
 */
export const JIRA_BASE_URL = "https://your-domain.atlassian.net";

/** Project where new issues will be created */
export const PROJECT_KEY = "PROJ";

/**
 * Issue type name as shown in Jira (e.g. Task, Bug, Story).
 * Must exist in the project’s issue type scheme.
 */
export const ISSUE_TYPE_NAME = "Story";

/** Dummy watcher labels for UI only; real watcher API needs account IDs (see Jira docs). */
export const DUMMY_WATCHERS = ["Aman", "Rahul", "Priya", "Neha", "Vikram"];
