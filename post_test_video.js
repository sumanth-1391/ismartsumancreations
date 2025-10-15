(async ()=>{
  try{
    const fetch = globalThis.fetch || (await import('node:node-fetch')).default;
    const fs = await import('node:fs');
    const path = 'c:/Users/suman/ISMART SUMAN CREATIONS WEB/data.json'.replace(/\\/g,'/');

    const video = {
      id: 'cli-test-' + Date.now(),
      title: 'CLI Test Video',
      description: 'Uploaded by test script',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      publishedAt: new Date().toISOString(),
      viewCount: 0,
      likeCount: 0,
      duration: 'N/A',
      categories: ['Test']
    };

    console.log('Posting video id=', video.id);
    const res = await fetch('http://localhost:5001/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    });

    console.log('Response status:', res.status);
    const body = await res.text();
    console.log('Response body:', body.slice(0,1000));

    // read data.json and check
    try{
      const content = fs.readFileSync(path, 'utf8');
      const parsed = JSON.parse(content);
      const found = (parsed.videos||[]).some(v=>v.id===video.id);
      console.log('Persisted in data.json?', found);
    }catch(e){
      console.error('Failed reading data.json:', e.message);
    }
  }catch(e){
    console.error('Script error', e);
  }
})();
