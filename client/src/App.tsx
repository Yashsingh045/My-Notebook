import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ConnectGoogleDrivePage from './pages/Auth/ConnectGoogleDrivePage';
import OAuthCallbackPage from './pages/Auth/OAuthCallbackPage';
import OAuthSignupPage from './pages/Auth/OAuthSignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

// ─── Protected Route Component ──────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, needsDriveConnection } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400">Loading Vault...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    // If authenticated but drive is not connected, force user to connect first
    if (needsDriveConnection) return <Navigate to="/connect-drive" />;

    return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/connect-drive" element={<ConnectGoogleDrivePage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/oauth/signup" element={<OAuthSignupPage />} />

      {/* Protected Dashboard Route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LibraryProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <AppRoutes />
        </LibraryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
