import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Views
import Dashboard from './views/Dashboard';
import MasterList from './views/MasterList';
import ReleaseDetail from './views/ReleaseDetail';
import ReleasePortal from './views/ReleasePortal';

// Components
import EngineeringReleaseForm from './components/EngineeringReleaseForm';
import NavBar from './components/NavBar';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial Auth Handshake
    fetch(`${API_BASE_URL}/dashboard-data`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading" style={{ padding: '50px', textAlign: 'center' }}>Initializing Bortana Portal...</div>;
  }

  return (
    <Router>
      <div className="bortana-theme">
        {/* Render NavBar only if user is authenticated */}
        {user && <NavBar user={user} />}

        <div id="main-content">
          <Routes>
            <Route path="/" element={!user ? <LoginView /> : <Navigate to="/dashboard" />} />
            
            {/* Dashboard Overview */}
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            
            {/* The Searchable Catalog */}
            <Route path="/catalog" element={user ? <MasterList /> : <Navigate to="/" />} />
            
            {/* The New Release Form */}
            <Route path="/create" element={user ? <EngineeringReleaseForm user={user} /> : <Navigate to="/" />} />
            
            {/* The Release Management Portal */}
            <Route path="/portal" element={user ? <ReleasePortal user={user} /> : <Navigate to="/" />} />

            {/* The Detailed Engineering Record & Discussion */}
            <Route path="/release/:id" element={user ? <ReleaseDetail user={user} /> : <Navigate to="/" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const LoginView = () => (
  <div style={{ textAlign: 'center', marginTop: '100px' }}>
    <h1 style={{ border: 'none', textTransform: 'uppercase' }}>Bortana Engineering Portal</h1>
    <p style={{ marginBottom: '30px', color: '#666' }}>Secure Internal Access Only</p>
    <button 
      className="btn-yellow" 
      onClick={() => window.location.href = "/api/auth/login"}
    >
      Sign In with Microsoft
    </button>
  </div>
);

export default App;