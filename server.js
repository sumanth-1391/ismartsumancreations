import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 5001; // ← your curl command used 5001

app.use(cors());
app.use(express.json());

// Simple request logger to help debug which routes are being hit
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// Diagnostic route to list registered routes
app.get('/__routes', (req, res) => {
  try {
    const routes = [];
    if (app && app._router && app._router.stack) {
      app._router.stack.forEach(mw => {
        if (mw.route && mw.route.path) {
          const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
          routes.push({ path: mw.route.path, methods });
        }
      });
    }
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: 'Unable to enumerate routes' });
  }
});

// Temporary in-memory discussion data
let discussions = [
  {
    id: 1,
    title: 'Welcome to ISMART SUMAN CREATIONS Discussions!',
    content: 'Feel free to share your thoughts and start a new topic.',
    type: 'text',
    createdAt: new Date(),
  },
];

// In-memory storage for videos and announcements (used by Admin UI)
let videos = [
  // example seeded video (optional)
  // {
  //   id: Date.now().toString(),
  //   title: 'Example Video',
  //   description: 'This is a seeded video.',
  //   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  //   thumbnail: '',
  //   publishedAt: new Date().toISOString(),
  //   viewCount: 0,
  //   likeCount: 0,
  //   duration: 'N/A',
  //   categories: []
  // }
];

let announcements = [];

// ✅ GET discussions
app.get('/api/discussions', (req, res) => {
  res.status(200).json(discussions);
});

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

// Backfill thumbnails for any seeded videos at startup
videos = videos.map(v => ({
  ...v,
  thumbnail: v.thumbnail || buildYouTubeThumbnail(v.url) || '/logo.png',
  createdAt: v.createdAt || new Date().toISOString()
}));

// Admin endpoint: recompute thumbnails for all videos (useful without restart)
app.post('/__backfill-thumbnails', (req, res) => {
  try {
    let updated = 0;
    videos = videos.map(v => {
      const newThumb = buildYouTubeThumbnail(v.url) || '/logo.png';
      const changed = (!v.thumbnail || v.thumbnail !== newThumb);
      if (changed) updated++;
      return {
        ...v,
        thumbnail: newThumb,
        createdAt: v.createdAt || new Date().toISOString()
      };
    });
    res.json({ message: 'Backfilled thumbnails', updated, total: videos.length, videos });
  } catch (err) {
    console.error('Error backfilling thumbnails:', err);
    res.status(500).json({ message: 'Failed to backfill thumbnails' });
  }
});

// -------------------------
// Videos API
// -------------------------

// GET all videos
app.get('/api/videos', (req, res) => {
  res.status(200).json(videos);
});

// POST create new video
app.post('/api/videos', (req, res) => {
  try {
    const video = req.body;
    if (!video || !video.id) {
      return res.status(400).json({ message: 'Invalid video payload' });
    }
    // ensure createdAt and thumbnail
    const created = {
      ...video,
      createdAt: video.createdAt || new Date().toISOString(),
      thumbnail: video.thumbnail || buildYouTubeThumbnail(video.url) || '/logo.png'
    };
    videos.push(created);
    // also optionally create an announcement externally; Admin UI handles that
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating video:', err);
    res.status(500).json({ message: 'Server error creating video' });
  }
});

// PUT update existing video
app.put('/api/videos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = req.body;
    const idx = videos.findIndex(v => String(v.id) === String(id));
    if (idx === -1) return res.status(404).json({ message: 'Video not found' });
    // ensure thumbnail and createdAt are preserved/added
    const merged = {
      ...videos[idx],
      ...updated,
      createdAt: updated.createdAt || videos[idx].createdAt || new Date().toISOString(),
      thumbnail: updated.thumbnail || videos[idx].thumbnail || buildYouTubeThumbnail(updated.url) || '/logo.png'
    };
    videos[idx] = merged;
    res.status(200).json(merged);
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({ message: 'Server error updating video' });
  }
});

// DELETE a video
app.delete('/api/videos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const before = videos.length;
    videos = videos.filter(v => String(v.id) !== String(id));
    if (videos.length === before) return res.status(404).json({ message: 'Video not found' });
    res.status(200).json({ message: 'Video deleted' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ message: 'Server error deleting video' });
  }
});

// -------------------------
// Announcements API
// -------------------------

app.get('/api/announcements', (req, res) => {
  res.status(200).json(announcements);
});

app.post('/api/announcements', (req, res) => {
  try {
    const announcement = req.body;
    if (!announcement || !announcement.id) {
      return res.status(400).json({ message: 'Invalid announcement payload' });
    }
    announcements.push(announcement);
    res.status(201).json(announcement);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ message: 'Server error creating announcement' });
  }
});

app.delete('/api/announcements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const before = announcements.length;
    announcements = announcements.filter(a => String(a.id) !== String(id));
    if (announcements.length === before) return res.status(404).json({ message: 'Announcement not found' });
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ message: 'Server error deleting announcement' });
  }
});

// ✅ POST discussion
app.post('/api/discussions', (req, res) => {
  try {
    const { title, content, type, pollOptions, imageUrl } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newDiscussion = {
      id: discussions.length + 1,
      title,
      content,
      type,
      pollOptions: pollOptions || [],
      imageUrl: imageUrl || null,
      createdAt: new Date(),
    };

    discussions.push(newDiscussion);
    res.status(201).json({
      message: 'Discussion posted successfully',
      newDiscussion,
    });
  } catch (err) {
    console.error('Error posting discussion:', err);
    res.status(500).json({ message: 'Server error posting discussion' });
  }
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
