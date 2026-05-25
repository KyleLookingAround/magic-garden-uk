// Backup / restore / share serialisation. Pure string<->state transforms with
// no DOM or network access, so they're easy to unit-test. The document is
// always run back through migrateState on the way in, so partial or older
// payloads are normalised to the canonical v4 shape.
import { migrateState } from './migrate.js';

export const EXPORT_VERSION = 4;
const APP_TAG = 'magic-garden';

/** Wrap the persisted garden document in a versioned, pretty-printed envelope. */
export function serializePlan(state) {
  return JSON.stringify(
    { app: APP_TAG, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), state },
    null,
    2,
  );
}

/** Parse a backup file's text back into a canonical state. Throws on garbage. */
export function parsePlan(text) {
  const parsed = JSON.parse(text);
  // Accept either a bare state document or our `{ app, state }` envelope.
  const doc = parsed && parsed.state && typeof parsed.state === 'object' ? parsed.state : parsed;
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error('Not a garden plan');
  return migrateState(doc);
}

// ── UTF-8-safe base64url, so garden names with emoji or accents survive ──
function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Encode a state into a compact, URL-safe string for a share link's hash. */
export function encodePlanToHash(state) {
  return toBase64Url(JSON.stringify(state));
}

/** Decode a share-link hash value back into a canonical state. Throws on garbage. */
export function decodePlanFromHash(value) {
  const doc = JSON.parse(fromBase64Url(value));
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error('Not a garden plan');
  return migrateState(doc);
}
