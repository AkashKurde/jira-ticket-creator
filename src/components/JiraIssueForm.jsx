import { useState } from "react";
import { DUMMY_WATCHERS } from "../config/constants";
import { createIssue } from "../api/jira";
import { getStoredCredentials } from "../utils/storage";

/** YYYY-MM-DD for local calendar date `daysFromToday` days after today */
function dateStringDaysFromNow(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const initialForm = () => ({
  title: "",
  description: "",
  dueDate: dateStringDaysFromNow(3),
  watchers: {},
});

/**
 * Issue creation form: maps fields to Jira REST v3 create issue payload.
 * Watchers are UI-only names; see success panel for how to add watchers via API.
 */
export default function JiraIssueForm({ disabled }) {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const setWatcher = (name, checked) => {
    setForm((f) => ({
      ...f,
      watchers: { ...f.watchers, [name]: checked },
    }));
  };

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Title is required.";
    if (!form.description.trim()) err.description = "Description is required.";
    if (!form.dueDate) err.dueDate = "Due date is required.";
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (!validate()) return;

    const { userName, pat } = getStoredCredentials();
    if (!userName?.trim() || !pat?.trim()) {
      setError("Credentials are missing. Please save credentials first.");
      return;
    }

    setLoading(true);
    try {
      const issue = await createIssue({
        userName,
        pat,
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate,
      });
      const selectedWatchers = DUMMY_WATCHERS.filter((n) => form.watchers[n]);
      setSuccess({ issue, selectedWatchers });
      setForm(initialForm());
      setFieldErrors({});
    } catch (err) {
      setError(err.message || "Failed to create issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto max-w-2xl ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Create Jira issue</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="issue-title" className="mb-1 block text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="issue-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Short summary"
            disabled={disabled}
          />
          {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
        </div>

        <div>
          <label htmlFor="issue-description" className="mb-1 block text-sm font-medium text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="issue-description"
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            placeholder="Details for the issue"
            disabled={disabled}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="issue-duedate" className="mb-1 block text-sm font-medium text-slate-700">
            Due date <span className="text-red-500">*</span>
          </label>
          <input
            id="issue-duedate"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            disabled={disabled}
          />
          {fieldErrors.dueDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.dueDate}</p>}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Watchers</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {DUMMY_WATCHERS.map((name) => (
              <label
                key={name}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={!!form.watchers[name]}
                  onChange={(e) => setWatcher(name, e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-800">{name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            role="status"
          >
            <p className="font-medium">Issue created: {success.issue.key || success.issue.id}</p>
            {success.issue.self && (
              <p className="mt-1 break-all text-emerald-800">
                <a href={success.issue.self} className="underline hover:no-underline" target="_blank" rel="noreferrer">
                  Open API response (self URL)
                </a>
              </p>
            )}
            {success.selectedWatchers.length > 0 && (
              <div className="mt-3 border-t border-emerald-200 pt-3">
                <p className="font-medium text-emerald-900">Watchers (next step via API)</p>
                <p className="mt-1 text-emerald-800">
                  Selected names for reference: {success.selectedWatchers.join(", ")}. To add watchers, use{" "}
                  <code className="rounded bg-emerald-100/80 px-1">POST /rest/api/3/issue/&#123;issueIdOrKey&#125;/watchers</code>{" "}
                  with the watcher&apos;s <strong>account ID</strong> (resolve via{" "}
                  <code className="rounded bg-emerald-100/80 px-1">GET /rest/api/3/user/search</code>).
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={disabled || loading}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create issue"}
        </button>
      </form>
    </div>
  );
}
