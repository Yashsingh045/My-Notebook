import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

// ─── Phase-Specific Route Placeholders ────────────────────
const DashboardPlaceholder = () => <div className="p-20 text-white">Dashboard (Phase 4)</div>;
const LoginPlaceholder = () => <div className="p-20 text-white">Login Page (Phase 3)</div>;
const RegisterPlaceholder = () => <div className="p-20 text-white">Register Page (Phase 3)</div>;
// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPlaceholder />} />
          <Route path="/register" element={<RegisterPlaceholder />} />

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
