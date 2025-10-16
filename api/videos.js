import fs from 'fs';
import path from 'path';

const DATA_JSON_PATH = path.join(process.cwd(), 'data.json');

// Utility: extract YouTube ID from common URL formats
function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const patterns = [
      /(?:youtube\.com.*(?:\?|&)v=)([^&]+)/i,
      /(?:youtu\.be\/)([^?&]+)/i,
      /vi\/([^\/]+)/i,
      /embed\/([^?&\/]+)/i,
      /v=([^&]+)/i
    ];
    for (const r of patterns) {
      const m = url.match(r);
      if (m && m[1]) return m[1];
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function buildYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function writeJsonFileSafe(filePath, obj) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing file', filePath, err);
    return false;
  }
}

function loadVideos() {
  try {
    if (!fs.existsSync(DATA_JSON_PATH)) {
      return [];
    }
    const content = fs.readFileSync(DATA_JSON_PATH, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.videos || [];
  } catch (err) {
    console.error('Error loading videos:', err);
    return [];
  }
}

function saveVideos(videos) {
  try {
    const data = { videos };
    return writeJsonFileSafe(DATA_JSON_PATH, data);
  } catch (err) {
    console.error('Error saving videos:', err);
    return false;
  }
}

export default (req, res) => {
  if (req.method === 'GET') {
    try {
      const videos = loadVideos();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(videos));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to read videos' }));
    }
  } else if (req.method === 'POST') {
    try {
      const video = req.body;
      if (!video || !video.id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: 'Invalid video payload' }));
      }
      const videos = loadVideos();
      const created = {
        ...video,
        createdAt: video.createdAt || new Date().toISOString(),
        thumbnail: video.thumbnail || buildYouTubeThumbnail(video.url) || '/logo.png'
      };
      videos.push(created);
      if (saveVideos(videos)) {
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(created));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to save video' }));
      }
    } catch (err) {
      console.error('Error creating video:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error creating video' }));
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: 'Video ID required' }));
      }
      const updated = req.body;
      const videos = loadVideos();
      const idx = videos.findIndex(v => String(v.id) === String(id));
      if (idx === -1) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: 'Video not found' }));
      }
      const merged = {
        ...videos[idx],
        ...updated,
        createdAt: updated.createdAt || videos[idx].createdAt || new Date().toISOString(),
        thumbnail: updated.thumbnail || videos[idx].thumbnail || buildYouTubeThumbnail(updated.url) || '/logo.png'
      };
      videos[idx] = merged;
      if (saveVideos(videos)) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(merged));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to update video' }));
      }
    } catch (err) {
      console.error('Error updating video:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error updating video' }));
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: 'Video ID required' }));
      }
      const videos = loadVideos();
      const before = videos.length;
      const filtered = videos.filter(v => String(v.id) !== String(id));
      if (filtered.length === before) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: 'Video not found' }));
      }
      if (saveVideos(filtered)) {
        res.end(JSON.stringify({ message: 'Video deleted' }));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Failed to delete video' }));
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Server error deleting video' }));
    }
  } else {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
};
