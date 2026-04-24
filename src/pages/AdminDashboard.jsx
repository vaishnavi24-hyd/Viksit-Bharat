import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, FileText, Clock, PlayCircle, CheckCircle, Edit } from 'lucide-react';
import ImageModal from '../components/ImageModal';
import ResolveModal from '../components/ResolveModal';
import { useLanguage } from '../context/LanguageContext';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import AreaBarChart from '../components/charts/AreaBarChart';
import GeoInsightsList from '../components/GeoInsightsList';

const AdminDashboard = () => {
  const { API_URL } = useAuth();
  const { t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeResolveComplaint, setActiveResolveComplaint] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [insightsRes, complaintsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/insights`),
        axios.get(`${API_URL}/admin/complaints`)
      ]);
      setInsights(insightsRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const updateStatus = async (id, status, afterImage = null, resolutionRemark = '') => {
    try {
      const payload = { status };
      if (afterImage) payload.afterImage = afterImage;
      if (resolutionRemark) payload.resolutionRemark = resolutionRemark;

      const res = await axios.put(`${API_URL}/complaints/${id}/status`, payload);
      
      // Instantly update UI without reload
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: res.data.status || status, afterImage: res.data.afterImage || c.afterImage } : c));
      
      // Update insights counts dynamically if we want
      if (insights) {
        const updatedInsights = { ...insights };
        if (status === 'Resolved') {
          updatedInsights.resolvedComplaints += 1;
        }
        setInsights(updatedInsights);
      }

      showToast('Status updated successfully');
      setActiveResolveComplaint(null);
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      await axios.put(`${API_URL}/admin/complaints/${id}/priority`, { priority });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update priority');
    }
  };

  const closeComplaint = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/complaints/${id}/close`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close complaint.');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    if (filterCategory !== 'All' && c.issueType !== filterCategory) return false;
    return true;
  });

  const filteredAndSortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (a.type === 'Emergency' && b.type !== 'Emergency') return -1;
    if (a.type !== 'Emergency' && b.type === 'Emergency') return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getStatusBadge = (status) => {
    if (status === 'Pending' || status === 'Submitted') return <span style={{ color: '#fff', backgroundColor: '#EF4444', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>{t(`comp${status}`) || status || 'Pending'}</span>;
    if (status === 'In Progress') return <span style={{ color: '#fff', backgroundColor: '#F97316', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>{t('compInProgress') || 'In Progress'}</span>;
    if (status === 'Resolved' || status === 'Closed') return <span style={{ color: '#fff', backgroundColor: '#16A34A', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>{t(`comp${status}`) || status}</span>;
    return <span style={{ color: 'var(--text-dark)', backgroundColor: '#E5E7EB', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>{status}</span>;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dark)' }}>{t('loading') || 'Loading...'}</div>;
  if (error) return <div style={{ color: '#EF4444', textAlign: 'center', padding: '2rem' }}>{error}</div>;

  return (
    <div className="page-container" style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-dark)', transition: 'all 0.3s ease' }}>
      
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#10B981', color: 'white', padding: '1rem 2rem', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'fadeIn 0.3s' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>{t('adminDashTitle') || 'Admin Dashboard'} {complaints.some(c => c.type === 'Emergency' && c.status !== 'Closed') && <span style={{backgroundColor: '#EF4444', color: 'white', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold'}}>🚨 URGENT SOS PENDING</span>}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Overview of civic complaints and resolutions.</p>
      </div>
      
      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <FileText size={20} />
            </div>
            <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: '600' }}>+12%</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginTop: '1rem', marginBottom: '0.25rem' }}>{insights.totalComplaints}</p>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Complaints</h3>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
              <Clock size={20} />
            </div>
            <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: '600' }}>-5%</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginTop: '1rem', marginBottom: '0.25rem' }}>{insights.pendingComplaints}</p>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Pending</h3>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316' }}>
              <PlayCircle size={20} />
            </div>
            <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: '600' }}>+8%</span>
          </div>
          {/* Simple calc for in progress */}
          <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginTop: '1rem', marginBottom: '0.25rem' }}>{Math.max(0, insights.totalComplaints - insights.pendingComplaints - insights.resolvedComplaints)}</p>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>In Progress</h3>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <CheckCircle size={20} />
            </div>
            <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: '600' }}>+18%</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginTop: '1rem', marginBottom: '0.25rem' }}>{insights.resolvedComplaints}</p>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Resolved</h3>
        </div>

      </div>

      {/* Geo Insights Section */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', marginBottom: '2.5rem', transition: 'all 0.3s ease' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-dark)' }}>Geo Insights</h3>
        <GeoInsightsList complaints={complaints} />
      </div>

      {/* Chart Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', transition: 'all 0.3s ease' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Complaints by Category</h3>
          <CategoryPieChart />
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', transition: 'all 0.3s ease' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Complaints by Area</h3>
          <AreaBarChart />
        </div>

      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.03)', overflow: 'hidden', transition: 'all 0.3s ease' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-dark)' }}>Recent Complaints</h3>
        </div>
        <div style={{ overflowX: 'auto', padding: '0 1.5rem 1.5rem' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>ID / Description</th>
                <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Area</th>
                <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedComplaints.length > 0 ? filteredAndSortedComplaints.map((c, i) => {
                const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                return (
                <tr key={c._id || i} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s', backgroundColor: c.type === 'Emergency' ? '#fef2f2' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = c.type === 'Emergency' ? '#fee2e2' : '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.backgroundColor = c.type === 'Emergency' ? '#fef2f2' : 'transparent'}>
                  <td style={{ padding: '1.2rem 0' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      CMP-{c._id?.substring(c._id.length - 4).toUpperCase() || 'XXX'}
                      {c.type === 'Emergency' && <span style={{ backgroundColor: '#EF4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>🚨 SOS</span>}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{c.title}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.address ? (c.address.split(',')[0].length > 15 ? c.address.substring(0,15)+'...' : c.address.split(',')[0]) : 'Zone A'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.type === 'Emergency' ? c.category : c.issueType}</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{dateStr}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(c.status !== 'Closed' && c.status !== 'Resolved') && (
                        <button 
                          onClick={() => setActiveResolveComplaint(c)} 
                          style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: 'var(--card-bg)', color: '#3B82F6', border: '1px solid #3B82F6', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#3B82F6'; e.currentTarget.style.color = '#FFFFFF'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#3B82F6'; }}
                        >
                          <Edit size={14} /> Update
                        </button>
                      )}
                      {(c.imageUrl || c.beforeImage || c.afterImage) && (
                        <button 
                          onClick={() => setSelectedImage({ imageUrl: c.imageUrl, beforeImage: c.beforeImage, afterImage: c.afterImage })} 
                          title="View Evidence"
                          style={{ padding: '6px', fontSize: '0.85rem', backgroundColor: '#F3F4F6', color: 'var(--text-muted)', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#E5E7EB'; e.currentTarget.style.color = 'var(--text-dark)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <ImageIcon size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeResolveComplaint && (
        <ResolveModal 
          complaint={activeResolveComplaint}
          onClose={() => setActiveResolveComplaint(null)}
          onSave={updateStatus}
        />
      )}

      {selectedImage && (
        <ImageModal 
          images={selectedImage} 
          onClose={() => setSelectedImage(null)} 
          title={t('evidenceTitle') || 'Evidence'}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;
