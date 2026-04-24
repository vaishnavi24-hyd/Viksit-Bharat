import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import BeforeAfterSlider from './BeforeAfterSlider';

const ImageModal = ({ images, onClose, title }) => {
  const { t } = useLanguage();
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      padding: isFullscreen ? 0 : '2rem'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: isFullscreen ? 0 : '12px',
        display: 'flex', flexDirection: 'column', flex: 1,
        overflow: 'hidden', ...isFullscreen ? { width: '100%', height: '100%' } : { maxWidth: '1200px', margin: '0 auto', width: '100%' }
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title || t('evidenceTitle')}</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={handleZoomOut} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={t('zoomOut')}><ZoomOut size={20}/></button>
            <button onClick={handleZoomIn} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={t('zoomIn')}><ZoomIn size={20}/></button>
            <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={t('fullscreen')}><Maximize size={20}/></button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#EF4444' }} title={t('close')}><X size={24}/></button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', backgroundColor: '#f3f4f6' }}>
          {(images.beforeImage && images.afterImage) ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <h4 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Drag the slider to compare</h4>
               <div style={{ width: '100%', flex: 1, minHeight: '500px', transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
                 <BeforeAfterSlider beforeImage={images.beforeImage} afterImage={images.afterImage} />
               </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '2rem', transform: `scale(${scale})`, transition: 'transform 0.2s', transformOrigin: 'center' }}>
              {images.beforeImage && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)', backgroundColor: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{t('beforeImage') || 'Before'}</span>
                  <img src={images.beforeImage} alt="Before" style={{ maxHeight: '60vh', maxWidth: '45vw', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </div>
              )}
              {images.afterImage && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#16A34A', backgroundColor: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{t('afterImage') || 'After'}</span>
                  <img src={images.afterImage} alt="After" style={{ maxHeight: '60vh', maxWidth: '45vw', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </div>
              )}
              {!images.beforeImage && !images.afterImage && images.imageUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)', backgroundColor: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{t('evidence') || 'Evidence'}</span>
                  <img src={images.imageUrl} alt="Evidence" style={{ maxHeight: '70vh', maxWidth: '80vw', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </div>
              )}
              {!images.beforeImage && !images.afterImage && !images.imageUrl && (
                 <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('noData') || 'No images provided.'}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
