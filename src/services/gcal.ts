export async function getGoogleStatus() {
  const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
  const res = await fetch(`${apiBase}google_status.php`);
  if (!res.ok) return { connected: false, channelActive: false };
  return res.json();
}

export function startGoogleOAuth() {
  window.location.href = '/backend/api/google_oauth_redirect.php';
}

export async function startGoogleWatch() {
  const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
  const res = await fetch(`${apiBase}google_calendar_watch.php`, { method: 'POST' });
  return res.ok;
}

export async function syncGoogleNow() {
  const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
  const res = await fetch(`${apiBase}google_calendar_sync.php`, { method: 'POST' });
  return res.ok;
}
