const express = require('express');
const app = express();

console.log('[INIT] Creating Express app');

app.use((req, res, next) => {
  console.log(`[MIDDLEWARE] ${req.method} ${req.path}`);
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    console.log('[MIDDLEWARE] Sending 204');
    return res.status(204).end();
  }
  next();
});

app.post('/test', (req, res) => {
  res.json({ ok: true });
});

app.listen(3003, () => {
  console.log('[START] Server on 3003');
});
