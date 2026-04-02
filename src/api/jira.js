import axios from "axios";
import { JIRA_BASE_URL, ISSUE_TYPE_NAME, PROJECT_KEY } from "../config/constants";

/** In dev, Vite proxies `/jira` → Jira (see `vite.config.js`). In prod, use full `JIRA_BASE_URL`. */
function jiraApiBase() {
  if (import.meta.env.DEV) {
    return "/jira";
  }
  return JIRA_BASE_URL.replace(/\/$/, "");
}

/**
 * Builds Basic auth header: base64(username:token)
 * Jira Cloud typically uses email + API token; Server may use username + PAT.
 */
function authHeader(userName, pat) {
  return `Basic ${btoa(`${userName}:${pat}`)}`;
}

function jsonAuthHeaders(userName, pat) {
  return {
    Authorization: authHeader(userName, pat),
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/** Parses Jira REST error bodies from axios response data. */
function messageFromJiraBody(data) {
  if (!data || typeof data === "string") {
    return data || "";
  }
  const fromErrors =
    data.errors &&
    Object.entries(data.errors)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
  return (
    data.errorMessages?.join("; ") ||
    data.message ||
    fromErrors ||
    ""
  );
}

/**
 * Creates a Jira issue via REST API v3.
 * Payload shape matches:
 * { "fields": { "project": { "key": "PROJ" }, "summary": "...", "description": "...",
 *   "issuetype": { "name": "Story" }, "duedate": "YYYY-MM-DD" } }
 * (`duedate` added for this app’s form; omit if your Jira rejects it.)
 * @returns {Promise<{ key: string, id: string, self: string }>}
 */
export async function createIssue({ userName, pat, title, description, dueDate }) {
  const url = `${jiraApiBase()}/rest/api/3/issue`;

  const body = {
    fields: {
      project: { key: PROJECT_KEY },
      summary: title,
      description,
      issuetype: { name: ISSUE_TYPE_NAME },
      duedate: dueDate,
    },
  };

  try {
    const { data } = await axios.post(url, body, {
      headers: jsonAuthHeaders(userName, pat),
    });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg =
        messageFromJiraBody(err.response.data) ||
        `HTTP ${err.response.status}`;
      throw new Error(msg);
    }
    throw err;
  }
}
