// Auth helpers — thin wrapper around the backend API.

import {
  registerUser as apiRegister,
  loginUser as apiLogin,
  getMe,
  setToken,
  clearToken,
  getToken,
} from './api';

export { getToken };

export async function registerUser({ name, email, password }) {
  const data = await apiRegister({ name, email, password });
  if (data.token) setToken(data.token);
  return { ok: true, user: data.user };
}

export async function loginUser({ email, password }) {
  const data = await apiLogin({ email, password });
  if (data.token) setToken(data.token);
  return { ok: true, user: data.user };
}

export async function getActiveSession() {
  const token = getToken();
  if (!token) return null;
  try {
    const { user } = await getMe();
    return { userId: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
  } catch {
    clearToken();
    return null;
  }
}

export function startSession(user) {
  // Token is already set by register/login. Nothing to do.
}

export function endSession() {
  clearToken();
}

// Legacy stubs — kept so old imports don't crash
export function getUsers() {
  return [];
}
export function saveUsers() {}
export function getUserByEmail() {
  return null;
}