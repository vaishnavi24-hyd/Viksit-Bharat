import React, { useState } from 'react';
import { X, Image as ImageIcon, CheckCircle, Loader, Camera, Upload } from 'lucide-react';
import CameraCapture from './CameraCapture';

const ResolveModal = ({ complaint, onClose, onSave }) => {
  const [status, setStatus] = useState(complaint?.status || 'In Progress');
  const [remark, setRemark] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!complaint) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // onSave handles API logic, passing the base64 preview
    await onSave(complaint._id, status, imagePreview, remark);
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)', borderRadius: '16px',
        width: '100%', maxWidth: '500px', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden'
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-dark)' }}>Update Complaint Status</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-dark)', fontSize: '0.95rem' }}
            >
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              After Image (Proof of Resolution) <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>(Optional)</span>
            </label>
            {showCamera ? (
              <CameraCapture 
                onCapture={(base64Img) => {
                  setImagePreview(base64Img);
                  setAfterImage(null); // Clear file since using base64
                  setShowCamera(false);
                }} 
                onClose={() => setShowCamera(false)} 
              />
            ) : !imagePreview ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--bg-color)', transition: 'all 0.2s' }}>
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                <button 
                  type="button"
                  onClick={() => setShowCamera(true)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--bg-color)', transition: 'all 0.2s' }}
                >
                  <Camera size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Open Camera</span>
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={imagePreview} alt="Resolution Details" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={() => { setAfterImage(null); setImagePreview(''); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Remove
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              Admin Remarks <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea 
              value={remark} 
              onChange={e => setRemark(e.target.value)} 
              placeholder="e.g. Pothole filled and road leveled on expected timeline."
              rows={3}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-dark)', fontSize: '0.95rem', resize: 'vertical' }}
            />
          </div>

        </div>

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} disabled={saving} style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'var(--text-dark)', cursor: 'pointer', fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', fontSize: '0.95rem', border: 'none', borderRadius: '8px', backgroundColor: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            {saving ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />} Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolveModal;
