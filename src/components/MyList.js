import { useEffect, useState } from 'react';
import styled from 'styled-components';

const MyListContainer = styled.div`
  background-color: #141414;
  color: #fff;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  padding: 80px 20px 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #e50914;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #999;
`;

const BackButton = styled.button`
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  margin-bottom: 30px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const VideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const VideoCard = styled.div`
  background: #222;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
`;

const VideoThumbnail = styled.div`
  width: 100%;
  height: 160px;
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

// Thumbnail helper: tries YouTube fallback sizes then local logo
function Thumbnail({ src, alt }) {
  const extractYouTubeId = (url) => {
    if (!url) return null;
    try {
      const patterns = [
        /(?:youtube\.com.*(?:\\?|&)v=)([^&]+)/i,
        /(?:youtu\.be\/)([^?&]+)/i,
        /vi\/([^\/]+)/i,
        /embed\/([^?&\/]+)/i,
        /v=([^&]+)/i
      ];
      for (const r of patterns) {
        const m = url.match(r);
        if (m && m[1]) return m[1];
      }
    } catch (e) {}
    return null;
  };

  const buildFallbacks = (url) => {
    const fallbacks = [];
    const id = extractYouTubeId(url);
    if (id) {
      fallbacks.push(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
      fallbacks.push(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
      fallbacks.push(`https://i.ytimg.com/vi/${id}/sddefault.jpg`);
      fallbacks.push(`https://i.ytimg.com/vi/${id}/default.jpg`);
    }
    fallbacks.push('/logo.png');

    const list = [];
    if (url) list.push(url);
    for (const u of fallbacks) if (u && !list.includes(u)) list.push(u);
    return list;
  };

  const fallbacks = buildFallbacks(src);
  const initial = fallbacks.find(Boolean) || '/logo.png';
  const [current, setCurrent] = useState(initial);
  const [tries, setTries] = useState(0);

  const handleError = () => {
    const next = tries + 1;
    if (next < fallbacks.length) {
      setCurrent(fallbacks[next]);
      setTries(next);
    }
  };

  return <ThumbnailImg src={current} alt={alt} onError={handleError} />;
}

const VideoInfo = styled.div`
  padding: 15px;
`;

const VideoTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VideoDescription = styled.p`
  font-size: 0.9rem;
  color: #ccc;
  margin: 0 0 15px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const WatchButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #ff6b6b 0%, #e50914 100%);
    transform: translateY(-1px);
  }
`;

const UnlistButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #999;

  h2 {
    font-size: 2rem;
    margin-bottom: 15px;
    color: #fff;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 30px;
  }
`;

const BrowseButton = styled.button`
  display: inline-block;
  background: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
  color: #fff;
  padding: 14px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: linear-gradient(135deg, #ff6b6b 0%, #e50914 100%);
    transform: translateY(-2px);
  }
`;

export default function MyList() {
  const [myList, setMyList] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('myList') || '[]');
    setMyList(list);
  }, []);

  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const handleUnlist = (videoId) => {
    const updatedList = myList.filter(video => video.id !== videoId);
    setMyList(updatedList);
    localStorage.setItem('myList', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('myListUpdated'));
  };

  const handleWatch = (video) => {
    // You can implement video watching logic here
    window.open(video.url, '_blank');
  };

  if (myList.length === 0) {
    return (
      <MyListContainer>
        <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: '1000' }}>
          <img src="/logo.png" alt="ISMART SUMAN CREATIONS Logo" style={{ height: '60px', width: 'auto', cursor: 'pointer' }} onClick={handleLogoClick} />
        </div>

        <Header>
          <Title>My List</Title>
          <Subtitle>Your saved videos</Subtitle>
        </Header>
        <BackButton onClick={() => window.location.href = '/'}>← Back to Home</BackButton>
        <EmptyState>
          <h2>No videos in your list</h2>
          <p>Start adding videos to watch later!</p>
          <BrowseButton onClick={() => window.location.href = '/'}>Browse Videos</BrowseButton>
        </EmptyState>
      </MyListContainer>
    );
  }

  return (
    <MyListContainer>
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: '1000' }}>
        <img src="/logo.png" alt="ISMART SUMAN CREATIONS Logo" style={{ height: '60px', width: 'auto', cursor: 'pointer' }} onClick={handleLogoClick} />
      </div>

      <Header>
        <Title>My List</Title>
        <Subtitle>{myList.length} video{myList.length !== 1 ? 's' : ''} saved</Subtitle>
      </Header>
      <BackButton onClick={() => window.location.href = '/'}>← Back to Home</BackButton>
      <VideosGrid>
        {myList.map((video) => (
          <VideoCard key={video.id}>
            <VideoThumbnail onClick={() => handleWatch(video)}>
              <Thumbnail
                src={video.thumbnail}
                alt={video.title}
              />
            </VideoThumbnail>
            <VideoInfo>
              <VideoTitle>{video.title}</VideoTitle>
              <VideoDescription>{video.description}</VideoDescription>
              <ActionButtons>
                <WatchButton onClick={() => handleWatch(video)}>Watch</WatchButton>
                <UnlistButton onClick={() => handleUnlist(video.id)}>Unlist</UnlistButton>
              </ActionButtons>
            </VideoInfo>
          </VideoCard>
        ))}
      </VideosGrid>
    </MyListContainer>
  );
}
