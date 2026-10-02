/* =====================================================
   Finora — Frontend → backend API helpers

   All calls go through `request()`, which:
     • Attaches the bearer token
     • Sets JSON headers
     • Times out after 15s
     • Rethrows errors with .status / .data attached
     • Emits `finora:unauthorized` on 401 (optional logout hook)

   The base URL comes from `VITE_API_BASE` when available,
   and falls back to localhost for local dev.
   ===================================================== */

const API_BASE =
  import.meta.env?.VITE_API_BASE || 'http://localhost:4000';

const TOKEN_KEY = 'finora.token';
const REQUEST_TIMEOUT_MS = 15000;

/* ---------- Token helpers ---------- */

// Read the token from either storage (localStorage wins).
export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    ''
  );
}

// Store the token. When `remember` is true → localStorage
// (persists across browser restarts). When false → sessionStorage
// (cleared when the tab closes). Existing token is always removed
// from the other storage so the two never disagree.
export function setToken(token, remember = true) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  if (!token) return;

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/* ---------- Core request ---------- */

async function request(method, path, body) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // Timeout guard — fetch() has no built-in timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const timeoutErr = new Error(
        'The request took too long. Please try again.'
      );
      timeoutErr.status = 0;
      throw timeoutErr;
    }

    const networkErr = new Error(
      'Could not reach the server. Please check your connection.'
    );
    networkErr.status = 0;
    throw networkErr;
  }
  clearTimeout(timeoutId);

  // Parse body — gracefully handle empty / non-JSON responses
  let data = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. HTML 500 page). Fall back to statusText.
    data = {};
  }

  if (!res.ok) {
    // Log the raw response in dev so debugging is easier
    if (import.meta.env?.DEV && !data.error) {
      console.warn(
        `[api] ${method} ${path} → ${res.status} ${res.statusText}`
      );
    }

    // 401 → token is invalid/expired. Clear it and let the app react.
    if (res.status === 401) {
      clearToken();
      try {
        window.dispatchEvent(new Event('finora:unauthorized'));
      } catch {
        // Non-browser env — ignore
      }
    }

    const err = new Error(
      data.error || res.statusText || 'Something went wrong.'
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ---------- Auth ---------- */

export function registerUser({ name, email, password }) {
  return request('POST', '/api/auth/register', {
    name,
    email,
    password,
  });
}

export function loginUser({ email, password }) {
  return request('POST', '/api/auth/login', { email, password });
}

export function getMe() {
  return request('GET', '/api/auth/me');
}

export function updateProfile({ name, email, phone, photo }) {
  return request('PUT', '/api/auth/profile', {
    name,
    email,
    phone,
    photo,
  });
}

export function updatePassword({ currentPassword, newPassword }) {
  return request('PUT', '/api/auth/password', {
    currentPassword,
    newPassword,
  });
}

/* ---------- Records ---------- */

export function listRecords(kind) {
  return request('GET', `/api/records/${kind}`);
}

export function createRecord(kind, data) {
  return request('POST', `/api/records/${kind}`, data);
}

export function updateRecord(kind, id, data) {
  return request('PUT', `/api/records/${kind}/${id}`, data);
}

export function deleteRecord(kind, id) {
  return request('DELETE', `/api/records/${kind}/${id}`);
}

/* ---------- Password reset ---------- */

export function sendResetEmail(email) {
  return request('POST', '/api/send-reset', { email });
}

export function resetPassword(token, newPassword) {
  return request('POST', '/api/reset-password', {
    token,
    newPassword,
  });
}

/* ---------- Admin ---------- */

export function adminListUsers() {
  return request('GET', '/api/admin/users');
}

export function adminDeleteUser(id) {
  return request('DELETE', `/api/admin/users/${id}`);
}

export function adminPromoteUser(id) {
  return request('PUT', `/api/admin/users/${id}/promote`);
}

export function adminDemoteUser(id) {
  return request('PUT', `/api/admin/users/${id}/demote`);
}

/* ---------- Notifications ---------- */

export function listNotifications() {
  return request('GET', '/api/notifications');
}

export function markNotificationRead(id) {
  return request('PUT', `/api/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return request('PUT', '/api/notifications/read-all');
}

export function deleteNotification(id) {
  return request('DELETE', `/api/notifications/${id}`);
}

export function clearNotifications() {
  return request('DELETE', '/api/notifications');
}