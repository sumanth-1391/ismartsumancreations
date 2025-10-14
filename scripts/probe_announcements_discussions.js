const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 5001, path, agent: false }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const ann = await get('/api/announcements');
    console.log('/api/announcements', ann.status, ann.body);
    const dis = await get('/api/discussions');
    console.log('/api/discussions', dis.status, dis.body);
  } catch (err) {
    console.error('Probe failed:', err.message);
    process.exit(1);
  }
})();
