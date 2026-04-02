import { useCallback, useEffect, useState } from "react";
import CredentialModal from "./components/CredentialModal";
import JiraIssueForm from "./components/JiraIssueForm";
import {
  clearCredentials,
  getStoredCredentials,
  hasCompleteCredentials,
  saveCredentials,
} from "./utils/storage";

export default function App() {
  const [credReady, setCredReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlocking, setModalBlocking] = useState(true);
  const [displayUser, setDisplayUser] = useState("");

  const syncFromStorage = useCallback(() => {
    const ok = hasCompleteCredentials();
    const { userName } = getStoredCredentials();
    setCredReady(ok);
    setDisplayUser(userName?.trim() || "");
    if (!ok) {
      setModalBlocking(true);
      setModalOpen(true);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  const handleSaveCredentials = (userName, pat) => {
    saveCredentials(userName, pat);
    setDisplayUser(userName.trim());
    setCredReady(true);
    setModalOpen(false);
  };

  const handleClearCredentials = () => {
    if (hasCompleteCredentials()) {
      const ok = window.confirm(
        "Remove saved Jira username and token from this browser? You will need to enter them again."
      );
      if (!ok) return;
    }
    clearCredentials();
    setCredReady(false);
    setDisplayUser("");
    setModalBlocking(true);
    setModalOpen(true);
  };

  const handleOpenUpdateCredentials = () => {
    setModalBlocking(false);
    setModalOpen(true);
  };

  const { userName: initialUser, pat: initialPat } = getStoredCredentials();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Jira Issue Creator</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {credReady && (
              <span className="text-slate-600">
                Saved user: <strong className="text-slate-900">{displayUser || "—"}</strong>
              </span>
            )}
            {credReady && (
              <button
                type="button"
                onClick={handleOpenUpdateCredentials}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Update credentials
              </button>
            )}
            <button
              type="button"
              onClick={handleClearCredentials}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-red-800 hover:bg-red-100"
            >
              Clear saved credentials
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <JiraIssueForm disabled={!credReady} />
      </main>

      <CredentialModal
        open={modalOpen}
        blocking={modalBlocking}
        initialUserName={initialUser || ""}
        initialPat={initialPat || ""}
        onSave={handleSaveCredentials}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
