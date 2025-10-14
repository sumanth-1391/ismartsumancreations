import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-deployed-server.com'
  : 'http://localhost:5001';

const AnnouncementsContainer = styled.div`
  background-color: #141414;
  color: #fff;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  padding: 120px 60px 40px;

  @media (max-width: 768px) {
    padding: 100px 20px 40px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #e50914;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #999;
  margin: 0;
`;

const BackButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
  color: #fff;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 20px;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
  box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);

  &:hover {
    background: linear-gradient(135deg, #ff6b6b 0%, #e50914 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

const AnnouncementsList = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const AnnouncementCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  border-left: 4px solid #e50914;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(229, 9, 20, 0.2);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const AnnouncementTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const AnnouncementContent = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 15px;
`;

const AnnouncementDate = styled.div`
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
`;

const NoAnnouncements = styled.div`
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

const LoadingSpinner = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  width: 50px;
  height: 50px;
  border: 3px solid #333;
  border-top: 3px solid #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 50px auto;
`;

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/announcements`);
        if (response.ok) {
          let data = await response.json();
          // sort newest first
          data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAnnouncements(data);
        } else {
          console.error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <AnnouncementsContainer>
        <LoadingSpinner />
      </AnnouncementsContainer>
    );
  }

  return (
    <AnnouncementsContainer>
      <Header>
        <Title>Announcements</Title>
        <Subtitle>Stay updated with the latest news and updates from ISMART SUMAN CREATIONS</Subtitle>
        <BackButton to="/">← Back to Home</BackButton>
      </Header>
      <AnnouncementsList>
        {announcements.length === 0 ? (
          <NoAnnouncements>
            <h2>No Announcements Yet</h2>
            <p>Check back later for updates and announcements.</p>
          </NoAnnouncements>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id}>
              <AnnouncementTitle>{announcement.title}</AnnouncementTitle>
              <AnnouncementContent>{announcement.content}</AnnouncementContent>
              <AnnouncementDate>
                {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </AnnouncementDate>
            </AnnouncementCard>
          ))
        )}
      </AnnouncementsList>
    </AnnouncementsContainer>
  );
}
