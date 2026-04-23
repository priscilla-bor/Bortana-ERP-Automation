import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({ stats: [], digest: [], user: '' });
    const [timeframe, setTimeframe] = useState('7d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:3000/api/dashboard-summary?timeframe=${timeframe}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setSummary({
                    stats: data.stats || [],
                    digest: data.digest || [],
                    user: data.user || ''
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Dashboard fetch error:", err);
                setLoading(false);
            });
    }, [timeframe]);

    // Metric Calculations - broadened the status check to ensure 'Review' and 'Pending Review' are both caught
    const reviewVolume = summary.stats.find(s => s.status === 'Review' || s.status === 'Pending Review')?.count || 0;
    const totalReleases = summary.stats.find(s => s.status === 'Approved')?.count || 0;
    const myActionItems = summary.stats.find(s => s.status === 'Assigned' || s.status === 'Action Items')?.count || 0;

    if (loading) return <div style={{ padding: '40px' }}>Loading Overview...</div>;

    return (
        <div className="page-container">
            
            {/* HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Engineering Overview</h1>
                    <p style={{ color: '#666', margin: '5px 0 0 0' }}>Bortana EV Maintenance & Release Portal</p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <select 
                        value={timeframe} 
                        onChange={(e) => setTimeframe(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff' }}
                    >
                        <option value="24h">Past 24 Hours</option>
                        <option value="7d">Past 7 Days</option>
                        <option value="30d">Past 30 Days</option>
                    </select>
                    <button className="btn-yellow" onClick={() => navigate('/create')}>+ New Release</button>
                </div>
            </div>

            {/* 3-BOX METRIC WIDGET */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="white-card" style={{ padding: '30px', cursor: 'pointer' }} onClick={() => navigate(`/portal?status=Review&timeframe=${timeframe}`)}>
                    <h4 style={{ margin: 0, color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Review Releases
                    </h4>
                    <p style={{ fontSize: '3rem', fontWeight: '800', margin: '10px 0', color: 'var(--text-h)' }}>
                        {reviewVolume}
                    </p>
                    <div style={{ height: '4px', background: 'var(--accent)', width: '40%' }}></div>
                </div>
                <div className="white-card" style={{ padding: '30px', cursor: 'pointer' }} onClick={() => navigate(`/portal?status=Approved&timeframe=${timeframe}`)}>
                    <h4 style={{ margin: 0, color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Total Releases
                    </h4>
                    <p style={{ fontSize: '3rem', fontWeight: '800', margin: '10px 0', color: 'var(--text-h)' }}>
                        {totalReleases}
                    </p>
                    <div style={{ height: '4px', background: '#4CAF50', width: '40%' }}></div>
                </div>
                <div className="white-card" style={{ padding: '30px', cursor: 'pointer' }} onClick={() => navigate(`/portal?status=Assigned&timeframe=${timeframe}`)}>
                    <h4 style={{ margin: 0, color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        My Action Items
                    </h4>
                    <p style={{ fontSize: '3rem', fontWeight: '800', margin: '10px 0', color: 'var(--text-h)' }}>
                        {myActionItems}
                    </p>
                    <div style={{ height: '4px', background: '#FF9800', width: '40%' }}></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' }}>
                
                {/* DAILY DIGEST */}
                <div className="white-card" style={{ marginTop: 0 }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                        Daily Digest
                    </h3>
                    {summary.digest.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {summary.digest.map((item, index) => (
                                <div key={index} style={{ padding: '15px 0', borderBottom: '1px solid #f9f9f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{item.type === 'COMMENT' ? '💬' : '🛠️'}</span>
                                    <div style={{ flexGrow: 1 }}>
                                        <span style={{ fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>{item.part_number}</span>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.95rem' }}>
                                            {item.type === 'COMMENT' ? `Reviewer: "${item.message}"` : `Status updated to ${item.status || 'Pending'}.`}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/release/${item.part_number}`)}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
                            <p>No new activity in this timeframe.</p>
                        </div>
                    )}
                </div>

                {/* QUICK LINKS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="white-card" style={{ marginTop: 0, background: 'var(--bortana-black)', color: '#fff' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--bortana-yellow)' }}>Engineering Catalog</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '20px' }}>
                            Search the master list of all 6064-MK1 and legacy parts.
                        </p>
                        <Link to="/catalog" className="btn-yellow" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                            Open Catalog
                        </Link>
                    </div>

                    <div className="white-card" style={{ marginTop: 0 }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Help & Documentation</h4>
                        <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#666', lineHeight: '1.8' }}>
                            <li>Naming Convention Guide</li>
                            <li>Revision Control Policy</li>
                            <li>BOSSCAP Group Standards</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;