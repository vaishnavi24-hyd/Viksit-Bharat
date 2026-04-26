import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import SOSButton from './components/SOSButton';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import Schemes from './pages/Schemes';
import Report from './pages/Report';
import Complaints from './pages/Complaints';
import VerifyDocuments from './pages/VerifyDocuments';
import Community from './pages/Community';
import CommunityLeaders from './pages/CommunityLeaders';
import AdminDashboard from './pages/AdminDashboard';
import OfficialDashboard from './pages/OfficialDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

import { syncRequests } from './utils/syncService';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      syncRequests();
    };

    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="app-container">

              {!isOnline && (
                <div style={{
                  background: '#EF4444',
                  color: 'white',
                  textAlign: 'center',
                  padding: '8px',
                  fontWeight: 'bold'
                }}>
                  ⚠️ Offline Mode – Data will sync later
                </div>
              )}

              <Navbar />

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/official/dashboard" element={<ProtectedRoute allowedRole="official"><OfficialDashboard /></ProtectedRoute>} />
                  <Route path="/schemes" element={<Schemes />} />
                  <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
                  <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
                  <Route path="/verify-documents" element={<ProtectedRoute><VerifyDocuments /></ProtectedRoute>} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/community-leaders" element={<CommunityLeaders />} />
                </Routes>
              </main>

              <ChatWidget />
              <SOSButton />

            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;