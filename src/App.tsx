import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainWebsite from './pages/main/MainWebsite';
import AdminApp from './pages/admin/AdminApp';
import PortalApp from './pages/portal/PortalApp';
import { AuthProvider } from './context/auth';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

const App = () => {
  // Clean up the URL on initial load
  useEffect(() => {
    const cleanUrl = () => {
      const currentUrl = window.location.href;
      const cleanedUrl = currentUrl.replace(/(\?\/&\/~and~)+/g, '');
      if (currentUrl !== cleanedUrl) {
        window.history.replaceState(null, '', cleanedUrl);
      }
    };

    cleanUrl();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/portal/*" element={<PortalApp />} />
          <Route path="/" element={<MainWebsite />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;