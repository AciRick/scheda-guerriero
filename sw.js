/* Uso offline: tiene una copia dell'app, delle librerie e dei font.
   Mostra subito la copia salvata e intanto scarica la versione nuova (che vedi alla prossima apertura).
   Le chiamate al database non passano di qui: le gestisce Firebase, che funziona anche offline. */
const CACHE='sg-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
const cacheable=u=>u.origin===location.origin||u.hostname==='www.gstatic.com'||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(!cacheable(u))return;
  if(u.origin===location.origin&&u.pathname.includes('/__/'))return; /* pagine di accesso di Firebase */
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const res=await net;return res||(r.mode==='navigate'?c.match('index.html'):Response.error());
  }));
});
