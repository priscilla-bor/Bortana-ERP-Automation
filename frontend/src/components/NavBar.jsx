import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NavBar = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Redirects to the backend logout route we built in server.js
        window.location.href = "http://localhost:3000/api/logout";
    };

    return (
        <nav className="header-black" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 30px',
            backgroundColor: 'var(--bortana-black)',
            color: 'white'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2 style={{ margin: 0, color: 'var(--accent)', letterSpacing: '2px' }}>BORTANA</h2>
                </Link>
                <span style={{ color: '#555' }}>|</span>
                <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
                    Welcome, <strong>{user}</strong>
                </span>
                <button 
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid #555',
                        color: 'white',
                        padding: '5px 12px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                    }}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

export default NavBar;