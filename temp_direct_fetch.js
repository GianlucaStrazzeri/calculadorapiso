(async ()=>{
  try {
    const url = 'https://equumfisioterapia.com/';
    console.log('[direct] fetching', url);
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) node-fetch' } });
    console.log('[direct] STATUS', r.status);
    const t = await r.text();
    console.log('[direct] body-start:\n', t.slice(0,800));
  } catch (e) {
    console.error('[direct] ERROR', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
