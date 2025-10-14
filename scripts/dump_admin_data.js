import http from 'http';
import { request as rq } from 'http';

const fetchJson = (path) => new Promise((resolve, reject) => {
  const opts = { hostname: '127.0.0.1', port: 5001, path, method: 'GET' };
  const req = http.request(opts, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try { resolve(JSON.parse(d)); } catch (e) { resolve(d); }
    });
  });
  req.on('error', err => reject(err));
  req.end();
});

(async () => {
  try {
    const videos = await fetchJson('/api/videos');
    const announcements = await fetchJson('/api/announcements');
    const discussions = await fetchJson('/api/discussions');
    const combined = { videos, announcements, discussions };
    console.log(JSON.stringify(combined, null, 2));
  } catch (e) {
    console.error('ERROR', e.message || e);
  }
})();
