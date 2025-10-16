import fs from 'fs';
import path from 'path';

const DISCUSSIONS_JSON_PATH = path.join(process.cwd(), 'discussions.json');

function writeJsonFileSafe(filePath, obj) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing file', filePath, err);
    return false;
  }
}

function loadDiscussions() {
  try {
    if (!fs.existsSync(DISCUSSIONS_JSON_PATH)) {
      return [];
    }
    const content = fs.readFileSync(DISCUSSIONS_JSON_PATH, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.discussions || [];
  } catch (err) {
    console.error('Error loading discussions:', err);
    return [];
  }
}

function saveDiscussions(discussions) {
  try {
    const data = { discussions };
    return writeJsonFileSafe(DISCUSSIONS_JSON_PATH, data);
  } catch (err) {
    console.error('Error saving discussions:', err);
    return false;
  }
}

export default (req, res) => {
  if (req.method === 'GET') {
    try {
      const discussions = loadDiscussions();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(discussions));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to read discussions' }));
    }
  } else if (req.method === 'POST') {
    try {
      let title, content, type, pollOptions, imageUrl;

      // Handle multipart/form-data
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        // For multipart, fields are in req.body as strings or files
        title = req.body.title;
        content = req.body.content;
        type = req.body.type;
        pollOptions = req.body.pollOptions;
        imageUrl = req.body.imageUrl; // This might be a file
      } else {
        // Handle JSON
        ({ title, content, type, pollOptions, imageUrl } = req.body);
      }

      if (!title || !content || !type) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: 'Missing required fields' }));
      }

      const discussions = loadDiscussions();
      const newDiscussion = {
        id: discussions.length + 1,
        title,
        content,
        type,
        pollOptions: pollOptions ? (typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions) : [],
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString(),
      };
      discussions.push(newDiscussion);
      if (saveDiscussions(discussions)) {
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(newDiscussion));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to save discussion' }));
      }
    } catch (err) {
      console.error('Error posting discussion:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error posting discussion' }));
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: 'Discussion ID required' }));
      }
      const discussions = loadDiscussions();
      const before = discussions.length;
      const filtered = discussions.filter(d => String(d.id) !== String(id));
      if (filtered.length === before) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: 'Discussion not found' }));
      }
      if (saveDiscussions(filtered)) {
        res.end(JSON.stringify({ message: 'Discussion deleted' }));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to delete discussion' }));
      }
    } catch (err) {
      console.error('Error deleting discussion:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error deleting discussion' }));
    }
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
};
