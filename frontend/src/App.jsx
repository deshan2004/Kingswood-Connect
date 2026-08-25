import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Students from './pages/Students';
import Finance from './pages/Finance';
import Teachers from './pages/Teachers';
import Schedule from './pages/Schedule';
import Exams from './pages/Exams';
import AttendanceReports from './pages/AttendanceReports';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentLayout from './components/StudentLayout';
import MobileScanner from './pages/MobileScanner';
import TeacherLayout from './components/TeacherLayout';
import TeacherDashboard from './pages/TeacherDashboard';
import Materials from './pages/Materials';
import UpdateEmailPage from './pages/UpdateEmailPage';
import SettingsPage from './pages/SettingsPage';
import TrashBin from './pages/TrashBin';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4"></div>
        <p className="text-xs font-extrabold text-slate-400 tracking-wider uppercase">Loading Kingswood Education Center...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole) {
    const currentRole = user.role ? user.role.toLowerCase() : 'student';
    if (currentRole !== allowedRole.toLowerCase()) {
      // Redirect to their respective dashboard if they try to access the wrong area
      return <Navigate to={currentRole === 'admin' ? '/admin' : currentRole === 'teacher' ? '/teacher' : '/student'} replace />;
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mobile-scan/:sessionId" element={<MobileScanner />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="students" element={<Students />} />
            <Route path="attendance" element={<AttendanceReports />} />
            <Route path="finance" element={<Finance />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="trash" element={<TrashBin />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="materials" element={<Materials />} />
            <Route path="update-email" element={<UpdateEmailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="attendance" element={<AttendanceReports />} />
            <Route path="materials" element={<Materials />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
