import { useEffect } from 'react';
import styled from 'styled-components';

const PlayerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PlayerContainer = styled.div`
  position: relative;
  width: 95%;
  max-width: 1400px;
  max-height: 95vh;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
`;

const VideoSection = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background: #000;
`;

const InfoSection = styled.div`
  padding: 30px;
  background: linear-gradient(135deg, #141414 0%, #1a1a1a 100%);
  color: #fff;
`;

const VideoTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  color: #fff;
  font-family: 'Roboto', sans-serif;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const VideoDescription = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0 0 20px 0;
  color: #ccc;
  max-width: 800px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const VideoMeta = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 1rem;

  span {
    color: #e50914;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? 'linear-gradient(135deg, #e50914 0%, #ff6b6b 100%)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.primary ? '#fff' : '#fff'};
  border: ${props => props.primary ? 'none' : '2px solid rgba(255, 255, 255, 0.3)'};
  padding: 14px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: ${props => props.primary ? 'linear-gradient(135deg, #ff6b6b 0%, #e50914 100%)' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(229, 9, 20, 0.3);
  }

  @media (max-width: 768px) {
    padding: 12px 25px;
    font-size: 1rem;
  }
`;



const VideoFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  aspect-ratio: 16/9;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(229, 9, 20, 0.9);
    transform: scale(1.1);
  }
`;

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const VideoPlayer = ({ video, onClose }) => {

  const handleAddToList = () => {
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    const existingIndex = myList.findIndex(v => v.id === video.id);
    if (existingIndex === -1) {
      myList.push(video);
      localStorage.setItem('myList', JSON.stringify(myList));
      alert('Added to My List!');
      window.dispatchEvent(new Event('myListUpdated'));
    } else {
      alert('Already in My List!');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?video=${video.id}`;
    const shareText = `Check out this video: ${video.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        fallbackShare(shareUrl, shareText);
      }
    } else {
      fallbackShare(shareUrl, shareText);
    }
  };

  const fallbackShare = (url, text) => {
    navigator.clipboard.writeText(`${text} ${url}`).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert(`Share this link: ${url}`);
    });
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Add to continue watching when video starts playing
    const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]');
    const existingIndex = continueWatching.findIndex(v => v.id === video.id);
    if (existingIndex > -1) {
      continueWatching.splice(existingIndex, 1);
    }
    continueWatching.unshift(video);
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching.slice(0, 10))); // Keep only 10

    // Track user interaction for recommendations
    const userInteractions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    const interaction = {
      videoId: video.id,
      category: video.categories?.[0] || 'General',
      timestamp: Date.now(),
      action: 'watched'
    };
    userInteractions.unshift(interaction);
    // Keep only last 50 interactions
    localStorage.setItem('userInteractions', JSON.stringify(userInteractions.slice(0, 50)));

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, video.url]);

  const videoId = getYouTubeVideoId(video.url);

  if (!videoId) {
    return null;
  }

  return (
    <PlayerOverlay onClick={onClose}>
      <PlayerContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <VideoSection>
          <VideoFrame
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </VideoSection>
        <InfoSection>
          <VideoTitle>{video.title}</VideoTitle>
          <VideoDescription>{video.description}</VideoDescription>
          <VideoMeta>
            <MetaItem>
              <span>📅</span> Uploaded: {new Date(video.id ? parseInt(video.id) : Date.now()).toLocaleDateString()}
            </MetaItem>
            <MetaItem>
              <span>🏷️</span> Category: {video.categories?.join(', ') || 'General'}
            </MetaItem>
          </VideoMeta>
          <ActionButtons>
            <ActionButton primary onClick={() => window.open(video.url, '_blank')}>Watch Full Video</ActionButton>
            <ActionButton onClick={() => {
              handleAddToList();
              window.location.href = '/my-list';
            }}>View My List</ActionButton>
            <ActionButton onClick={handleShare}>Share</ActionButton>
          </ActionButtons>
        </InfoSection>
      </PlayerContainer>
    </PlayerOverlay>
  );
};

export default VideoPlayer;
