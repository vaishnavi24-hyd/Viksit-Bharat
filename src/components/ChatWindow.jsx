import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { X, Send, Mic } from 'lucide-react';
import axios from 'axios';

const ChatWindow = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { API_URL } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 1, text: t('chatGreeting'), sender: 'bot' }
      ]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;
    
    const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: textToSend,
        language: language
      });
      
      const botResponseKey = res.data.replyKey;
      const botResponseText = t(botResponseKey) || t('chatDefault');
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponseText, sender: 'bot' }]);
      speakText(botResponseText);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: t('chatDefault'), sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('chatSpeechNotSupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    const targetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN' }[language] || 'en-IN';
    recognition.lang = targetLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleSend(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (e) => {
      console.error("Speech error", e.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    
    // Auto-detect based on text or fallback to app language
    const isDevanagari = /[\u0900-\u097F]/.test(text);
    const isTelugu = /[\u0C00-\u0C7F]/.test(text);
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    const isKannada = /[\u0C80-\u0CFF]/.test(text);
    const isBengali = /[\u0980-\u09FF]/.test(text);
    
    let targetLang = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN' }[language] || 'en-IN';
    
    if (isDevanagari && language !== 'mr') targetLang = 'hi-IN';
    if (isTelugu) targetLang = 'te-IN';
    if (isTamil) targetLang = 'ta-IN';
    if (isKannada) targetLang = 'kn-IN';
    if (isBengali) targetLang = 'bn-IN';
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      
      const exactVoice = voices.find(v => 
        v.lang === targetLang || 
        v.lang === targetLang.replace('-', '_') || 
        v.lang.startsWith(targetLang.split('-')[0]) ||
        (targetLang === 'te-IN' && v.name.toLowerCase().includes('telugu')) ||
        (targetLang === 'hi-IN' && v.name.toLowerCase().includes('hindi')) ||
        (targetLang === 'ta-IN' && v.name.toLowerCase().includes('tamil')) ||
        (targetLang === 'kn-IN' && v.name.toLowerCase().includes('kannada')) ||
        (targetLang === 'mr-IN' && v.name.toLowerCase().includes('marathi')) ||
        (targetLang === 'bn-IN' && v.name.toLowerCase().includes('bengali'))
      );
      if (exactVoice) {
         utterance.voice = exactVoice;
      } else {
         const enVoice = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('english'));
         if (enVoice) utterance.voice = enVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
      // Fallback if voiceschanged doesn't fire
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) setVoiceAndSpeak();
        else window.speechSynthesis.speak(utterance);
      }, 500);
    } else {
      setVoiceAndSpeak();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', bottom: '90px', right: '24px', width: '350px', height: '500px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      
      {/* Header */}
      <div style={{ padding: '15px 20px', backgroundColor: '#16A34A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{t('chatTitle')}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0', display: 'flex' }}>
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, padding: '15px', backgroundColor: 'var(--bg-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: msg.sender === 'user' ? '#F97316' : 'var(--card-bg)', color: msg.sender === 'user' ? '#fff' : 'var(--text-dark)', padding: '12px 16px', borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: '0.95rem', lineHeight: '1.4', border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none' }}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--card-bg)', padding: '10px 16px', borderRadius: '16px 16px 16px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', border: '1px solid var(--border-color)' }}>
            {t('chatTyping')}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '15px', backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={startListening} 
          disabled={isListening}
          style={{ background: isListening ? '#fef2f2' : '#f0fdf4', border: 'none', color: isListening ? '#ef4444' : '#16A34A', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
        >
          <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder={t('chatInput')}
          style={{ flex: 1, padding: '10px 15px', borderRadius: '999px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.95rem', background: 'var(--bg-color)', color: 'var(--text-dark)' }}
        />
        <button 
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          style={{ background: '#F97316', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: input.trim() ? 'pointer' : 'not-allowed', opacity: input.trim() ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send size={18} style={{ transform: 'translateX(-2px)' }} />
        </button>
      </div>

    </div>
  );
};

export default ChatWindow;
