const express = require('express');
const app = express();

// Explicitly set CORS headers on every response
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`  Origin: ${req.headers.origin}`);
  
  if (req.method === 'OPTIONS') {
    console.log('  -> Responding to OPTIONS');
    return res.status(204).end();
  }
  next();
});

app.post('/test', (req, res) => {
  res.json({ ok: true });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Test server on port ${PORT}`);
});
