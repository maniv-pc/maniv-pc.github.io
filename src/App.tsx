// App.tsx
import React from 'react';
import MainWebsite from './pages/main/MainWebsite';
import AdminApp from './pages/admin/AdminApp';
import PortalApp from './pages/portal/PortalApp';
import { AuthProvider } from './context/auth';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

import { HashRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/portal/*" element={<PortalApp />} />
          <Route path="/" element={<MainWebsite />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;