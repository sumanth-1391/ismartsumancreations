import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  background: black;
  opacity: 100%;
  padding: 30px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 25px 20px;
  }
`;

const Logo = styled.img`
  height: 70px;
  width: auto;
  cursor: pointer;
  transition: transform 0.3s ease;
  filter: brightness(1.1);

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    height: 50px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 30px;
  background: transparent;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    color: #e50914;
    transform: translateY(-2px);
  }

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -5px;
    left: 0;
    background: linear-gradient(90deg, #e50914, #ff6b6b);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const AdminLink = styled(NavLink)`
  background: rgba(229, 9, 20, 0.1);
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #e50914;

  &:hover {
    background: rgba(229, 9, 20, 0.2);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NotificationButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  &::before {
    content: '🔔';
    color: #fff;
    font-size: 20px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e50914;
  color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;



export default function Header({ onSearch, videos = [], onNavClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [announcementCount, setAnnouncementCount] = useState(0);

  // Fetch announcement count for notification badge
  useEffect(() => {
    const fetchAnnouncementCount = async () => {
      try {
        const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://your-deployed-server.com' : 'http://localhost:5001'}/api/announcements`);
        if (response.ok) {
          const announcements = await response.json();
          setAnnouncementCount(announcements.length);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncementCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnnouncementCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      // Generate suggestions based on video titles and descriptions
      const allVideos = videos.map(video => ({
        ...video,
        category: 'Videos' // Default category since we don't have rows here
      }));

      const filteredSuggestions = allVideos
        .filter(video =>
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.description.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions

      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion.title);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <HeaderContainer>
      <Logo src="/logo.png" alt="ISMART SUMAN CREATIONS Logo" />
      <Nav>
        <NavLink onClick={() => onNavClick && onNavClick('Home')}>Home</NavLink>
        <NavLink onClick={() => onNavClick && onNavClick('Recommended for You')}>Recommended for You</NavLink>
        <NavLink onClick={() => onNavClick && onNavClick('Movies')}>Movies</NavLink>
        <NavLink as={Link} to="/my-list">My List</NavLink>
        <NavLink as={Link} to="/announcements">Announcements</NavLink>
        <NavLink as={Link} to="/discussions">Discussions</NavLink>
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <SearchIcon></SearchIcon>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <SuggestionsDropdown>
              {suggestions.map((suggestion) => (
                <SuggestionItem
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <SuggestionTitle>{suggestion.title}</SuggestionTitle>
                  <SuggestionCategory>{suggestion.category}</SuggestionCategory>
                </SuggestionItem>
              ))}
            </SuggestionsDropdown>
          )}
        </SearchContainer>
      </Nav>
      <RightSection>
        <NotificationButton onClick={() => window.location.href = '/announcements'}>
          {announcementCount > 0 && (
            <NotificationBadge>{announcementCount > 99 ? '99+' : announcementCount}</NotificationBadge>
          )}
        </NotificationButton>
        <ProfileIcon />
      </RightSection>
    </HeaderContainer>
  );
}

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 12px 45px 12px 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  width: 300px;
  font-weight: 500;

  &::placeholder {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 400;
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.95);
    color: #000;
    border-color: #e50914;
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    width: 200px;
    padding: 10px 40px 10px 15px;
    font-size: 0.9rem;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 15px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  pointer-events: none;
  font-weight: bold;

  &::before {
    content: '🔍';
  }
`;

const ProfileIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionItem = styled.div`
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #333;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(229, 9, 20, 0.1);
  }
`;

const SuggestionTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
`;

const SuggestionCategory = styled.div`
  font-size: 0.75rem;
  color: #999;
  font-style: italic;
`;


