import { useEffect, useReducer } from 'react';

// For production, allow using an environment variable set by Vercel: REACT_APP_API_BASE_URL
// Fallback to same-origin (window.location.origin) so APIs hosted on the same domain work.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production'
  ? (typeof window !== 'undefined' ? window.location.origin : 'https://your-deployed-server.com')
  : 'http://localhost:5001');

// Custom hook for admin-managed video data
export const useYouTubeData = () => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      case 'SET_DATA':
        return {
          ...state,
          featuredVideo: action.payload.featuredVideo,
          videoRows: action.payload.videoRows,
          uploadedVideos: action.payload.uploadedVideos,
          announcements: action.payload.announcements,
          discussions: action.payload.discussions,
          loading: false,
          error: null
        };
      default:
        return state;
    }
  }, {
    featuredVideo: null,
    videoRows: [],
    loading: true,
    error: null,
    uploadedVideos: [],
    announcements: [],
    discussions: []
  });

  const { featuredVideo, videoRows, loading, error, uploadedVideos, announcements, discussions } = state;

  const fetchData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      console.log('Loading videos from server...');

      // Fetch videos
      const response = await fetch(`${API_BASE_URL}/api/videos`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos from server');
      }

      const uploaded = await response.json();

      // Fetch announcements (best-effort)
      let announcements = [];
      try {
        const aRes = await fetch(`${API_BASE_URL}/api/announcements`);
        if (aRes.ok) announcements = await aRes.json();
      } catch (e) {
        console.warn('Failed to load announcements', e);
      }

      // Fetch discussions (best-effort)
      let discussions = [];
      try {
        const dRes = await fetch(`${API_BASE_URL}/api/discussions`);
        if (dRes.ok) discussions = await dRes.json();
      } catch (e) {
        console.warn('Failed to load discussions', e);
      }

      console.log(`Loaded ${uploaded.length} videos from server`);

      // Sort uploaded videos by date (latest first)
      const sortedUploaded = [...uploaded].sort((a, b) => {
        const dateA = a.uploadDate || a.createdAt || new Date(parseInt(a.id));
        const dateB = b.uploadDate || b.createdAt || new Date(parseInt(b.id));
        return new Date(dateB) - new Date(dateA);
      });

      // Set featured video (latest uploaded)
      const featured = sortedUploaded[0] || null;

      // Load continue watching from localStorage
      const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]');

      // Load My List from localStorage
      const myList = JSON.parse(localStorage.getItem('myList') || '[]');

      // Generate recommendations based on user actions
      const generateRecommendations = () => {
        const userInteractions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
        const watchedCategories = new Set();
        const watchedVideos = new Set();

        // Collect categories and videos user has interacted with
        userInteractions.forEach(interaction => {
          if (interaction.category) {
            watchedCategories.add(interaction.category);
          }
          if (interaction.videoId) {
            watchedVideos.add(interaction.videoId);
          }
        });

        // Also check continue watching and my list for additional context
        continueWatching.forEach(video => {
          if (video.categories) {
            video.categories.forEach(cat => watchedCategories.add(cat));
          }
          watchedVideos.add(video.id);
        });

        myList.forEach(video => {
          if (video.categories) {
            video.categories.forEach(cat => watchedCategories.add(cat));
          }
          watchedVideos.add(video.id);
        });

        // Score videos based on relevance
        const scoredVideos = uploaded.map(video => {
          let score = 0;

          // Boost score for videos in user's preferred categories
          if (video.categories) {
            video.categories.forEach(cat => {
              if (watchedCategories.has(cat)) {
                score += 3; // High weight for category match
              }
            });
          }

          // Boost score for videos similar to watched ones (by title keywords)
          const watchedTitles = [...continueWatching, ...myList].map(v => v.title.toLowerCase());
          const videoTitle = video.title.toLowerCase();
          watchedTitles.forEach(watchedTitle => {
            const commonWords = watchedTitle.split(' ').filter(word =>
              word.length > 3 && videoTitle.includes(word)
            );
            score += commonWords.length * 2; // Weight for title similarity
          });

          // Slightly boost ISC Originals if user has watched them
          if (video.categories?.includes('ISC Originals') &&
              watchedCategories.has('ISC Originals')) {
            score += 1;
          }

          // Don't recommend videos user has already watched or added to list
          if (watchedVideos.has(video.id)) {
            score = -1; // Exclude already interacted videos
          }

          return { ...video, recommendationScore: score };
        });

        // Return top recommended videos (excluding those with negative scores)
        return scoredVideos
          .filter(video => video.recommendationScore > 0)
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, 10);
      };

      const recommendedVideos = generateRecommendations();

      // Sort videos by viewCount for most viewed
      const sortedByViews = [...uploaded].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

      // (sortedUploaded already computed above)

      // Create rows: My List, Latest Videos, ISC Originals, Continue Watching, Most Viewed, Trending Now
  const latestVideos = sortedUploaded.slice(0, 10);
      const iscOriginals = uploaded.filter(video =>
        video.categories?.includes('ISC Originals') ||
        video.title.toLowerCase().includes('isc') ||
        video.title.toLowerCase().includes('original') ||
        video.description.toLowerCase().includes('isc') ||
        video.description.toLowerCase().includes('original')
      ).slice(0, 10);

      const mostViewed = uploaded.filter(video =>
        video.categories?.includes('Most Viewed Videos')
      ).concat(sortedByViews.filter(video => !video.categories?.includes('Most Viewed Videos'))).slice(0, 10);

      const trendingNow = uploaded.filter(video =>
        video.categories?.includes('Trending Now')
      ).slice(0, 10);

      const rows = [
        {
          title: 'My List',
          videos: myList.slice(0, 10)
        },
        {
          title: 'Continue Watching',
          videos: continueWatching.slice(0, 10)
        },
        {
          title: 'Recommended for You',
          videos: recommendedVideos.length > 0 ? recommendedVideos : latestVideos.slice(0, 10)
        },
        {
          title: 'Latest Videos',
          videos: latestVideos
        },
        {
          title: 'ISC Originals',
          videos: iscOriginals.length > 0 ? iscOriginals : uploaded.slice(0, 5)
        },
        {
          title: 'Most Viewed Videos',
          videos: mostViewed
        },
        {
          title: 'Trending Now',
          videos: trendingNow.length > 0 ? trendingNow : uploaded.slice(0, 10)
        }
      ];

      // Add remaining videos if any (also sorted by date)
      const remainingVideos = sortedUploaded.slice(10);
      if (remainingVideos.length > 0) {
        rows.push({
          title: 'More Videos',
          videos: remainingVideos
        });
      }

      // Sort announcements and discussions newest-first before dispatching
      announcements = announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      discussions = discussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      dispatch({
        type: 'SET_DATA',
        payload: {
          featuredVideo: featured,
          videoRows: rows,
          uploadedVideos: uploaded,
          announcements,
          discussions
        }
      });

    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load videos. Please try again later.' });
      console.error('Error loading server data:', err);

      // Fallback if no videos - show empty state
      dispatch({
        type: 'SET_DATA',
        payload: {
          featuredVideo: null,
          videoRows: [],
          uploadedVideos: []
        }
      });
    }
  };

  useEffect(() => {
    fetchData();

    // Poll for updates every 30 seconds for global sync
    const interval = setInterval(fetchData, 30000);

    // Also refresh immediately when admin uploads/updates/deletes videos
    const onUploaded = () => { fetchData(); };
    window.addEventListener('uploadedVideosChanged', onUploaded);

    return () => {
      clearInterval(interval);
      window.removeEventListener('uploadedVideosChanged', onUploaded);
    };
  }, []);

  return { featuredVideo, videoRows, loading, error, uploadedVideos, announcements, discussions };
};

// Export static for backward compatibility (will be overridden by hook)
export const featuredVideo = null;
export const videoRows = [];
