import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <h1>My-Notebook</h1>
        <Routes>
          <Route path="/" element={<div>Welcome to My-Notebook</div>} />
          {/* Add more routes as we implement pages */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
