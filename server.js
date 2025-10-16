import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5001; // Use PORT from environment for deployment

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'build')));
}

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

// File paths for JSON files that power the deployed serverless endpoints
const DATA_JSON_PATH = path.join(process.cwd(), 'data.json');
const ANNOUNCEMENTS_JSON_PATH = path.join(process.cwd(), 'announcements.json');
const DISCUSSIONS_JSON_PATH = path.join(process.cwd(), 'discussions.json');

// GitHub commit settings (for commit-on-upload persistence)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'sumanth-1391/ismartsumancreations'; // owner/repo
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

// Load persisted data from disk (if available) so server reflects saved uploads
try {
  if (fs.existsSync(DATA_JSON_PATH)) {
    const raw = fs.readFileSync(DATA_JSON_PATH, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.videos)) {
        videos = parsed.videos.map(v => ({
          ...v,
          thumbnail: v.thumbnail || buildYouTubeThumbnail(v.url) || '/logo.png',
          createdAt: v.createdAt || new Date().toISOString()
        }));
        console.log(`✅ Loaded ${videos.length} videos from ${DATA_JSON_PATH}`);
      } else {
        console.warn(`⚠️ ${DATA_JSON_PATH} parsed but no videos array found`);
      }
    } catch (e) {
      console.error(`Failed to parse ${DATA_JSON_PATH}:`, e.message);
    }
  }
} catch (e) {
  console.error('Error while reading data.json:', e);
}

try {
  if (fs.existsSync(ANNOUNCEMENTS_JSON_PATH)) {
    const raw = fs.readFileSync(ANNOUNCEMENTS_JSON_PATH, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.announcements)) {
        announcements = parsed.announcements;
        console.log(`✅ Loaded ${announcements.length} announcements from ${ANNOUNCEMENTS_JSON_PATH}`);
      } else {
        console.warn(`⚠️ ${ANNOUNCEMENTS_JSON_PATH} parsed but no announcements array found`);
      }
    } catch (e) {
      console.error(`Failed to parse ${ANNOUNCEMENTS_JSON_PATH}:`, e.message);
    }
  }
} catch (e) {
  console.error('Error while reading announcements.json:', e);
}

try {
  if (fs.existsSync(DISCUSSIONS_JSON_PATH)) {
    const raw = fs.readFileSync(DISCUSSIONS_JSON_PATH, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.discussions)) {
        discussions = parsed.discussions;
        console.log(`✅ Loaded ${discussions.length} discussions from ${DISCUSSIONS_JSON_PATH}`);
      } else {
        console.warn(`⚠️ ${DISCUSSIONS_JSON_PATH} parsed but no discussions array found`);
      }
    } catch (e) {
      console.error(`Failed to parse ${DISCUSSIONS_JSON_PATH}:`, e.message);
    }
  }
} catch (e) {
  console.error('Error while reading discussions.json:', e);
}

async function githubGetFileSha(repoPath) {
  if (!GITHUB_TOKEN) return null;
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}?ref=${GITHUB_BRANCH}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'ismart-server' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha;
  } catch (err) {
    console.error('githubGetFileSha error', err);
    return null;
  }
}

