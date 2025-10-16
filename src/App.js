import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Admin from './components/Admin.js';
import Announcements from './components/Announcements.js';
import Banner from './components/Banner.js';
import Discussions from './components/Discussions.js';
import Header from './components/Header.js';
import MyList from './components/MyList.js';
import VideoPlayer from './components/VideoPlayer.js';
import VideoRow from './components/VideoRow.js';
import { useYouTubeData } from './data.js';

const AppContainer = styled.div`
  background-color: #141414;
  color: #fff;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
`;

const LoadingSpinner = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MainContent = styled.main`
  padding: 40px 0;
`;

const Footer = styled.footer`
  text-align: center;
  color: #999;
  padding: 40px 20px;
  border-top: 1px solid #333;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  font-family: 'Roboto', sans-serif;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  h2 {
    font-size: 2rem;
    margin-bottom: 10px;
    color: #fff;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;

function MainPage() {
  const { featuredVideo, videoRows, loading, error, uploadedVideos, announcements, discussions } = useYouTubeData();
  // Debug state to surface production fetch status
  const [debugStatus, setDebugStatus] = useState({ lastFetch: null, videos: 0, announcements: 0, discussions: 0, ok: false });
  const [currentVideo, setCurrentVideo] = useState(null);
  const [filteredRows, setFilteredRows] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  // Set initial currentVideo and filteredRows when data loads
  useEffect(() => {
    if (featuredVideo && !currentVideo) {
      setCurrentVideo(featuredVideo);
    }
    if (videoRows.length > 0 && filteredRows.length === 0) {
      setFilteredRows(videoRows);
    }
    // update debug banner whenever data changes
    setDebugStatus({
      lastFetch: new Date().toLocaleString(),
      videos: uploadedVideos?.length || 0,
      announcements: announcements?.length || 0,
      discussions: discussions?.length || 0,
      ok: !loading && !error
    });
  }, [featuredVideo, videoRows, currentVideo, filteredRows]);

  // Filter rows based on showOnlyRecommended state
  useEffect(() => {
    if (showOnlyRecommended) {
      const recommendedRow = videoRows.find(row => row.title === 'Recommended for You');
      setFilteredRows(recommendedRow ? [recommendedRow] : []);
    } else {
      setFilteredRows(videoRows);
    }
  }, [showOnlyRecommended, videoRows]);

  // Listen for uploaded videos changes to refresh data
  useEffect(() => {
    const handleUploadedVideosChange = () => {
      // Force re-render by updating state
      setFilteredRows([]);
      setCurrentVideo(null);
    };
    const handleMyListUpdated = () => {
      // Force re-render by updating state
      setFilteredRows([]);
      setCurrentVideo(null);
    };
    const handleAnnouncementsChanged = () => {
      // Force re-render by updating state
      setFilteredRows([]);
      setCurrentVideo(null);
    };
    const handleDiscussionsChanged = () => {
      // Force re-render by updating state
      setFilteredRows([]);
      setCurrentVideo(null);
    };
    window.addEventListener('uploadedVideosChanged', handleUploadedVideosChange);
    window.addEventListener('myListUpdated', handleMyListUpdated);
    window.addEventListener('announcementsChanged', handleAnnouncementsChanged);
    window.addEventListener('discussionsChanged', handleDiscussionsChanged);
    return () => {
      window.removeEventListener('uploadedVideosChanged', handleUploadedVideosChange);
      window.removeEventListener('myListUpdated', handleMyListUpdated);
      window.removeEventListener('announcementsChanged', handleAnnouncementsChanged);
      window.removeEventListener('discussionsChanged', handleDiscussionsChanged);
    };
  }, []);

  // Auto-scroll banner videos every 5 seconds
  useEffect(() => {
    if (videoRows.length === 0) return;

    const allVideos = videoRows.flatMap(row => row.videos);
    if (allVideos.length === 0) return;

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % allVideos.length;
      setCurrentVideo(allVideos[currentIndex]);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [videoRows]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      if (showOnlyRecommended) {
        const recommendedRow = videoRows.find(row => row.title === 'Recommended for You');
        setFilteredRows(recommendedRow ? [recommendedRow] : []);
      } else {
        setFilteredRows(videoRows);
      }
      return;
    }

    const filtered = videoRows.map(row => ({
      ...row,
      videos: row.videos.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase())
      )
    })).filter(row => row.videos.length > 0);

    setFilteredRows(filtered);
  };

  const handleVideoPlay = (video) => {
    setPlayingVideo(video);
  };

  const handleClosePlayer = () => {
    setPlayingVideo(null);
  };

  if (loading) {
    return (
      <AppContainer>
        <Header onSearch={handleSearch} />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          color: '#fff'
        }}>
          <LoadingSpinner style={{
            width: '50px',
            height: '50px',
            border: '4px solid #333',
            borderTop: '4px solid #e50914',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <h2>Loading...</h2>
        </div>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <Header onSearch={handleSearch} />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          color: '#fff',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2 style={{ color: '#e50914', marginBottom: '20px' }}>Unable to load videos</h2>
          <p style={{ color: '#999', marginBottom: '20px' }}>{error}</p>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header onSearch={handleSearch} videos={uploadedVideos} onNavClick={(navItem) => {
        if (navItem === 'Recommended for You') {
          setShowOnlyRecommended(true);
        } else {
          setShowOnlyRecommended(false);
        }
      }} />


      <Banner video={currentVideo} onVideoPlay={handleVideoPlay} />
      <MainContent>
        {filteredRows.length > 0 ? (
          filteredRows.map((row) => (
            <VideoRow
              key={row.title}
              row={row}
              onVideoClick={setCurrentVideo}
              onVideoPlay={handleVideoPlay}
            />
          ))
        ) : (
          <NoResults>
            <h2>No videos found</h2>
            <p>We couldn't find any videos matching your search. Try different keywords or browse our featured content.</p>
            <div style={{ marginTop: '16px' }}>
              <a href="/" style={{ display: 'inline-block', padding: '10px 18px', background: '#e50914', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}>Browse Featured</a>
            </div>
          </NoResults>
        )}
      </MainContent>
      <Footer>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{
            color: '#e50914',
            margin: '0 0 10px 0',
            fontSize: '1.5rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            ISMART SUMAN CREATIONS
          </h3>
          <p style={{
            margin: '0',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Film production company and youtube channel
          </p>
        </div>
        <div style={{
          borderTop: '1px solid #444',
          paddingTop: '20px',
          marginTop: '20px'
        }}>
          <p style={{
            margin: '0',
            fontSize: '0.8rem',
            color: '#777'
          }}>
            © 2025 ISMART SUMAN CREATIONS. All rights reserved. | Made with ❤️ for storytelling
          </p>
        </div>
      </Footer>
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={handleClosePlayer}
        />
      )}
    </AppContainer>
  );
}

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle client-side routing for GitHub Pages
    const handleGitHubPagesRouting = () => {
      const path = window.location.pathname;
      if (path.startsWith('/ismartsumancreations/')) {
        const route = path.replace('/ismartsumancreations', '') || '/';
        if (route !== path) {
          navigate(route, { replace: true });
        }
      }
    };

    handleGitHubPagesRouting();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/my-list" element={<MyList />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/discussions" element={<Discussions />} />
      <Route path="/" element={<MainPage />} />
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}
