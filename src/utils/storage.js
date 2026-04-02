/** localStorage keys — must match requirements */
const STORAGE_KEYS = {
  USER_NAME: "userName",
  PAT: "PAT",
};

export function getStoredCredentials() {
  const userName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
  const pat = localStorage.getItem(STORAGE_KEYS.PAT);
  return { userName, pat };
}

export function hasCompleteCredentials() {
  const { userName, pat } = getStoredCredentials();
  return Boolean(userName?.trim() && pat?.trim());
}

/**
 * Persists Jira username and Personal Access Token (or API token on Cloud).
 */
export function saveCredentials(userName, pat) {
  localStorage.setItem(STORAGE_KEYS.USER_NAME, userName.trim());
  localStorage.setItem(STORAGE_KEYS.PAT, pat);
}

export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEYS.USER_NAME);
  localStorage.removeItem(STORAGE_KEYS.PAT);
}
