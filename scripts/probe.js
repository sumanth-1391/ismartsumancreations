const http = require('http');
const paths = ['/api/discussions','/api/videos','/api/announcements','/'];
paths.forEach(path=>{
  const opts = { hostname: '127.0.0.1', port: 5001, path, method: 'GET', timeout: 3000 };
  const req = http.request(opts, res => {
    console.log(path, 'status', res.statusCode);
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log(path, 'body', d || '<empty>'));
  });
  req.on('error', e => console.log(path, 'ERROR', e.message));
  req.on('timeout', () => { console.log(path, 'TIMEOUT'); req.abort(); });
  req.end();
});
