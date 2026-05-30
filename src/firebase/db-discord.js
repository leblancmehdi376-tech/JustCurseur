// Alternative DB layer for Discord mode using REST API via Vercel proxy
// This avoids the Firebase SDK WebSocket which Discord blocks

const BASE = '/api/db';

export async function discordDbGet(path) {
  const res = await fetch(`${BASE}?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`DB GET failed: ${res.status}`);
  return res.json();
}

export async function discordDbSet(path, data) {
  const res = await fetch(`${BASE}?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`DB SET failed: ${res.status}`);
  return res.json();
}

export async function discordDbUpdate(path, data) {
  const res = await fetch(`${BASE}?path=${encodeURIComponent(path)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`DB UPDATE failed: ${res.status}`);
  return res.json();
}

export async function discordDbDelete(path) {
  const res = await fetch(`${BASE}?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`DB DELETE failed: ${res.status}`);
  return res.json();
}

// Polling-based listener for Discord mode (replaces WebSocket onValue)
const listeners = {};

export function discordDbListen(path, callback) {
  const key = path;
  let active = true;
  let lastValue = undefined;

  const poll = async () => {
    if (!active) return;
    try {
      const data = await discordDbGet(path);
      const str = JSON.stringify(data);
      if (str !== lastValue) {
        lastValue = str;
        callback(data);
      }
    } catch (err) {
      console.error('[DB poll error]', err.message);
    }
    if (active) setTimeout(poll, 800); // poll every 0.8s
  };

  poll();
  return () => { active = false; };
}
