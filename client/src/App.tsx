import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

// ─── Protected Route Component ──────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, needsDriveConnection } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400">Loading Vault...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    // If authenticated but drive is not connected, force Step 2
    if (needsDriveConnection) return <Navigate to="/register" />;

    return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
            <ProtectedRoute>
                <LibraryProvider>
                    <DashboardPage />
                </LibraryProvider>
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
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
