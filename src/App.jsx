import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
      <Navbar />
      <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: 'var(--bg-dark)' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Community />} />
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
