import { useState } from 'react';
import styled from 'styled-components';

const BannerContainer = styled.div`
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  height: 70vh;
  display: flex;
  align-items: center;
  padding: 0 60px;
  position: relative;
  margin-top: 80px; /* Account for fixed header */

  @media (max-width: 768px) {
    height: 50vh;
    padding: 0 20px;
    margin-top: 70px;
  }
`;

const BannerThumb = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
`;

const Overlay = styled.div`
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.6) 30%,
    rgba(0, 0, 0, 0.3) 60%,
    rgba(0, 0, 0, 0.1) 100%
  );
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 600px;
  color: #fff;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  font-family: 'Roboto', sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.2rem;
  font-weight: 300;
  margin-bottom: 30px;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const PlayButton = styled.button`
  background: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
  color: #fff;
  border: none;
  padding: 14px 35px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
  box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: linear-gradient(135deg, #ff6b6b 0%, #e50914 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 12px 28px;
    font-size: 1rem;
  }
`;

const WatchNowButton = styled.button`
  background-color: transparent;
  color: #fff;
  border: 2px solid #fff;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 15px;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;

  &:hover {
    background-color: #fff;
    color: #000;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 10px 25px;
    font-size: 1rem;
    margin-left: 10px;
  }
`;

export default function Banner({ video, onVideoPlay }) {
  if (!video) {
    return null;
  }

  const handlePlay = () => {
    // Track user interaction for recommendations
    const userInteractions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    const interaction = {
      videoId: video.id,
      category: video.categories?.[0] || 'General',
      timestamp: Date.now(),
      action: 'banner_play'
    };
    userInteractions.unshift(interaction);
    // Keep only last 50 interactions
    localStorage.setItem('userInteractions', JSON.stringify(userInteractions.slice(0, 50)));

    if (onVideoPlay) {
      onVideoPlay(video);
    } else if (video.url) {
      window.open(video.url, '_blank');
    }
  };

  return (
    <BannerContainer bgImage={video.thumbnail}>
      {/* Render img thumbnail with fallbacks on error */}
      <BannerThumbnail src={video.thumbnail} alt={video.title} />
      <Overlay />
      <Content>
        <Title>{video.title}</Title>
        <Description>{video.description}</Description>
        <div>
          <PlayButton onClick={handlePlay}>Play</PlayButton>
          <WatchNowButton onClick={handlePlay}>Watch Now</WatchNowButton>
        </div>
      </Content>
    </BannerContainer>
  );
}

// Simple BannerThumbnail component with fallback chain
function BannerThumbnail({ src, alt }) {
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

  const fallbacks = (() => {
    const id = extractYouTubeId(src);
    if (id) {
      return [
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${id}/default.jpg`,
        '/logo.png'
      ];
    }
    return [src, '/logo.png'].filter(Boolean);
  })();

  const initial = fallbacks.find(Boolean) || '/logo.png';
  const [current, setCurrent] = useState(initial);
  const [idx, setIdx] = useState(0);

  const handleError = () => {
    const next = idx + 1;
    if (next < fallbacks.length) {
      setCurrent(fallbacks[next]);
      setIdx(next);
    }
  };

  return <BannerThumb src={current} alt={alt} onError={handleError} />;
}
