// API base URL for the Memento REST server (see /server).
//
// Defaults to the current hosted test server. Override it in the Expo .env when
// running the API somewhere else:
//   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3001
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://51.79.166.239:3001';

// The public, zero-install memorial website opened by a scanned Legacy QR code.
// By default it is served by the same Express server as the API. For production
// you can point this at an HTTPS domain, for example:
//   EXPO_PUBLIC_WEB_PLAYER_URL=https://memento.example.com/memorial
export const PUBLIC_WEB_BASE_URL = (
  process.env.EXPO_PUBLIC_WEB_PLAYER_URL || `${API_BASE_URL}/memorial`
).replace(/\/+$/, '');

export function memorialPublicUrl(code) {
  return `${PUBLIC_WEB_BASE_URL}/${encodeURIComponent(String(code || '').trim())}`;
}


// Uploaded media is stored in the database as a server-relative path so it
// survives hostname/IP changes. Convert it to an absolute URL for native apps.
export function resolveMediaUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const uploadedPath = raw.match(/\/uploads\/videos\/[^?#]+/i)?.[0];
  if (uploadedPath) return `${API_BASE_URL}${uploadedPath}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${API_BASE_URL}${raw}`;
  return `${API_BASE_URL}/${raw.replace(/^\/+/, '')}`;
}
