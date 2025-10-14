(async () => {
  try {
    const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
    const data = {
      id: 'test-' + Date.now(),
      title: 'CLI Test Video',
      description: 'Uploaded via script',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: '',
      publishedAt: new Date().toISOString(),
      viewCount: 0,
      likeCount: 0,
      duration: 'N/A',
      categories: []
    };
    const res = await fetch('http://localhost:5001/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('POST status', res.status);
    const j = await (await fetch('http://localhost:5001/api/videos')).json();
    console.log('VIDEOS COUNT', j.length);
    console.log(j.find(v => v.id === data.id) ? 'FOUND' : 'MISSING');
  } catch (e) {
    console.error(e);
  }
})();
