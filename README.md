# Jira Issue Creator

A React (Vite) app with a small **Express** backend. The browser calls **`/api`** on your server; the server calls **Jira** (avoids **CORS** from the browser). Credentials stay in `localStorage` on the client and are sent to your backend only when creating an issue.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A Jira Cloud (or compatible) site, **API token** (or PAT where applicable), and a project/issue type that match your configuration

## Quick start

```bash
npm install
npm run dev
```

This runs **Express** and **Vite** together (ports from **`src/config/constants.js`**, default API `3001`, Vite `5173`). Open the Vite URL in the browser.

```bash
npm run dev:client   # Vite only (use if API is already running)
npm run dev:server   # API + static dist/ (build first for a real UI)
npm run build        # production frontend bundle → dist/
npm run preview      # Vite’s preview of dist/ (no Express)
npm start            # production: Express serves dist/ + /api on API_PORT (see below)
```

### Production (single Node process)

1. Set **`src/config/constants.js`** (Jira URL, `API_PORT`, keep **`API_BASE_URL = ""`** when the UI is served from the same host as Express).
2. **`npm ci`** and **`npm run build`** (creates **`dist/`**).
3. **`npm start`** — Express listens on **`http://localhost:<API_PORT>`** (default **3001**), serves **`/api/*`**, and static files from **`dist/`** (plus **`index.html`** for SPA routes).

Put **HTTPS** in front (reverse proxy, load balancer, or tunnel) for real deployments.

## Configuration

### Jira (server-side)

Edit **`src/config/constants.js`** — the Express server imports these when calling Jira:

| Constant | Purpose |
|----------|---------|
| `JIRA_BASE_URL` | Root URL of your Jira instance (no trailing slash) |
| `PROJECT_KEY` | Project key for new issues |
| `ISSUE_TYPE_NAME` | Issue type **name** as in Jira (e.g. `Story`) |
| `API_PORT` | Port for Express; Vite’s dev proxy targets this port |
| `API_BASE_URL` | Backend origin (no trailing slash). Use `""` for relative **`/api`** (dev proxy or same-origin deploy). Set to e.g. `https://api.example.com` if the SPA and API are on different origins |

## Credentials

On first load, a modal asks for:

- **Username** — Jira Cloud: usually your **email**
- **PAT / API token** — your Jira **API token**

Values are stored in `localStorage` as **`userName`** and **`PAT`**. They are sent in the JSON body to **`POST /api/jira/issue`** when you submit the form (not stored on the server).

## Backend API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check |
| POST | `/api/jira/issue` | Body: `{ userName, pat, title, description, dueDate }` — proxies to Jira `POST /rest/api/3/issue` |

## Jira payload (server → Jira)

Same shape as before (plain string `description`, plus `duedate`):

```json
{
  "fields": {
    "project": { "key": "PROJ" },
    "summary": "<title>",
    "description": "<plain string>",
    "issuetype": { "name": "Story" },
    "duedate": "YYYY-MM-DD"
  }
}
```

Watchers in the UI are **demo checkboxes** only.

## Security notes

- Tokens still pass through the browser to **your** API; protect **HTTPS** and consider moving auth to **server-side sessions** for production.
- **`localStorage`** is visible to page scripts (XSS risk); harden the frontend if you expose this app widely.

## Project layout

```
server/
  index.js              # Express: /api/* + static dist/ + SPA fallback
src/
  api/jira.js           # Axios → backend /api/jira/issue
  config/constants.js   # Jira URL, project, API port, API base URL
  ...
```

## Stack

- React 18, Vite 5, Tailwind CSS 3, Axios
- Node.js, Express, cors
