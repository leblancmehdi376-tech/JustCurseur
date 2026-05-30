import { DiscordSDK } from '@discord/embedded-app-sdk';

// Robust Discord detection — check every possible signal
export const isDiscord = () => {
  try {
    // Signal 1: URL params Discord always injects
    const params = new URLSearchParams(window.location.search);
    if (params.has('frame_id')) return true;
    if (params.has('instance_id')) return true;
    if (params.has('channel_id')) return true;
    if (params.has('guild_id')) return true;

    // Signal 2: hostname
    if (window.location.hostname.includes('discordsays.com')) return true;
    if (window.location.hostname.includes('discord.com')) return true;

    // Signal 3: inside an iframe (cross-origin throws = we're in Discord)
    if (window.self !== window.top) return true;
  } catch {
    // SecurityError thrown when accessing window.top cross-origin = Discord iframe
    return true;
  }
  return false;
};

// Get room code from Discord instance_id (unique per activity launch in a channel)
export const getDiscordRoomCode = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('instance_id') 
    || params.get('channel_id') 
    || params.get('frame_id')
    || params.get('guild_id');
  if (!id) return null;
  return id.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase() || null;
};

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
let _initPromise = null;
let _result = null;

export async function initDiscordSDK() {
  if (!CLIENT_ID) {
    console.warn('[Discord] No CLIENT_ID — skipping SDK auth');
    return null;
  }
  if (_result) return _result;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      const sdk = new DiscordSDK(CLIENT_ID);
      await Promise.race([
        sdk.ready(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SDK timeout')), 5000)),
      ]);

      const { code } = await sdk.commands.authorize({
        client_id: CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: ['identify'],
      });

      const res = await fetch('/api/discord-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) throw new Error(`Token exchange failed ${res.status}`);
      const { access_token } = await res.json();
      const auth = await sdk.commands.authenticate({ access_token });

      _result = { sdk, auth, user: auth.user };
      console.log('[Discord] Auth OK:', auth.user.username);
      return _result;
    } catch (err) {
      console.error('[Discord] SDK failed:', err.message);
      _initPromise = null;
      return null;
    }
  })();

  return _initPromise;
}
