import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import InterviewFeed from './pages/InterviewFeed';
import InterviewDetail from './pages/InterviewDetail';
import SolveProblem from './pages/SolveProblem';
import Profile from './pages/Profile';
import SubmitExperience from './pages/SubmitExperience';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/interviews" element={<InterviewFeed />} />
      <Route path="/interviews/:id" element={<InterviewDetail />} />
      <Route path="/solve/:id" element={<ProtectedRoute><SolveProblem /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/submit-experience" element={<ProtectedRoute><SubmitExperience /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f1714',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
            },
            success: { iconTheme: { primary: '#00d46a', secondary: '#030706' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#030706' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
