// GIP EEE Attendance — Service Worker
const CACHE = 'gip-eee-v1';
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-shard1',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_tiny_model-shard1',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_tiny_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-shard1',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-shard2',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache what we can, skip failures silently
      return Promise.allSettled(OFFLINE_ASSETS.map(url => cache.add(url).catch(() => {})));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
