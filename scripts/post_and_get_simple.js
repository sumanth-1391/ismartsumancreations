const http = require('http');

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = { hostname: '127.0.0.1', port: 5001, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: '127.0.0.1', port: 5001, path, method: 'GET' };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const id = 'autotest-' + Date.now();
    const payload = {
      id,
      title: 'AUTOTEST Video ' + id,
      description: 'Uploaded by automated test',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      viewCount: 0,
      likeCount: 0,
      duration: 'N/A',
      categories: ['Trending Now']
    };

    console.log('Posting video...', payload.id);
    const post = await postJson('/api/videos', payload);
    console.log('POST status', post.status);

    const get = await getJson('/api/videos');
    console.log('GET status', get.status);
    console.log('Total videos:', Array.isArray(get.body) ? get.body.length : 'n/a');
    const found = Array.isArray(get.body) && get.body.find(v => v.id === payload.id);
    console.log('Found uploaded video?', !!found);
    if(found) console.log('Uploaded video object:', found);
  } catch (e) {
    console.error('ERROR', e);
  }
})();
