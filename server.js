import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

function isLocalHost(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return true;
  if (h.startsWith('10.') || h.startsWith('192.168.') || h.startsWith('172.')) return true;
  return false;
}

app.get('/api/fetch', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) {
      return res.status(400).json({ error: 'invalid protocol' });
    }
    if (isLocalHost(u.hostname)) {
      return res.status(400).json({ error: 'local addresses are not allowed' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    // Log the outgoing fetch for debugging (console + file)
    const logLine = `[proxy] fetching URL: ${url}\n`;
    console.log(logLine.trim());
    try { fs.appendFileSync('proxy.log', logLine); } catch(e){}

    // Use node-fetch for server-side fetching; include a User-Agent
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) fetch-proxy/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    const r = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(timeout);

    if (!r.ok) {
      const bodyText = await r.text().catch(() => '');
      const errLine = `[proxy] upstream error ${r.status} - ${bodyText.slice(0,200)}\n`;
      console.error(errLine.trim());
      try { fs.appendFileSync('proxy.log', errLine); } catch(e){}
      return res.status(502).json({ error: `upstream responded ${r.status}`, body: bodyText.slice(0, 200) });
    }

    const text = await r.text();
    const max = 200_000; // 200 KB
    const out = text.length > max ? text.slice(0, max) + '\n<!-- truncated -->' : text;

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(out);
  } catch (err) {
    const errLine = `[proxy] ERROR ${String(err && err.stack ? err.stack : err)}\n`;
    console.error(errLine);
    try { fs.appendFileSync('proxy.log', errLine); } catch(e){}
    if (err.name === 'AbortError') return res.status(504).json({ error: 'timeout' });
    // Unexpected -> return 500 with message
    res.status(500).json({ error: 'fetch failed', message: String(err.message || err) });
  }
});

// Express error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ error: 'internal_server_error', message: String(err && err.message ? err.message : err) });
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
