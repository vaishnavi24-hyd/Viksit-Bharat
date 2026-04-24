import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 50%

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '8px', minHeight: '300px', display: 'flex', justifyContent: 'center' }}>
      
      {/* Container to maintain aspect ratio/bounds */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        
        {/* Background (Before Image) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${beforeImage})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
        }}>
           <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>BEFORE</div>
        </div>

        {/* Foreground (After Image) clipping */}
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: `${sliderPosition}%`, overflow: 'hidden', borderRight: '3px solid white',
          boxShadow: '2px 0 10px rgba(0,0,0,0.3)'
        }}>
          {/* Inner image container scaled back to 100% of parent width to retain alignment */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: `${100 / (sliderPosition / 100)}%`, height: '100%',
            backgroundImage: `url(${afterImage})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            minWidth: '100vw' // Ensures it spans full necessary width for contain
          }}>
            {/* The Before and After labels */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#16A34A', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>AFTER</div>
          </div>
        </div>
        
        {/* The true overlaying After image matching exact scale for easier clipping via clipPath */}
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
            backgroundImage: `url(${afterImage})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
        }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#16A34A', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>AFTER</div>
        </div>
        

        {/* The Slider Control */}
        <input 
          type="range" 
          min="0" max="100" 
          value={sliderPosition} 
          onChange={(e) => setSliderPosition(e.target.value)}
          className="before-after-slider"
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'ew-resize', zIndex: 10
          }}
        />

        {/* Custom Draggable Thumb Visual */}
        <div style={{
          position: 'absolute', top: '50%', left: `${sliderPosition}%`, transform: 'translate(-50%, -50%)',
          width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 5
        }}>
          <ArrowLeftRight size={20} />
        </div>

        {/* Central Divider Line */}
        <div style={{
            position: 'absolute', top: 0, bottom: 0, left: `${sliderPosition}%`, width: '4px', transform: 'translateX(-50%)',
            backgroundColor: 'white', pointerEvents: 'none', zIndex: 4, boxShadow: '0 0 5px rgba(0,0,0,0.5)'
        }}></div>

      </div>
    </div>
  );
};

export default BeforeAfterSlider
