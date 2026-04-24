import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, MessageSquare, AlertTriangle, CheckCircle2, Heart, Eye, MessageCircle, X } from 'lucide-react';
import './Community.css';

const Community = () => {
  const { isAuthenticated, token, API_URL } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Discussions');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Create Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Road Issues');
  const [newLocation, setNewLocation] = useState('');
  
  // Reply State
  const [replyMessage, setReplyMessage] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]); // Refetch occasionally or when tab changes

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert(t('commLoginPost'));

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          location: newLocation
        })
      });
      
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        setNewLocation('');
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const handleOpenPost = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data);
        // Update views locally in the list as well to match
        setPosts(posts.map(p => p._id === postId ? { ...p, views: p.views + 1 } : p));
      }
    } catch (err) {
      console.error('Error fetching post details:', err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert(t('commLoginReply'));
    if (!replyMessage.trim()) return;

    try {
      const res = await fetch(`${API_URL}/posts/${selectedPost._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      
      if (res.ok) {
        const newReply = await res.json();
        setSelectedPost({
          ...selectedPost,
          replies: [...(selectedPost.replies || []), newReply]
        });
        setReplyMessage('');
        // Also update reply count in main list
        setPosts(posts.map(p => p._id === selectedPost._id ? { ...p, replyCount: (p.replyCount || 0) + 1 } : p));
      }
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  const getCategoryTheme = (category) => {
    if (category?.includes('Road')) return 'badge-road';
    if (category?.includes('Water')) return 'badge-water';
    if (category?.includes('Electricity')) return 'badge-electricity';
    if (category?.includes('Sanitation')) return 'badge-sanitation';
    return 'badge-default';
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  // Mock aggregates for Sidebar/Top Stats
  const activeUsers = 2540;
  const issuesReported = posts.length + 124; // Mock adding some baseline
  const solutionsFound = 89;

  const filteredPosts = activeTab === 'Reported Issues' 
    ? posts.filter(p => ['Road Issues', 'Water', 'Electricity', 'Sanitation'].includes(p.category))
    : posts;

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>{t('commTitle')}</h1>
        <p>{t('commSub')}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card bg-orange-gradient">
          <div className="stat-info">
            <h3>{activeUsers.toLocaleString()}+</h3>
            <p>{t('commActUsers')}</p>
          </div>
          <div className="stat-icon"><Users size={32} /></div>
        </div>
        <div className="stat-card bg-blue-gradient">
          <div className="stat-info">
            <h3>{posts.length || 0}</h3>
            <p>{t('commRecentDisc')}</p>
          </div>
          <div className="stat-icon"><MessageSquare size={32} /></div>
        </div>
        <div className="stat-card bg-purple-gradient">
          <div className="stat-info">
            <h3>{issuesReported}</h3>
            <p>{t('commIssRep')}</p>
          </div>
          <div className="stat-icon"><AlertTriangle size={32} /></div>
        </div>
        <div className="stat-card bg-green-gradient">
          <div className="stat-info">
            <h3>{solutionsFound}</h3>
            <p>{t('commSolFound')}</p>
          </div>
          <div className="stat-icon"><CheckCircle2 size={32} /></div>
        </div>
      </div>

      <div className="community-main">
        <div className="feed-section">
          
          <div className="post-input-bar">
            {isAuthenticated ? (
              <div className="avatar" style={{width: 36, height: 36, fontSize: '1rem'}}>
                V
              </div>
            ) : null}
            <input 
              type="text" 
              placeholder={t('commWriteComment')}
              onClick={() => isAuthenticated ? setIsCreateModalOpen(true) : alert(t('commLoginDisc'))}
              readOnly
            />
            <select>
              <option>{t('commAllTopics')}</option>
              <option>{t('commCatRoad')}</option>
              <option>{t('commCatWater')}</option>
              <option>{t('commCatElec')}</option>
              <option>{t('commCatSan')}</option>
            </select>
            <button className="btn-start-discussion" onClick={() => isAuthenticated ? setIsCreateModalOpen(true) : alert(t('commLoginDisc'))}>
              {t('commStartDisc')}
            </button>
          </div>

          <div className="community-tabs">
            <button 
              className={`tab-button ${activeTab === 'Discussions' ? 'active' : ''}`}
              onClick={() => setActiveTab('Discussions')}
            >
              {t('commTabDisc')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'Reported Issues' ? 'active' : ''}`}
              onClick={() => setActiveTab('Reported Issues')}
            >
              {t('commTabRep')}
            </button>
          </div>

          <div className="post-list">
            {filteredPosts.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666'}}>{t('commNoPosts')}</p>
            ) : (
              filteredPosts.map(post => (
                <div key={post._id} className="post-card" onClick={() => handleOpenPost(post._id)}>
                  <div className="post-header">
                    <div className="post-user-info">
                      <div className="avatar">
                        {post.username ? post.username.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="post-meta">
                        <h4>{post.username}</h4>
                        <span>{post.userLocation || post.location} • {getTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    <span className={`category-badge ${getCategoryTheme(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                  <div className="post-footer">
                    <button className="footer-action">
                      <Heart size={18} /> {post.likes}
                    </button>
                    <button className="footer-action">
                      <MessageCircle size={18} /> {post.replyCount || 0}
                    </button>
                    <button className="footer-action" style={{marginLeft: 'auto'}}>
                      <Eye size={18} /> {post.views}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-widget">
            <h3>{t('commTrendTopic')}</h3>
            <div className="trending-list">
              <div className="trending-item">
                <span className="hashtag">#RoadSafety</span>
                <span className="post-count">124 posts</span>
              </div>
              <div className="trending-item">
                <span className="hashtag">#CleanWater</span>
                <span className="post-count">89 posts</span>
              </div>
              <div className="trending-item">
                <span className="hashtag">#DigitalIndia</span>
                <span className="post-count">67 posts</span>
              </div>
              <div className="trending-item">
                <span className="hashtag">#Education</span>
                <span className="post-count">45 posts</span>
              </div>
            </div>
          </div>

          <div className="sidebar-widget">
            <h3>{t('commTopCont')}</h3>
            <div className="contributors-list">
              <div className="contributor-item">
                <div className="avatar">R</div>
                <div className="contributor-info">
                  <h4>Rahul Sharma</h4>
                </div>
                <span className="rank">#1</span>
              </div>
              <div className="contributor-item">
                <div className="avatar">P</div>
                <div className="contributor-info">
                  <h4>Priya Singh</h4>
                </div>
                <span className="rank">#2</span>
              </div>
              <div className="contributor-item">
                <div className="avatar">A</div>
                <div className="contributor-info">
                  <h4>Amit Patel</h4>
                </div>
                <span className="rank">#3</span>
              </div>
            </div>
          </div>

          <div className="sidebar-widget cta-card">
            <h3>{t('commJoinConv')}</h3>
            <p>{t('commYourOp')}</p>
            <button className="btn-cta" onClick={() => isAuthenticated ? setIsCreateModalOpen(true) : alert(t('commLoginDisc'))}>
              {t('commStartDiscBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setIsCreateModalOpen(false)}><X /></button>
            <h2>{t('commCreateTitle')}</h2>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>{t('commFormTitle')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder={t('commFormTitlePlc')}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('commFormCat')}</label>
                <select 
                  className="form-control"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                >
                  <option value="Road Issues">{t('commCatRoad')}</option>
                  <option value="Water">{t('commCatWater')}</option>
                  <option value="Electricity">{t('commCatElec')}</option>
                  <option value="Sanitation">{t('commCatSan')}</option>
                  <option value="Other">{t('commCatOther')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('commFormLoc')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder={t('commFormLocPlc')}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('commFormDesc')}</label>
                <textarea 
                  className="form-control" 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder={t('commFormDescPlc')}
                  required 
                />
              </div>
              <button type="submit" className="btn-submit">{t('commPostDiscBtn')}</button>
            </form>
          </div>
        </div>
      )}

      {/* View Post Detail Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setSelectedPost(null)}><X /></button>
            <div className="post-header">
              <div className="post-user-info">
                <div className="avatar">
                  {selectedPost.username ? selectedPost.username.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="post-meta">
                  <h4>{selectedPost.username}</h4>
                  <span>{selectedPost.userLocation || selectedPost.location} • {getTimeAgo(selectedPost.createdAt)}</span>
                </div>
              </div>
              <span className={`category-badge ${getCategoryTheme(selectedPost.category)}`}>
                {selectedPost.category}
              </span>
            </div>
            
            <h2>{selectedPost.title}</h2>
            <div className="post-details-content">
              {selectedPost.description}
            </div>
            
            <div className="post-footer" style={{paddingBottom: 16, borderBottom: 'none'}}>
              <span className="footer-action" style={{cursor: 'default'}}>
                <Eye size={18} /> {selectedPost.views} {t('commViews')}
              </span>
            </div>

            <div className="replies-section">
              <h3>{t('commReplies')} ({selectedPost.replies?.length || 0})</h3>
              
              <div className="reply-list">
                {selectedPost.replies?.map((reply, index) => (
                  <div key={index} className="reply-card">
                    <div className="reply-header">
                      <div className="avatar">
                        {reply.username ? reply.username.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <h5>{reply.username}</h5>
                      <span>• {getTimeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="reply-content">{reply.message}</p>
                  </div>
                ))}
              </div>

              {isAuthenticated ? (
                <form className="reply-input-box" onSubmit={handleReplySubmit}>
                  <input 
                    type="text" 
                    placeholder={t('commWriteReply')}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                  />
                  <button type="submit" className="btn-send-reply">{t('commBtnReply')}</button>
                </form>
              ) : (
                <p style={{color: '#666'}}>{t('commLoginPostReply')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
