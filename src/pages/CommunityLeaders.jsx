import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './CommunityLeaders.css';
import { Trophy, Award, Star, Medal } from 'lucide-react';

const CommunityLeaders = () => {
  const { isAuthenticated, token, API_URL, user } = useAuth();
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setLeaders(data);
          
          if (user) {
            const me = data.find(u => u._id === user.id || u.mobile === user.mobile);
            if (me) {
              setCurrentUserRank(me.rank);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, API_URL, token, user]);

  const getLevelInfo = (score) => {
    if (score >= 500) return { name: 'Civic Leader', icon: <Trophy size={16} color="#FFD700" /> };
    if (score >= 200) return { name: 'Active Citizen', icon: <Medal size={16} color="#C0C0C0" /> };
    return { name: 'Beginner', icon: <Award size={16} color="#CD7F32" /> };
  };

  if (!isAuthenticated) {
    return (
      <div className="leaders-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2>{t('navLogin')} Required</h2>
        <p>Please login to view the Community Leaders board.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="leaders-container" style={{ justifyContent: 'center', alignItems: 'center' }}><p>Loading Leaderboard...</p></div>;
  }

  // Ensure we have at least 3 for podium (mock if needed or just handle undefined gracefully)
  const top3 = [
    leaders[1] || null, // Rank 2 (Silver)
    leaders[0] || null, // Rank 1 (Gold)
    leaders[2] || null  // Rank 3 (Bronze)
  ];
  
  const remaining = leaders.slice(3);

  return (
    <div className="leaders-container">
      <div className="leaders-header">
        <h1>{t('leadersTitle') || "Community Leaders"}</h1>
        <p>{t('leadersSubTitle') || "Honoring our most active citizens contributing to Viksit Bharat"}</p>
      </div>

      {/* SECTION 1: Podium */}
      {leaders.length > 0 && (
        <div className="podium-section">
          {top3.map((leader, idx) => {
            if (!leader) return null;
            // The mapping brings Rank 2, Rank 1, Rank 3 in order.
            const podClass = idx === 0 ? 'rank-2' : idx === 1 ? 'rank-1' : 'rank-3';
            const levelInfo = getLevelInfo(leader.citizenScore);
            
            return (
              <div key={leader._id} className={`podium-card ${podClass}`}>
                <div className="podium-rank">#{leader.rank}</div>
                <div className="podium-avatar">
                  {leader.name ? leader.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="podium-details">
                  <h3>{leader.name || 'Anonymous'}</h3>
                  <div className="podium-score">{leader.citizenScore} pts</div>
                  <div className="podium-level" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    {levelInfo.icon} {levelInfo.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 2: List */}
      {remaining.length > 0 && (
        <div className="leaderboard-list">
          <div className="list-header">
            <div>{t('leadersRank') || "Rank"}</div>
            <div>{t('leadersName') || "Name"}</div>
            <div>{t('leadersScore') || "Score"}</div>
            <div>{t('leadersLevel') || "Level"}</div>
          </div>
          {remaining.map(leader => {
            const levelInfo = getLevelInfo(leader.citizenScore);
            return (
              <div key={leader._id} className="list-row">
                <div className="row-rank">#{leader.rank}</div>
                <div className="row-user">
                  <div className="row-avatar">
                    {leader.name ? leader.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span>{leader.name || 'Anonymous'}</span>
                </div>
                <div className="row-score">{leader.citizenScore} pts</div>
                <div className="row-level" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {levelInfo.icon} {levelInfo.name}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 3: Current User Highlight */}
      {currentUserRank && (
        <div className="current-user-highlight">
          <div className="highlight-left">
            <Trophy size={32} />
            <div>
              <h3>{user?.name || 'You'}</h3>
              <p>Keep participating to rise up the ranks!</p>
            </div>
          </div>
          <div className="highlight-right">
            {t('leadersYourRank') || "Your Rank"}: #{currentUserRank}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityLeaders;
