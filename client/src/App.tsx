import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// ─── Phase-Specific Route Placeholders ────────────────────
const DashboardPlaceholder = () => <div className="p-20 text-white flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-4xl font-bold mb-4 font-display">Vault Access Granted</h1>
    <p className="text-slate-400">Dashboard implementation coming in Phase 4.</p>
</div>;
// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (Placeholder) */}
          <Route path="/dashboard" element={<DashboardPlaceholder />} />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
