// Service worker: deixa o app funcionar offline.
// Arquivos do app: rede primeiro (pega atualizações), cache como reserva.
// Fontes do Google: cache na primeira visita, para aparecerem offline depois.

const CACHE = 'bateria-v1';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/store.js',
  'js/sticking.js',
  'js/sticking-dsl.js',
  'js/metronome.js',
  'js/audio-context.js',
  'js/voice-command.js',
  'js/rudiment-player.js',
  'js/practice-timer.js',
  'js/merge.js',
  'js/sync-core.js',
  'js/sync.js',
  'js/teacher-core.js',
  'js/teacher.js',
  'js/config.js',
  'js/data/rudiments.js',
  'js/data/plans.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'audio/snare.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Som nunca muda: cache primeiro, rede só se faltar.
  if (url.origin === self.location.origin && url.pathname.includes('/audio/')) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return response;
    })));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('index.html'))),
    );
    return;
  }

  // Fontes e SDK do Supabase (jsdelivr): guardados na primeira visita para funcionar offline.
  // As chamadas à API do Supabase (outro domínio) nunca passam pelo cache.
  if (['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'].includes(url.hostname)) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })),
    );
  }
});
