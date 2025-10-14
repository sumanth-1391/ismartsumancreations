import { useRef, useState } from 'react';
import styled from 'styled-components';

const RowContainer = styled.div`
  margin-bottom: 40px;
  padding: 0 60px;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 20px;
    margin-bottom: 30px;
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
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
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(229, 9, 20, 0.9);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.left {
    left: 10px;
  }

  &.right {
    right: 10px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
`;

const RowTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 15px;
  color: #fff;
  font-family: 'Roboto', sans-serif;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const VideosContainer = styled.div`
  display: flex;
  overflow: hidden;
  gap: 15px;
  position: relative;
`;

const VideoCard = styled.div`
  min-width: 350px;
  aspect-ratio: 16 / 9;
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 1;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.7);
    z-index: 10;
  }

  @media (max-width: 768px) {
    min-width: 280px;
  }
`;

const BlurOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  pointer-events: none;

  ${VideoCard}:hover & {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const Popup = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  z-index: 1002;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: scale(0.95);

  ${VideoCard}:hover & {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.95);
    width: 90vw;
    height: auto;
    max-width: 600px;
    z-index: 1003;
    ${BlurOverlay} {
      opacity: 1;
      visibility: visible;
    }

    ${VideoCard}:hover & {
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const PopupVideo = styled.div`
  flex: 1;
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopupPlayIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  border: 2px solid #fff;
`;

const PopupInfo = styled.div`
  padding: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7));
  flex-shrink: 0;

  h4 {
    margin: 0 0 8px 0;
    font-size: 1.2rem;
    font-weight: 600;
    line-height: 1.3;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #ccc;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const VideoInfo = styled.div`
  padding: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  border-radius: 0 0 8px 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const VideoTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #fff;
  line-height: 1.3;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PlayOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;

  ${VideoCard}:hover & {
    opacity: 1;
  }
`;

const PlayIcon = styled.span`
  color: #fff;
  font-size: 2.5rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ThumbnailImg = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  z-index: 0;
`;

export default function VideoRow({ row, onVideoClick, onVideoPlay }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const videosContainerRef = useRef(null);

  // Helper Thumbnail component: tries a list of fallback URLs when image fails to load
  function Thumbnail({ src, alt }) {
    const [current, setCurrent] = useState(src);
    const [tries, setTries] = useState(0);

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
      } catch (e) {
        // ignore
      }
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
      // final fallback to local logo
      fallbacks.push('/logo.png');

      // Start with provided src only if it's truthy and not equal to current fallbacks
      const list = [];
      if (url) list.push(url);
      for (const u of fallbacks) if (u && !list.includes(u)) list.push(u);
      return list;
    };

    const fallbacks = buildFallbacks(src);

    // initialize to first valid fallback (not undefined or empty)
    const initial = fallbacks.find(Boolean) || '/logo.png';
    const [currentSrc, setCurrentSrc] = useState(initial);
    const [attemptIndex, setAttemptIndex] = useState(0);

    const handleError = () => {
      const nextIndex = attemptIndex + 1;
      if (nextIndex < fallbacks.length) {
        setCurrentSrc(fallbacks[nextIndex]);
        setAttemptIndex(nextIndex);
      }
    };

    return <ThumbnailImg src={currentSrc} alt={alt} onError={handleError} />;
  }

  const handleVideoClick = (video) => {
    // Track user interaction for recommendations
    const userInteractions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    const interaction = {
      videoId: video.id,
      category: video.categories?.[0] || 'General',
      timestamp: Date.now(),
      action: 'clicked'
    };
    userInteractions.unshift(interaction);
    // Keep only last 50 interactions
    localStorage.setItem('userInteractions', JSON.stringify(userInteractions.slice(0, 50)));

    if (onVideoPlay) {
      onVideoPlay(video);
    } else if (video.url) {
      window.open(video.url, '_blank');
    } else {
      onVideoClick(video);
    }
  };

  const scrollLeft = () => {
    if (videosContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - 400);
      videosContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const scrollRight = () => {
    if (videosContainerRef.current) {
      const maxScroll = videosContainerRef.current.scrollWidth - videosContainerRef.current.clientWidth;
      const newPosition = Math.min(maxScroll, scrollPosition + 400);
      videosContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = videosContainerRef.current
    ? scrollPosition < videosContainerRef.current.scrollWidth - videosContainerRef.current.clientWidth
    : false;

  return (
    <RowContainer>
      <BlurOverlay />
      <RowTitle>{row.title}</RowTitle>
      <VideosContainer ref={videosContainerRef}>
        {row.videos.map((video) => (
          <VideoCard
            key={video.id}
            bgImage={video.thumbnail}
            onClick={() => handleVideoClick(video)}
          >
            {/* Render <img> thumbnail with JS fallbacks; background-image remains as CSS fallback */}
            <Thumbnail src={video.thumbnail} alt={video.title} />

            <PlayOverlay>
              <PlayIcon>▶</PlayIcon>
            </PlayOverlay>
            <VideoInfo>
              <VideoTitle>{video.title}</VideoTitle>
            </VideoInfo>
            <Popup>
              <PopupVideo bgImage={video.thumbnail}>
                <PopupPlayIcon>▶</PopupPlayIcon>
              </PopupVideo>
              <PopupInfo>
                <h4>{video.title}</h4>
                <p>{video.description}</p>
              </PopupInfo>
            </Popup>
          </VideoCard>
        ))}
      </VideosContainer>
      <ArrowButton className="left" onClick={scrollLeft} disabled={!canScrollLeft}>
        ‹
      </ArrowButton>
      <ArrowButton className="right" onClick={scrollRight} disabled={!canScrollRight}>
        ›
      </ArrowButton>
    </RowContainer>
  );
}