async function githubPutFile(repoPath, contentBuffer, message) {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set; skipping GitHub commit');
    return { ok: false, message: 'no-token' };
  }
  const sha = await githubGetFileSha(repoPath);
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}`;
  const body = {
    message,
    content: contentBuffer.toString('base64'),
    branch: GITHUB_BRANCH
  };
  if (sha) body.sha = sha;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'ismart-server',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('GitHub commit failed', data);
      return { ok: false, data };
    }
    return { ok: true, data };
  } catch (err) {
    console.error('githubPutFile error', err);
    return { ok: false, error: err };
  }
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
    console.log('POST /api/videos payload:', video && (video.id ? `id=${video.id}` : JSON.stringify(video).slice(0,200)));
    if (!video || !video.id) {
      console.warn('Invalid video payload received (missing id)');
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
    // Persist to disk and attempt to commit to GitHub so deployed site picks up the change
    try {
      const ok = writeJsonFileSafe(DATA_JSON_PATH, { videos });
      console.log(`writeJsonFileSafe returned ${ok} for ${DATA_JSON_PATH}`);
      // Fire-and-forget GitHub commit
      githubPutFile('data.json', Buffer.from(JSON.stringify({ videos }, null, 2), 'utf8'), `chore: add video ${created.id}`)
        .then(r => { if (!r.ok) console.warn('GitHub commit failed', r); else console.log('GitHub commit ok'); })
        .catch(e => console.warn('GitHub commit threw', e));
    } catch (err) {
      console.warn('Failed to persist videos locally', err);
    }

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
    try {
      writeJsonFileSafe(DATA_JSON_PATH, { videos });
      githubPutFile('data.json', Buffer.from(JSON.stringify({ videos }, null, 2), 'utf8'), `chore: update video ${id}`)
        .then(r => { if (!r.ok) console.warn('GitHub commit failed', r); });
    } catch (err) {
      console.warn('Failed to persist videos locally', err);
    }
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
    try {
      writeJsonFileSafe(DATA_JSON_PATH, { videos });
      githubPutFile('data.json', Buffer.from(JSON.stringify({ videos }, null, 2), 'utf8'), `chore: delete video ${id}`)
        .then(r => { if (!r.ok) console.warn('GitHub commit failed', r); });
    } catch (err) {
      console.warn('Failed to persist videos locally', err);
    }
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
    try {
      writeJsonFileSafe(ANNOUNCEMENTS_JSON_PATH, { announcements });
      githubPutFile('announcements.json', Buffer.from(JSON.stringify({ announcements }, null, 2), 'utf8'), `chore: add announcement ${announcement.id}`)
        .then(r => { if (!r.ok) console.warn('GitHub commit failed', r); });
    } catch (err) {
      console.warn('Failed to persist announcements locally', err);
    }
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
    try {
      writeJsonFileSafe(ANNOUNCEMENTS_JSON_PATH, { announcements });
      githubPutFile('announcements.json', Buffer.from(JSON.stringify({ announcements }, null, 2), 'utf8'), `chore: delete announcement ${id}`)
        .then(r => { if (!r.ok) console.warn('GitHub commit failed', r); });
    } catch (err) {
      console.warn('Failed to persist announcements locally', err);
    }
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ message: 'Server error deleting announcement' });
  }
});

// ✅ POST discussion
app.post('/api/discussions', upload.single('image'), (req, res) => {
  try {
    let { title, content, type, pollOptions } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Handle pollOptions if it's a string (from form data)
    if (pollOptions && typeof pollOptions === 'string') {
      try {
        pollOptions = JSON.parse(pollOptions);
      } catch (e) {
        pollOptions = [];
      }
    }

    const newDiscussion = {
      id: discussions.length + 1,
      title,
      content,
      type,
      pollOptions: pollOptions || [],
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
    };

    discussions.push(newDiscussion);
    try {
      writeJsonFileSafe(DISCUSSIONS_JSON_PATH, { discussions });
      githubPutFile('discussions.json', Buffer.from(JSON.stringify({ discussions }, null, 2), 'utf8'), `chore: add discussion ${newDiscussion.id}`)
        .then(r => { if (!r.ok) console.warn('GitHub commit failed', r); });
    } catch (err) {
      console.warn('Failed to persist discussions locally', err);
    }
    res.status(201).json(newDiscussion);
  } catch (err) {
    console.error('Error posting discussion:', err);
    res.status(500).json({ message: 'Server error posting discussion' });
  }
});

// DELETE discussion
app.delete('/api/discussions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const before = discussions.length;
    discussions = discussions.filter(d => String(d.id) !== String(id));
    if (discussions.length === before) return res.status(404).json({ message: 'Discussion not found' });
    try {
      writeJsonFileSafe(DISCUSSIONS_JSON_PATH, { discussions });
      githubPutFile('discussions.json', Buffer.from(JSON.stringify({ discussions }, null, 2), 'utf8'), `chore: delete discussion ${id}`)
        .then(r => { if (!r.ok) console.warn('GitHub commit failed', r); });
    } catch (err) {
      console.warn('Failed to persist discussions locally', err);
    }
    res.status(200).json({ message: 'Discussion deleted' });
  } catch (err) {
    console.error('Error deleting discussion:', err);
    res.status(500).json({ message: 'Server error deleting discussion' });
  }
});

// Catch all handler: send back React's index.html file for client-side routing
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
