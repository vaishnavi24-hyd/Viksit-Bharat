import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import { MessageSquare } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          backgroundColor: '#F97316',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
        }}
        aria-label="Chat Assistant"
      >
        <MessageSquare size={28} />
      </button>

      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatWidget;
