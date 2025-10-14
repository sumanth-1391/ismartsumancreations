import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-deployed-server.com'
  : 'http://localhost:5001';

const ADMIN_PASSWORD = 'Isc139'; // Change this to your desired password

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    categories: []
  });
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: ''
  });
  const [editingVideo, setEditingVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos', 'announcements', or 'discussions'
  const [discussions, setDiscussions] = useState([]);
  const [discussionFormData, setDiscussionFormData] = useState({
    title: '',
    content: '',
    type: 'text', // 'text', 'poll', 'image'
    pollOptions: ['', ''],
    imageFile: null
  });

  useEffect(() => {
    // Load uploaded videos from server
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/videos`);
        if (response.ok) {
          const videos = await response.json();
          setVideos(videos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    // Load announcements from server
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/announcements`);
        if (response.ok) {
          const announcements = await response.json();
          setAnnouncements(announcements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    // Load discussions from server
    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/discussions`);
        if (response.ok) {
          const discussions = await response.json();
          setDiscussions(discussions);
        }
      } catch (error) {
        console.error('Error fetching discussions:', error);
      }
    };

    fetchVideos();
    fetchAnnouncements();
    fetchDiscussions();
  }, []);

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiscussionInputChange = (e) => {
    const { name, value } = e.target;
    setDiscussionFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiscussionTypeChange = (type) => {
    setDiscussionFormData(prev => ({ ...prev, type, pollOptions: type === 'poll' ? ['', ''] : prev.pollOptions }));
  };

  const handlePollOptionChange = (index, value) => {
    setDiscussionFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.map((option, i) => i === index ? value : option)
    }));
  };

  const addPollOption = () => {
    setDiscussionFormData(prev => ({
      ...prev,
      pollOptions: [...prev.pollOptions, '']
    }));
  };

  const removePollOption = (index) => {
    if (discussionFormData.pollOptions.length > 2) {
      setDiscussionFormData(prev => ({
        ...prev,
        pollOptions: prev.pollOptions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setDiscussionFormData(prev => ({ ...prev, imageFile: file }));
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();

    if (!discussionFormData.title || !discussionFormData.content) {
      alert('Please fill in all required fields');
      return;
    }

    if (discussionFormData.type === 'poll' && discussionFormData.pollOptions.some(option => !option.trim())) {
      alert('Please fill in all poll options');
      return;
    }

    const formData = new FormData();
    formData.append('title', discussionFormData.title);
    formData.append('content', discussionFormData.content);
    formData.append('type', discussionFormData.type);

    if (discussionFormData.type === 'poll') {
      formData.append('pollOptions', JSON.stringify(discussionFormData.pollOptions));
    }

    if (discussionFormData.type === 'image' && discussionFormData.imageFile) {
      formData.append('image', discussionFormData.imageFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newDiscussion = await response.json();
        setDiscussions(prev => [...prev, newDiscussion]);
        setDiscussionFormData({
          title: '',
          content: '',
          type: 'text',
          pollOptions: ['', ''],
          imageFile: null
        });
        alert('Discussion posted successfully!');
      } else {
        alert('Failed to post discussion');
      }
    } catch (error) {
      console.error('Error posting discussion:', error);
      alert('Error posting discussion');
    }
  };

  const handleDeleteDiscussion = async (id) => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDiscussions(prev => prev.filter(discussion => discussion.id !== id));
        alert('Discussion deleted successfully!');
      } else {
        alert('Failed to delete discussion');
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert('Error deleting discussion');
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();

    if (!announcementFormData.title || !announcementFormData.content) {
      alert('Please fill in all fields for the announcement');
      return;
    }

    const newAnnouncement = {
      id: Date.now().toString(),
      title: announcementFormData.title,
      content: announcementFormData.content,
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAnnouncement),
      });

      if (response.ok) {
        setAnnouncements(prev => [...prev, newAnnouncement]);
        setAnnouncementFormData({ title: '', content: '' });
        alert('Announcement posted successfully!');
      } else {
        alert('Failed to post announcement');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      alert('Error posting announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
        alert('Announcement deleted successfully!');
      } else {
        alert('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement');
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.url) {
      alert('Please fill in all fields');
      return;
    }

    // Extract YouTube video ID and generate thumbnail URL
    const getYouTubeVideoId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeVideoId(formData.url);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    // Use YouTube's maxres thumbnail, fallback to high quality
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const videoData = {
      id: editingVideo ? editingVideo.id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      url: formData.url,
      thumbnail: thumbnailUrl,
      publishedAt: editingVideo ? editingVideo.publishedAt : new Date().toISOString(),
      viewCount: editingVideo ? editingVideo.viewCount : 0,
      likeCount: editingVideo ? editingVideo.likeCount : 0,
      duration: editingVideo ? editingVideo.duration : 'N/A',
      categories: formData.categories
    };

    try {
      const method = editingVideo ? 'PUT' : 'POST';
      const url = editingVideo ? `${API_BASE_URL}/api/videos/${editingVideo.id}` : `${API_BASE_URL}/api/videos`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      });

      if (response.ok) {
        if (editingVideo) {
          const updatedVideos = videos.map(video =>
            video.id === editingVideo.id ? videoData : video
          );
          setVideos(updatedVideos);
          alert('Video updated successfully!');
          // Notify app to refresh displayed videos
          window.dispatchEvent(new Event('uploadedVideosChanged'));
        } else {
          // Create announcement for new video upload
          const announcement = {
            id: Date.now().toString(),
            title: `New Video Uploaded: ${formData.title}`,
            content: `Check out our latest video "${formData.title}" now available on ISMART SUMAN CREATIONS! ${formData.description}`,
            createdAt: new Date().toISOString()
          };

          const announcementResponse = await fetch(`${API_BASE_URL}/api/announcements`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(announcement),
          });

          if (!announcementResponse.ok) {
            console.error('Failed to create announcement, but video was uploaded successfully');
          }

          const updatedVideos = [...videos, videoData];
          setVideos(updatedVideos);
          alert('Video uploaded successfully! Users will be notified through announcements.');
          // Notify app to refresh displayed videos
          window.dispatchEvent(new Event('uploadedVideosChanged'));
        }

        // Reset form
        setFormData({
          title: '',
          description: '',
          url: '',
          categories: []
        });
        setEditingVideo(null);
      } else {
        // Use the requested user-facing message
        alert('Unable to upload the video right now. Please try again or check server logs for details.');
      }
    } catch (error) {
      console.error(`Error ${editingVideo ? 'updating' : 'uploading'} video:`, error);
      // Provide more helpful guidance
      alert(`There was a problem ${editingVideo ? 'updating' : 'uploading'} the video. Check your network connection and try again. If the problem persists, verify the server is running at ${API_BASE_URL} and check server logs.`);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      url: video.url,
      categories: video.categories || []
    });
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      categories: []
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedVideos = videos.filter(video => video.id !== id);
        setVideos(updatedVideos);
        alert('Video deleted successfully!');
        // Notify app to refresh displayed videos
        window.dispatchEvent(new Event('uploadedVideosChanged'));
      } else {
        alert('Failed to delete video. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video. Please check your connection.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#141414', color: '#fff', fontFamily: 'Roboto, sans-serif', padding: '20px' }}>
        <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: '1000' }}>
          <img src="/logo.png" alt="ISMART SUMAN CREATIONS Logo" style={{ height: '60px', width: 'auto', cursor: 'pointer' }} onClick={() => window.location.href = '/'} />
        </div>
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: '1000' }}>
          <button onClick={() => window.location.href = '/'} style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>← Back to Home</button>
        </div>
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px', background: 'rgba(0, 0, 0, 0.8)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
          <h2>Admin Login</h2>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px' }}
            />
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#141414', color: '#fff', fontFamily: 'Roboto, sans-serif', padding: '20px' }}>
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: '1000' }}>
        <img src="/logo.png" alt="ISMART SUMAN CREATIONS Logo" style={{ height: '60px', width: 'auto', cursor: 'pointer' }} onClick={() => window.location.href = '/'} />
      </div>
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: '1000' }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>← Back to Home</button>
      </div>
      <h1>Admin Panel</h1>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '40px', display: 'flex', gap: '10px', borderBottom: '2px solid #333', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('videos')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'videos' ? '#e50914' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          📹 Upload Videos ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'announcements' ? '#e50914' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          📢 Manage Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('discussions')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'discussions' ? '#e50914' : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          💬 Discussions & Polls ({discussions.length})
        </button>
      </div>

      {/* Admin Data Summary */}
      <div style={{ marginBottom: '40px', padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}>
        <h2>Admin Panel Data</h2>
        <div>
          <p><strong>Uploaded Videos:</strong> {videos.length}</p>
          <p><strong>Posted Announcements:</strong> {announcements.length}</p>
          <p><strong>Discussions & Polls:</strong> {discussions.length}</p>
          <p><strong>Sync Status:</strong> Active (changes sync to main page)</p>
        </div>
      </div>

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <>
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', background: 'rgba(0, 0, 0, 0.8)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
            <h2>{editingVideo ? 'Edit Video' : 'Upload New Video'}</h2>
            {editingVideo && (
              <div style={{ marginBottom: '20px', padding: '10px', background: '#333', borderRadius: '4px' }}>
                <p style={{ margin: '0', color: '#fff' }}>Editing: <strong>{editingVideo.title}</strong></p>
              </div>
            )}
            <input
              type="text"
              name="title"
              placeholder="Video Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px' }}
            />
            <textarea
              name="description"
              placeholder="Video Description"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px', minHeight: '100px', resize: 'vertical' }}
            />
            <input
              type="url"
              name="url"
              placeholder="YouTube URL"
              value={formData.url}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px' }}
            />
            <div style={{ margin: '20px 0' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#fff', fontSize: '16px' }}>Categories (select multiple):</label>
              {['ISC Originals', 'Most Viewed Videos', 'Trending Now'].map(category => (
                <label key={category} style={{ display: 'block', marginBottom: '8px', color: '#ddd' }}>
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    style={{ marginRight: '10px' }}
                  />
                  {category}
                </label>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Thumbnail will be automatically fetched from YouTube.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
                {editingVideo ? 'Update Video' : 'Upload Video'}
              </button>
              {editingVideo && (
                <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '12px', background: '#666', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div style={{ marginTop: '40px' }}>
            <h2>Uploaded Videos</h2>
            {videos.length === 0 ? (
              <p>No videos uploaded yet.</p>
            ) : (
              videos.map(video => (
                <div key={video.id} style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', margin: '10px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>{video.title}</h3>
                    <p>{video.description.substring(0, 100)}...</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleEdit(video)} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(video.id)} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', background: 'rgba(0, 0, 0, 0.8)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
            <h2>Post New Announcement</h2>
            <form onSubmit={handleAnnouncementSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Announcement Title"
                value={announcementFormData.title}
                onChange={handleAnnouncementInputChange}
                required
                style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px' }}
              />
              <textarea
                name="content"
                placeholder="Announcement Content"
                value={announcementFormData.content}
                onChange={handleAnnouncementInputChange}
                required
                style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px', minHeight: '120px', resize: 'vertical' }}
              />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>Post Announcement</button>
            </form>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2>Posted Announcements</h2>
            {announcements.length === 0 ? (
              <p>No announcements posted yet.</p>
            ) : (
              announcements.map(announcement => (
                <div key={announcement.id} style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', margin: '10px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>{announcement.title}</h3>
                    <p>{announcement.content.substring(0, 100)}...</p>
                    <small style={{ color: '#999' }}>{new Date(announcement.createdAt).toLocaleDateString()}</small>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(announcement.id)} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', background: 'rgba(0, 0, 0, 0.8)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
            <h2>Create Discussion, Poll, or Image Post</h2>
            <form onSubmit={handleDiscussionSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#fff', fontSize: '16px' }}>Post Type:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'text', label: '💬 Text Discussion', icon: '💬' },
                    { value: 'poll', label: '📊 Poll', icon: '📊' },
                    { value: 'image', label: '🖼️ Image Post', icon: '🖼️' }
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleDiscussionTypeChange(type.value)}
                      style={{
                        padding: '10px 15px',
                        background: discussionFormData.type === type.value ? '#e50914' : 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                name="title"
                placeholder="Discussion Title"
                value={discussionFormData.title}
                onChange={handleDiscussionInputChange}
                required
                style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px' }}
              />

              <textarea
                name="content"
                placeholder={discussionFormData.type === 'poll' ? 'Poll Question/Description' : 'Discussion Content'}
                value={discussionFormData.content}
                onChange={handleDiscussionInputChange}
                required
                style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '16px', minHeight: '100px', resize: 'vertical' }}
              />

              {discussionFormData.type === 'poll' && (
                <div style={{ margin: '20px 0' }}>
                  <label style={{ display: 'block', marginBottom: '10px', color: '#fff', fontSize: '16px' }}>Poll Options:</label>
                  {discussionFormData.pollOptions.map((option, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        style={{ flex: 1, padding: '8px', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff', fontSize: '14px' }}
                      />
                      {discussionFormData.pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          style={{ padding: '8px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPollOption}
                    style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {discussionFormData.type === 'image' && (
                <div style={{ margin: '20px 0' }}>
                  <label style={{ display: 'block', marginBottom: '10px', color: '#fff', fontSize: '16px' }}>Upload Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ width: '100%', padding: '10px', border: '1px solid #333', borderRadius: '4px', background: '#222', color: '#fff' }}
                  />
                  {discussionFormData.imageFile && (
                    <p style={{ marginTop: '10px', color: '#28a745' }}>Selected: {discussionFormData.imageFile.name}</p>
                  )}
                </div>
              )}

              <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                {discussionFormData.type === 'poll' ? '📊 Create Poll' : discussionFormData.type === 'image' ? '🖼️ Post Image' : '💬 Post Discussion'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2>Posted Discussions & Polls</h2>
            {discussions.length === 0 ? (
              <p>No discussions posted yet.</p>
            ) : (
              discussions.map(discussion => (
                <div key={discussion.id} style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', margin: '10px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px' }}>
                        {discussion.type === 'poll' ? '📊' : discussion.type === 'image' ? '🖼️' : '💬'}
                      </span>
                      <h3 style={{ margin: 0 }}>{discussion.title}</h3>
                    </div>
                    <p>{discussion.content}</p>
                    {discussion.type === 'poll' && discussion.pollOptions && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Poll Options:</strong>
                        <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                          {discussion.pollOptions.map((option, index) => (
                            <li key={index} style={{ color: '#ddd' }}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {discussion.type === 'image' && discussion.imageUrl && (
                      <div style={{ marginTop: '10px' }}>
                        <img src={discussion.imageUrl} alt="Discussion" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} />
                      </div>
                    )}
                    <small style={{ color: '#999' }}>{new Date(discussion.createdAt).toLocaleDateString()}</small>
                  </div>
                  <button onClick={() => handleDeleteDiscussion(discussion.id)} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>Delete</button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
