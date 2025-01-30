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
      // Get the current URL
      const currentUrl = window.location.href;
      
      // Check if we have the GitHub Pages redirect pattern
      if (currentUrl.includes('?/')) {
        // Extract the real path
        const basePath = currentUrl.split('?/')[0];
        const actualPath = currentUrl.split('?/')[1].split('?')[0];
        
        // Clean up any ~and~ in the query parameters
        const searchParams = new URLSearchParams(window.location.search);
        const cleanedSearch = searchParams.toString().replace(/~and~/g, '&');
        
        // Reconstruct the URL
        const cleanedUrl = `${basePath}#/${actualPath}${cleanedSearch ? `?${cleanedSearch}` : ''}`;
        
        // Update the URL without causing a page reload
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