import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Standard config — no Discord detection here (causes circular imports)
const firebaseConfig = {
  apiKey: "AIzaSyBgYGCo-DXGMuPwWEthVzDNdR7fKWcUBJI",
  authDomain: "just-curseur.firebaseapp.com",
  databaseURL: "https://just-curseur-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "just-curseur",
  storageBucket: "just-curseur.firebasestorage.app",
  messagingSenderId: "212044362541",
  appId: "1:212044362541:web:bcc8de2c22d2fea21319a4",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export default app;
