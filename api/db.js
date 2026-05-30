// Vercel serverless function — Firebase REST API proxy for Discord mode
// Discord blocks direct Firebase WebSocket connections, so we proxy through Vercel

const DB_URL = 'https://just-curseur-default-rtdb.europe-west1.firebasedatabase.app';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  // Sanitize path — only allow rooms/
  const safePath = path.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\//, '');
  if (!safePath.startsWith('rooms')) {
    return res.status(403).json({ error: 'Forbidden path' });
  }

  const firebaseUrl = `${DB_URL}/${safePath}.json`;

  try {
    let body = undefined;
    if (req.method === 'PUT' || req.method === 'PATCH') {
      body = JSON.stringify(req.body);
    }

    const response = await fetch(firebaseUrl, {
      method: req.method === 'DELETE' ? 'DELETE' : req.method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (err) {
    console.error('DB proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
