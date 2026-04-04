import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import axios from "axios";
import {
  API_PORT,
  JIRA_BASE_URL,
  ISSUE_TYPE_NAME,
  PROJECT_KEY,
} from "../src/config/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "512kb" }));

function jiraErrorMessage(data) {
  if (!data || typeof data === "string") return data || "Jira request failed";
  const fromErrors =
    data.errors &&
    Object.entries(data.errors)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
  return (
    data.errorMessages?.join("; ") ||
    data.message ||
    fromErrors ||
    "Jira request failed"
  );
}

/** Health check */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * Proxies Jira create issue — credentials travel only to this server, then to Jira.
 * Body: { userName, pat, title, description, dueDate }
 */
app.post("/api/jira/issue", async (req, res) => {
  const { userName, pat, title, description, dueDate } = req.body || {};

  if (!String(userName || "").trim() || !String(pat || "").trim()) {
    return res.status(400).json({ error: "userName and pat are required" });
  }
  if (!String(title || "").trim() || !String(description || "").trim()) {
    return res.status(400).json({ error: "title and description are required" });
  }
  if (!dueDate) {
    return res.status(400).json({ error: "dueDate is required" });
  }

  const base = JIRA_BASE_URL.replace(/\/$/, "");
  const url = `${base}/rest/api/3/issue`;
  const auth = Buffer.from(`${String(userName).trim()}:${String(pat)}`).toString("base64");

  const body = {
    fields: {
      project: { key: PROJECT_KEY },
      summary: String(title).trim(),
      description: String(description).trim(),
      issuetype: { name: ISSUE_TYPE_NAME },
      duedate: dueDate,
    },
  };

  try {
    const { data } = await axios.post(url, body, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return res.json(data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const msg = jiraErrorMessage(err.response.data);
      return res.status(err.response.status).json({ error: msg });
    }
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

/** Unknown /api/* — avoid sending SPA HTML for bad API paths */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

/** Production UI: Vite build output */
if (!fs.existsSync(distDir)) {
  console.warn(
    `[ticket-app] No dist/ at ${distDir} — run "npm run build" before production, or use dev:client only.`
  );
}
app.use(express.static(distDir));

/** SPA fallback (client-side routes) */
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) next(err);
  });
});

const server = app.listen(API_PORT, () => {
  console.log(
    `Server http://localhost:${API_PORT} — API /api/* + static dist/ (${distDir})`
  );
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[ticket-app] Port ${API_PORT} is already in use. Close the other process (e.g. stop \`npm run dev\` / another \`npm start\`) or set a different API_PORT in src/config/constants.js.\n` +
        `Windows: netstat -ano | findstr :${API_PORT}  then taskkill /PID <pid> /F`
    );
    process.exit(1);
  }
  throw err;
});
