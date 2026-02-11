import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Home from './pages/dashboard/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SubjectDashboard from './pages/dashboard/SubjectDashboard';
import Profile from './pages/dashboard/Profile';
import SetupProfile from './pages/auth/SetupProfile';
import ChapterDetails from './pages/dashboard/ChapterDrillDown';
import CreateChallenge from './pages/teacher/CreateChallenge';
import StudentTracker from './pages/teacher/StudentTracker';
import QuestionEntry from './pages/admin/QuestionEntry';
import Chat from './pages/Chat';
import UserProfile from './pages/UserProfile';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    // Check if token exists in local storage to prevent premature redirect
    const token = localStorage.getItem('token');
    if (token) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce Profile Completion
  // If user is logged in but profile is not complete, and not already on /setup-profile -> Redirect
  if (user && !user.profile_complete && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  // If user is logged in, profile IS complete, but trying to accessed /setup-profile -> Redirect to Home
  if (user && user.profile_complete && location.pathname === '/setup-profile') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Role-based route protection
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-4">Access Denied</h1>
          <p className="text-slate-400 mb-8">You don't have permission to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="btn-premium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const AppRoutes = () => {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Router>
      <div className="relative z-10 w-full min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/setup-profile" element={
            <ProtectedRoute>
              <SetupProfile />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/subjects/:subjectId/chapters" element={
            <ProtectedRoute>
              <SubjectDashboard />
            </ProtectedRoute>
          } />

          <Route path="/chapters/:chapterId" element={
            <ProtectedRoute>
              <ChapterDetails />
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />

          <Route path="/user/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['teacher']}>
                <StudentTracker />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/teacher/challenge" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['teacher']}>
                <CreateChallenge />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/questions" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin']}>
                <QuestionEntry />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden relative">
      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 bg-slate-950/90 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/20 blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[128px] animate-pulse-slow delay-1000" />
      </div>

      <AppRoutes />
    </div>
  );
}

export default App;
