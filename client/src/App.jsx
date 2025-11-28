import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TrainingSessionsPage from './pages/SchedulePage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import OfflinePage from './pages/OfflinePage.jsx';
import { useAuthContext } from './context/AuthContext.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const { bootstrap, authStatus, user } = useAuthContext();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (authStatus === 'loading' || authStatus === 'idle') {
    return (
      <div className="app-loading">
        <div className="spinner" role="status" aria-live="polite" />
        <p>Loading sports drills...</p>
      </div>
    );
  }

  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <TrainingSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
