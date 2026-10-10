import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import NgoDashboard from './pages/NgoDashboard';
import MonitoringPage from './pages/MonitoringPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ImpactPage from './pages/ImpactPage';
import PostFoodModal from './components/PostFoodModal';

// Protected Route Guard with Role Check
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect unauthorized access to user's own dashboard
    const defaultRoute = role === 'donor' ? '/donor-dashboard' : role === 'recipient' ? '/recipient-dashboard' : '/ngo-dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}

function MainLayout() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      <Navbar onOpenPostModal={() => setIsPostModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          
          <Route
            path="/donor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recipient-dashboard"
            element={
              <ProtectedRoute allowedRoles={['recipient']}>
                <RecipientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ngo-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NgoDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/monitoring"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <MonitoringPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/impact"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <ImpactPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute allowedRoles={['ngo', 'donor']}>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <PostFoodModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 rounded-2xl shadow-xl text-xs font-semibold',
              duration: 4000,
            }}
          />
          <MainLayout />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
