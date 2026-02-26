import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import NotesView from './pages/Notes/NotesView';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes/:id" element={<NotesView />} />
          <Route path="/favorites" element={<div>Favorites Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          {/* Add more routes as we implement pages */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
