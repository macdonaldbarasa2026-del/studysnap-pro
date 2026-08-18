import { auth } from "../lib/firebase";

/**
 * fetch() wrapper that attaches the current Firebase user's ID token as a
 * Bearer Authorization header. Required for all /api/gemini/* calls now
 * that the server verifies identity instead of only rate-limiting by IP.
 */
export async function authedFetch(input: string, init: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You need to be signed in to use AI features.");
  }
  const token = await user.getIdToken();
  const headers = {
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return fetch(input, { ...init, headers });
}
