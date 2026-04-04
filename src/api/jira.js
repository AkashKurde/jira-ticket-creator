import axios from "axios";
import { API_BASE_URL } from "../config/constants";

function apiBaseUrl() {
  return API_BASE_URL.replace(/\/$/, "");
}

function createIssueUrl() {
  const path = "/api/jira/issue";
  const base = apiBaseUrl();
  return base ? `${base}${path}` : path;
}

/**
 * Creates a Jira issue via this app’s Express backend (avoids browser CORS to Jira).
 * @returns {Promise<{ key: string, id: string, self: string }>}
 */
export async function createIssue({ userName, pat, title, description, dueDate }) {
  const url = createIssueUrl();

  try {
    const { data } = await axios.post(
      url,
      { userName, pat, title, description, dueDate },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data;
      const msg =
        typeof d === "string"
          ? d
          : d.errorMessages?.join("; ") || d.message || `HTTP ${err.response.status}`;
      throw new Error(msg);
    }
    throw err;
  }
}
