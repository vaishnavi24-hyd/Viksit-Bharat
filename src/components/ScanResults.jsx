import React, { useMemo } from 'react';
import { PhoneCall, Navigation, CheckCircle, Clock } from 'lucide-react';
import services from '../data/services';
import { calculateDistance } from '../utils/distance';

const getServiceTypes = (category) => {
  switch (category) {
    case 'Fire': return ['hospital', 'police'];
    case 'Accident': return ['hospital', 'police'];
    case 'Electrical': return ['municipal', 'police'];
    case 'Water Leakage': return ['municipal'];
    default: return ['hospital', 'police', 'municipal'];
  }
};

const getTips = (category) => {
  switch (category) {
    case 'Fire': return [
      "Evacuate the building immediately.",
      "Use stairs, do not use elevators.",
      "If there is smoke, stay low to the ground."
    ];
    case 'Accident': return [
      "Call ambulance immediately.",
      "Do not move an injured person unless they are in immediate danger.",
      "Stay calm and wait for help."
    ];
    case 'Electrical': return [
      "Avoid contact with water.",
      "Stay away from exposed wires.",
      "Do not touch the person if they are still in contact with electrical current."
    ];
    case 'Water Leakage': return [
      "Turn off the main water supply if possible.",
      "Keep away from electrical outlets and appliances.",
      "Move valuable items to higher ground."
    ];
    default: return [
      "Stay calm and ensure your own safety first.",
      "Wait for emergency services to arrive."
    ];
  }
};

const ScanResults = ({ gpsData, category, onClose }) => {
  const tips = getTips(category);
  
  const recommendations = useMemo(() => {
    const validTypes = getServiceTypes(category);
    
    // Default fallback coordinates if user gives mock SOS without real GPS
    const originLat = gpsData?.lat || 17.440;
    const originLng = gpsData?.lng || 78.380;
    
    const processed = services
      .filter(s => validTypes.includes(s.type))
      .map(s => {
        const dist = calculateDistance(originLat, originLng, s.lat, s.lng);
        return { ...s, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);

    let bestOption = null;
    const alternatives = [];

    processed.forEach(s => {
      if (!bestOption && s.status === 'Available') {
        bestOption = s;
      } else {
        alternatives.push(s);
      }
    });

    if (!bestOption && processed.length > 0) {
      bestOption = processed[0];
      alternatives.shift();
    }

    return { bestOption, alternatives };
  }, [gpsData, category]);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', maxWidth: '450px', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
        
        <h2 style={{ color: '#EF4444', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          🚑 Emergency Assistance Nearby
        </h2>
        
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#EF4444' }}>Guidance ({category})</h3>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-dark)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>

        {recommendations.bestOption && (
          <div style={{ border: '2px solid #10B981', borderRadius: '12px', padding: '1rem', backgroundColor: 'var(--bg-color)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', right: '12px', backgroundColor: 'var(--bg-color)', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>
              <CheckCircle size={14} /> Available
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Option</span>
            </div>
            
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              {recommendations.bestOption.name}
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {recommendations.bestOption.distance} km away
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={`tel:${recommendations.bestOption.phone}`} style={{ flex: 1, textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#3B82F6', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <PhoneCall size={16} /> Call
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${recommendations.bestOption.lat},${recommendations.bestOption.lng}`} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#10B981', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Navigation size={16} /> Navigate
              </a>
            </div>
          </div>
        )}

        {recommendations.alternatives.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alternatives</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recommendations.alternatives.map(alt => (
                <div key={alt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                  <div>
                    <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>{alt.name}</h5>
                    <p style={{ margin: 0, fontSize: '0.8renm', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {alt.distance} km
                      {alt.status === 'Busy' && (
                        <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px', fontSize: '0.8rem' }}>
                          <Clock size={12} /> (Busy)
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`tel:${alt.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', textDecoration: 'none' }}>
                      <PhoneCall size={16} />
                    </a>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${alt.lat},${alt.lng}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', textDecoration: 'none' }}>
                      <Navigation size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanResults;
