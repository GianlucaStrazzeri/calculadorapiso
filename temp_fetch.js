(async ()=>{
  try {
    const url = 'http://localhost:5174/api/fetch?url=https://equumfisioterapia.com/';
    console.log('[test] requesting', url);
    const r = await fetch(url);
    console.log('[test] STATUS', r.status);
    const ct = r.headers.get('content-type');
    console.log('[test] content-type', ct);
    const t = await r.text();
    console.log('[test] body-start:\n', t.slice(0,1200));
  } catch (e) {
    console.error('[test] ERROR', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
