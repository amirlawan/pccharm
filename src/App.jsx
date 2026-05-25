import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy load page components
const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const Academy = React.lazy(() => import('./pages/Academy'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Community = React.lazy(() => import('./pages/Community'));
const AIForge = React.lazy(() => import('./pages/AIForge'));
const SecLab = React.lazy(() => import('./pages/SecLab'));
const Connect = React.lazy(() => import('./pages/Connect'));
const ProServices = React.lazy(() => import('./pages/ProServices'));
const CourseViewer = React.lazy(() => import('./pages/CourseViewer'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Certificates = React.lazy(() => import('./pages/Certificates'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function AppContent() {
  const location = useLocation();
  const isLearningMode = location.pathname.startsWith('/learn');
  const isAdminMode = location.pathname.startsWith('/admin');

  return (
    <>
      {!isLearningMode && !isAdminMode && <Navbar />}
      <Suspense fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0a1128, #001f54)',
          gap: '1.5rem'
        }}>
          <img src="/icon.png" alt="PcCharm" style={{ width: 60, height: 60, animation: 'pulse 2s infinite ease-in-out' }} />
          <div className="loader"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Community />} />
          <Route path="/aiforge" element={<AIForge />} />
          <Route path="/seclab" element={<SecLab />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/proservices" element={<ProServices />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute>
                <CourseViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isLearningMode && !isAdminMode && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <SpeedInsights />
    </Router>
  );
}

export default App;
