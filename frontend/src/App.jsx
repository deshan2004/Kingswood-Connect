import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Students from './pages/Students';
import Finance from './pages/Finance';
import Teachers from './pages/Teachers';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentLayout from './components/StudentLayout';
import MobileScanner from './pages/MobileScanner';
import Exams from './pages/Exams';
import TeacherLayout from './components/TeacherLayout';
import TeacherDashboard from './pages/TeacherDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // or a spinner
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole) {
    const currentRole = user.role ? user.role.toLowerCase() : 'student';
    if (currentRole !== allowedRole.toLowerCase()) {
      // Redirect to their respective dashboard if they try to access the wrong area
      return <Navigate to={currentRole === 'admin' ? '/' : '/student'} replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/mobile-scan/:sessionId" element={<MobileScanner />} />

          {/* Admin Routes */}
          <Route path="/" element={
            <ProtectedRoute allowedRole="admin">
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="students" element={<Students />} />
            <Route path="finance" element={<Finance />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="schedule" element={<Schedule />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="exams" element={<Exams />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
