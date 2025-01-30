// App.tsx
import React from 'react';
import MainWebsite from './pages/main/MainWebsite';
import AdminApp from './pages/admin/AdminApp';
import PortalApp from './pages/portal/PortalApp';
import { AuthProvider } from './context/auth';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

const App = () => {
  const path = window.location.pathname;

  return (
    <AuthProvider>
      {path.includes('/reset-password') ? (
        <ResetPasswordPage />
      ) : path.includes('/admin') ? (
        <AdminApp />
      ) : path.includes('/portal') ? (
        <PortalApp />
      ) : (
        <MainWebsite />
      )}
    </AuthProvider>
  );
};

export default App;