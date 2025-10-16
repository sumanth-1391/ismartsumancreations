import fs from 'fs';
import path from 'path';

export default (req, res) => {
  try {
    const file = path.join(process.cwd(), 'announcements.json');
    if (!fs.existsSync(file)) {
      res.statusCode = 404;
      return res.end(JSON.stringify([]));
    }
    const content = fs.readFileSync(file, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.end(content);
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to read announcements' }));
  }
};
