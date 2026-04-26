import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

  const toggleCamera = useCallback((e) => {
    e.preventDefault();
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  }, []);

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: facingMode
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      } else {
        setError("Failed to capture image. Please try again.");
      }
    }
  }, [webcamRef, onCapture]);

  const onUserMediaError = useCallback((err) => {
    console.error("Camera access error:", err);
    setError("Camera not supported. Please upload image instead.");
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
      
      {/* Header / Controls */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '10px', zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }}>
        <span style={{ color: 'white', fontWeight: 500 }}>Take Photo</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={toggleCamera}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
            title="Switch Camera"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {error ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#fca5a5' }}>
          <p>{error}</p>
          <button 
            onClick={onClose} 
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={onUserMediaError}
            style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
          />

          {/* Capture Button Area */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '15px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)' }}>
            <button 
              onClick={(e) => {
                 e.preventDefault(); // Prevent form submission if inside a form
                 capture();
              }}
              style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
            >
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white' }}></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
