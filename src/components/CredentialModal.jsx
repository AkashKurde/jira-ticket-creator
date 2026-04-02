import { useCallback, useEffect, useState } from "react";

/**
 * Blocking credential gate: when `blocking` is true, user cannot dismiss without saving valid values.
 * When `blocking` is false (e.g. "Update credentials"), ESC, backdrop, and close button work.
 */
export default function CredentialModal({
  open,
  blocking,
  initialUserName = "",
  initialPat = "",
  onSave,
  onClose,
}) {
  const [userName, setUserName] = useState(initialUserName);
  const [pat, setPat] = useState(initialPat);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUserName(initialUserName);
      setPat(initialPat);
      setError("");
    }
  }, [open, initialUserName, initialPat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const u = userName.trim();
    const p = pat.trim();
    if (!u || !p) {
      setError("Username and PAT are both required.");
      return;
    }
    setError("");
    onSave(u, p);
  };

  const handleBackdropMouseDown = (e) => {
    if (blocking) return;
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        if (blocking) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          onClose?.();
        }
      }
    },
    [open, blocking, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
      aria-modal="true"
      aria-labelledby="credential-modal-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="credential-modal-title" className="text-lg font-semibold text-slate-900">
              Jira credentials
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {blocking
                ? "Enter your Jira username"
                : "Update your saved credentials."}
            </p>
          </div>
          {!blocking && (
            <button
              type="button"
              onClick={() => onClose?.()}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cred-username" className="mb-1 block text-sm font-medium text-slate-700">
              Username / email
            </label>
            <input
              id="cred-username"
              type="text"
              autoComplete="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="cred-pat" className="mb-1 block text-sm font-medium text-slate-700">
              PAT / API token
            </label>
            <input
              id="cred-pat"
              type="password"
              autoComplete="current-password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="••••••••••••"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save credentials
          </button>
        </form>
      </div>
    </div>
  );
}
