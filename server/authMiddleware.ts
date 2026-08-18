import admin from "firebase-admin";

// Firebase Admin is initialized once, using either explicit service-account
// credentials (GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_*)
// or Application Default Credentials when deployed on Google infrastructure
// (e.g. Cloud Run, App Engine, Google AI Studio's managed hosting).
if (!admin.apps.length) {
  admin.initializeApp();
}

export interface AuthedRequest extends Express.Request {
  uid?: string;
}

/**
 * Express middleware that requires a valid Firebase ID token on the
 * Authorization header ("Bearer <token>"). Previously the /api/gemini/*
 * routes only rate-limited by IP address and never checked who (if anyone)
 * was calling them, so any anonymous client could use paid AI endpoints
 * as long as they stayed under the rate limit. This closes that gap by
 * requiring every caller to be a signed-in Firebase user.
 */
export async function requireAuth(req: any, res: any, next: any) {
  try {
    const header = req.headers.authorization || "";
    const match = /^Bearer (.+)$/.exec(header);
    if (!match) {
      res.status(401).json({ error: "Missing or invalid Authorization header." });
      return;
    }
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}
