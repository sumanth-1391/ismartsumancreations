const http = require('http');

function post(path) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: 5001, path, method: 'POST', headers: { 'Content-Type': 'application/json' } };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const r = await post('/__backfill-thumbnails');
    console.log('Status:', r.status);
    console.log('Body:', r.body);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
