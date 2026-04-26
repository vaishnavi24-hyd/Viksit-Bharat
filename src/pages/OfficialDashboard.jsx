import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import AreaBarChart from '../components/charts/AreaBarChart';
import TrendLineChart from '../components/charts/TrendLineChart';

const OfficialDashboard = () => {
  const { API_URL } = useAuth();
  const { t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [insightsRes, emergenciesRes, complaintsRes] = await Promise.all([
        axios.get(`${API_URL}/official/insights`),
        axios.get(`${API_URL}/official/emergencies`),
        axios.get(`${API_URL}/official/complaints`)
      ]);
      setInsights(insightsRes.data);
      setEmergencies(emergenciesRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch official insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>{t('loading')}</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#16A34A' }}>{t('officialDashTitle')}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('officialDashSub')}</p>

      {/* Emergency Alerts Table */}
      {emergencies.length > 0 && (
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.1)', overflow: 'hidden', transition: 'all 0.3s ease', marginBottom: '2.5rem', border: '1px solid #fee2e2' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef2f2' }}>
            <span style={{ backgroundColor: '#EF4444', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>🚨 HIGH PRIORITY</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#EF4444' }}>Emergency SOS Alerts</h3>
          </div>
          <div style={{ overflowX: 'auto', padding: '0 1.5rem 1.5rem' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>ID / Category</th>
                  <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Description</th>
                  <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Location</th>
                  <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {emergencies.map((c, i) => {
                  const dateStr = new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <tr key={c._id || i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '1.2rem 0' }}>
                        <div style={{ fontWeight: '700', color: '#EF4444', fontSize: '0.95rem' }}>{c.category}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>CMP-{c._id?.substring(c._id.length - 4).toUpperCase()}</div>
                      </td>
                      <td style={{ color: 'var(--text-dark)', fontSize: '0.9rem', maxWidth: '300px' }}>{c.description}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {c.latitude ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : 'Location Locked'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{dateStr}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f0fdf4' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#15803d' }}>{t('totalComplaints')}</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16A34A' }}>{insights.totalComplaints}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-color)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#c2410c' }}>{t('resolutionRate')}</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F97316' }}>{insights.resolutionRate}</p>
        </div>
      </div>



      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Category Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>{t('categoryDistribution')}</h3>
          <CategoryPieChart />
        </div>

        {/* Top Areas */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>{t('topAreas')}</h3>
          <AreaBarChart />
        </div>

      </div>

      {/* Trend Over Time */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>{t('complaintsOverTime')}</h3>
        <TrendLineChart />
      </div>
    </div>
  );
};

export default OfficialDashboard;
