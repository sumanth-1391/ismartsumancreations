import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-deployed-server.com'
  : 'http://localhost:5001'; // ✅ change port here

const DiscussionsContainer = styled.div`
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

const DiscussionsList = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const DiscussionCard = styled.div`
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

const DiscussionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const DiscussionType = styled.span`
  font-size: 1.2rem;
`;

const DiscussionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const DiscussionContent = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 15px;
`;

const PollSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`;

const PollOption = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const PollProgress = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-top: 5px;
  overflow: hidden;
`;

const PollBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #e50914, #ff6b6b);
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const ImageSection = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const DiscussionImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const DiscussionDate = styled.div`
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
  margin-top: 15px;
`;

const NoDiscussions = styled.div`
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

export default function Discussions() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollVotes, setPollVotes] = useState({});

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/discussions`);
        if (response.ok) {
          let data = await response.json();
          // sort newest first
          data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setDiscussions(data);
        } else {
          console.error('Failed to fetch discussions');
        }
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  const handlePollVote = (discussionId, optionIndex) => {
    const pollKey = `${discussionId}-${optionIndex}`;
    if (pollVotes[pollKey]) return; // Already voted

    setPollVotes(prev => ({
      ...prev,
      [pollKey]: true
    }));

    // In a real app, you'd send this to the server
    // For now, we'll just update local state
    setDiscussions(prev => prev.map(discussion => {
      if (discussion.id === discussionId && discussion.type === 'poll') {
        const updatedOptions = [...discussion.pollOptions];
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          votes: (updatedOptions[optionIndex].votes || 0) + 1
        };
        return {
          ...discussion,
          pollOptions: updatedOptions
        };
      }
      return discussion;
    }));
  };

  const getTotalVotes = (pollOptions) => {
    return pollOptions.reduce((total, option) => total + (option.votes || 0), 0);
  };

  const getVotePercentage = (option, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round(((option.votes || 0) / totalVotes) * 100);
  };

  if (loading) {
    return (
      <DiscussionsContainer>
        <LoadingSpinner />
      </DiscussionsContainer>
    );
  }

  return (
    <DiscussionsContainer>
      <Header>
        <Title>Community Discussions</Title>
        <Subtitle>Join the conversation and share your thoughts with the ISMART SUMAN CREATIONS community</Subtitle>
        <BackButton to="/">← Back to Home</BackButton>
      </Header>
      <DiscussionsList>
        {discussions.length === 0 ? (
          <NoDiscussions>
            <h2>No Discussions Yet</h2>
            <p>Be the first to start a conversation!</p>
          </NoDiscussions>
        ) : (
          discussions.map((discussion) => (
            <DiscussionCard key={discussion.id}>
              <DiscussionHeader>
                <DiscussionType>
                  {discussion.type === 'poll' ? '📊' : discussion.type === 'image' ? '🖼️' : '💬'}
                </DiscussionType>
                <DiscussionTitle>{discussion.title}</DiscussionTitle>
              </DiscussionHeader>
              <DiscussionContent>{discussion.content}</DiscussionContent>

              {discussion.type === 'poll' && discussion.pollOptions && (
                <PollSection>
                  <h3 style={{ marginBottom: '15px', color: '#fff' }}>Poll Results</h3>
                  {discussion.pollOptions.map((option, index) => {
                    const totalVotes = getTotalVotes(discussion.pollOptions);
                    const percentage = getVotePercentage(option, totalVotes);
                    const hasVoted = pollVotes[`${discussion.id}-${index}`];

                    return (
                      <PollOption
                        key={index}
                        onClick={() => handlePollVote(discussion.id, index)}
                        style={{
                          cursor: hasVoted ? 'default' : 'pointer',
                          opacity: hasVoted ? 0.7 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <span>{option.text || option}</span>
                          <span style={{ color: '#e50914', fontWeight: 'bold' }}>
                            {option.votes || 0} votes ({percentage}%)
                          </span>
                        </div>
                        <PollProgress>
                          <PollBar style={{ width: `${percentage}%` }} />
                        </PollProgress>
                      </PollOption>
                    );
                  })}
                  <div style={{ textAlign: 'center', marginTop: '15px', color: '#999', fontSize: '0.9rem' }}>
                    Total votes: {getTotalVotes(discussion.pollOptions)}
                  </div>
                </PollSection>
              )}

              {discussion.type === 'image' && discussion.imageUrl && (
                <ImageSection>
                  <DiscussionImage src={discussion.imageUrl} alt="Discussion" />
                </ImageSection>
              )}

              <DiscussionDate>
                {new Date(discussion.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </DiscussionDate>
            </DiscussionCard>
          ))
        )}
      </DiscussionsList>
    </DiscussionsContainer>
  );
}
