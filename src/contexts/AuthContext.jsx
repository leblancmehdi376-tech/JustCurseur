import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import {
  signInAnonymously, signInWithPopup, GoogleAuthProvider,
  onAuthStateChanged, updateProfile,
} from 'firebase/auth';
import { initDiscordSDK, isDiscord, getDiscordRoomCode } from '../discord/sdk';

const AuthContext = createContext(null);

const PLAYER_EMOJIS = ['🦊','🐼','🐸','🦁','🐺','🦄','🐙','🦖','🦅','🐉','🤖','👾','🎭','🧙','🦸','🐯','🦋','🌙'];
const ADJECTIVES = ['Cool','Fast','Epic','Wild','Dark','Neon','Cyber','Hyper'];
const NOUNS = ['Fox','Wolf','Eagle','Dragon','Ninja','Ghost','Titan','Storm'];

function emojiFromStr(str) {
  const hash = String(str).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PLAYER_EMOJIS[hash % PLAYER_EMOJIS.length];
}

function getDiscordAvatarUrl(userId, avatarHash) {
  if (!avatarHash) return null;
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=64`;
}

// Stable random name seeded by uid so it never changes for the same user
function stableNameFromUid(uid) {
  const hash = uid.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const noun = NOUNS[(hash >> 3) % NOUNS.length];
  const num = (hash % 90) + 10;
  return `${adj}${noun}${num}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [identity, setIdentity] = useState(null);
  const [discordReady, setDiscordReady] = useState(false);
  const [discordRoomCode, setDiscordRoomCode] = useState(null);
  const inDiscord = isDiscord();

  useEffect(() => {
    if (!inDiscord) {
      setDiscordReady(true);
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) {
          const saved = localStorage.getItem(`identity_${u.uid}`);
          if (saved) { try { setIdentity(JSON.parse(saved)); } catch {} }
        }
      });
      return unsub;
    }

    const setupDiscordPlayer = async () => {
      const code = getDiscordRoomCode();
      if (code) setDiscordRoomCode(code);

      const result = await initDiscordSDK();

      let uid, name, emoji, avatarUrl;

      if (result?.user) {
        // Real Discord identity
        const dUser = result.user;
        uid = `discord_${dUser.id}`;
        name = dUser.global_name || dUser.username;
        emoji = emojiFromStr(dUser.id);
        avatarUrl = getDiscordAvatarUrl(dUser.id, dUser.avatar);
      } else {
        // FIX: use a stable uid stored in localStorage so name never changes
        const storedUid = localStorage.getItem('discord_stable_uid');
        uid = storedUid || `danon_${Math.random().toString(36).slice(2, 12)}`;
        if (!storedUid) localStorage.setItem('discord_stable_uid', uid);

        name = stableNameFromUid(uid);   // deterministic from uid
        emoji = emojiFromStr(uid);
        avatarUrl = null;
      }

      setUser({ uid, displayName: name });
      setIdentity({ name, emoji, avatarUrl });
      setDiscordReady(true);
    };

    setupDiscordPlayer();
  }, []);

  const signInAsGuest = async (name, emoji) => {
    let u = auth.currentUser;
    if (!u) { const r = await signInAnonymously(auth); u = r.user; }
    await updateProfile(u, { displayName: name });
    const id = { name, emoji, avatarUrl: null };
    setIdentity(id);
    localStorage.setItem(`identity_${u.uid}`, JSON.stringify(id));
    return { uid: u.uid, name, emoji, avatarUrl: null };
  };

  const signInWithGoogle = async (emoji) => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    const name = u.displayName?.split(' ')[0] || 'Joueur';
    const avatarUrl = u.photoURL || null;
    const id = { name, emoji, avatarUrl };
    setIdentity(id);
    localStorage.setItem(`identity_${u.uid}`, JSON.stringify(id));
    return { uid: u.uid, name, emoji, avatarUrl };
  };

  const getPlayer = () => {
    if (!user || !identity) return null;
    return { uid: user.uid, name: identity.name, emoji: identity.emoji, avatarUrl: identity.avatarUrl || null };
  };

  return (
    <AuthContext.Provider value={{
      user, identity, discordReady, discordRoomCode,
      signInAsGuest, signInWithGoogle, getPlayer, setIdentity,
      isDiscordMode: inDiscord,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
