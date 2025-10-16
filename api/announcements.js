import fs from 'fs';
import path from 'path';

const ANNOUNCEMENTS_JSON_PATH = path.join(process.cwd(), 'announcements.json');

function writeJsonFileSafe(filePath, obj) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing file', filePath, err);
    return false;
  }
}

function loadAnnouncements() {
  try {
    if (!fs.existsSync(ANNOUNCEMENTS_JSON_PATH)) {
      return [];
    }
    const content = fs.readFileSync(ANNOUNCEMENTS_JSON_PATH, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.announcements || [];
  } catch (err) {
    console.error('Error loading announcements:', err);
    return [];
  }
}

function saveAnnouncements(announcements) {
  try {
    const data = { announcements };
    return writeJsonFileSafe(ANNOUNCEMENTS_JSON_PATH, data);
  } catch (err) {
    console.error('Error saving announcements:', err);
    return false;
  }
}

export default (req, res) => {
  if (req.method === 'GET') {
    try {
      const announcements = loadAnnouncements();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(announcements));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to read announcements' }));
    }
  } else if (req.method === 'POST') {
    try {
      const announcement = req.body;
      if (!announcement || !announcement.id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: 'Invalid announcement payload' }));
      }
      const announcements = loadAnnouncements();
      announcements.push(announcement);
      if (saveAnnouncements(announcements)) {
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(announcement));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to save announcement' }));
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error creating announcement' }));
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: 'Announcement ID required' }));
      }
      const announcements = loadAnnouncements();
      const before = announcements.length;
      const filtered = announcements.filter(a => String(a.id) !== String(id));
      if (filtered.length === before) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: 'Announcement not found' }));
      }
      if (saveAnnouncements(filtered)) {
        res.end(JSON.stringify({ message: 'Announcement deleted' }));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to delete announcement' }));
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error deleting announcement' }));
    }
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
};
