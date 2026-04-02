# Jira Issue Creator

A small React (Vite) app to create Jira issues from the browser. Credentials are stored in `localStorage`. Jira REST calls use **axios**; there is no backend in this repo.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A Jira Cloud (or compatible) site, **API token** (or PAT where applicable), and a project/issue type that match your configuration

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm run build    # production bundle in dist/
npm run preview  # serve dist/ locally
```

## Configuration

Edit **`src/config/constants.js`**:

| Constant | Purpose |
|----------|---------|
| `JIRA_BASE_URL` | Root URL of your Jira instance (no trailing slash), e.g. `https://yourcompany.atlassian.net` |
| `PROJECT_KEY` | Project key for new issues |
| `ISSUE_TYPE_NAME` | Issue type **name** as in Jira (e.g. `Story`) |

The dev server proxies **`/jira` → `JIRA_BASE_URL`** (see `vite.config.js`) so the browser talks to the same origin during `npm run dev`, which avoids many **CORS** problems. In a **production build**, the client calls `JIRA_BASE_URL` directly; Jira may block cross-origin requests unless you use a reverse proxy or backend.

## Credentials

On first load, a modal asks for:

- **Username** — Jira Cloud: usually your **email**
- **PAT / API token** — your Jira **API token** (or PAT on Data Center)

Values are saved under these `localStorage` keys: **`userName`**, **`PAT`**.

You can **update** or **clear** credentials from the header. Clearing asks for confirmation when credentials were saved.

## API payload

Create issue uses `POST /rest/api/3/issue` with a body like:

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

If your Jira version expects **Atlassian Document Format** for `description`, adjust `src/api/jira.js` accordingly.

Watchers in the UI are **demo checkboxes** only. Adding real watchers requires a separate call (e.g. `POST /rest/api/3/issue/{issueIdOrKey}/watchers`) with Atlassian **account IDs**.

## CORS and security

- **CORS:** Direct browser calls to Jira often fail outside the Vite dev proxy. For production, plan a **proxy** or **backend** that holds secrets and calls Jira server-side.
- **Tokens in the browser:** Storing API tokens in `localStorage` is convenient but **not** ideal for production (XSS risk). Prefer a server-side integration for real deployments.

## Project layout

```
src/
  App.jsx                 # Shell, credential gate, header actions
  main.jsx
  index.css
  api/jira.js             # Axios + create issue
  config/constants.js     # Jira URL, project, issue type, dummy watchers
  components/
    CredentialModal.jsx
    JiraIssueForm.jsx
  utils/storage.js        # localStorage helpers
```

## Stack

- React 18 (hooks, functional components)
- Vite 5
- Tailwind CSS 3
- Axios
