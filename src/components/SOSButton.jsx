import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './SOSButton.css';

const SOSButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { API_URL, token } = useAuth();

  const handleTrigger = () => {
    setLoading(true);

    const triggerAPI = async (lat, lng) => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        };

        const payload = {
          type: "Emergency",
          description: "SOS triggered",
          latitude: lat,
          longitude: lng,
          status: "Submitted"
        };

        const response = await axios.post(`${API_URL}/sos`, payload, config);

        if (response.status === 201) {
          alert("SOS sent successfully");
          setShowModal(false);
          navigate('/complaints');
        } else {
          alert("Failed to send SOS. Please call emergency services directly.");
        }
      } catch (error) {
        console.error("Error sending SOS:", error);
        alert("Failed to send SOS. Please call emergency services directly.");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          triggerAPI(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Location unavailable:", error);
          // Do NOT block SOS if location fails
          triggerAPI(null, null);
        }
      );
    } else {
      triggerAPI(null, null);
    }
  };

  return (
    <>
      <button 
        className="sos-floating-button" 
        onClick={() => setShowModal(true)}
      >
        🚨
      </button>

      {showModal && (
        <div className="sos-modal-overlay">
          <div className="sos-modal-content">
            <h2>Are you in an emergency situation?</h2>
            <p>This will send an immediate high-priority alert to authorities.</p>
            <div className="sos-modal-actions">
              <button 
                className="sos-btn-cancel" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                CANCEL
              </button>
              <button 
                className="sos-btn-confirm" 
                onClick={handleTrigger}
                disabled={loading}
              >
                {loading ? "SENDING..." : "YES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
