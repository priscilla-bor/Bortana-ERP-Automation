import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ReleaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [viewMode, setViewMode] = useState('Engineer'); // 'Engineer' or 'Reviewer'
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/releases/${id}`, { credentials: 'include' });
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Failed to fetch part specifications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleApprove = async () => {
        await fetch(`http://localhost:3000/api/approve/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment }),
            credentials: 'include'
        });
        navigate('/portal?status=Review'); // Redirect to portal
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading Engineering Specifications...</div>;
    if (!data) return <div style={{ padding: '40px' }}>Part not found or Access Denied.</div>;

    return (
        <div style={{ padding: '30px' }}>
            {/* VIEW MODE TOGGLE */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
                    <option value="Engineer">View As: Engineer</option>
                    <option value="Reviewer">View As: Reviewer</option>
                </select>
            </div>

            {/* NAVIGATION BAR */}
            <button 
                onClick={() => navigate('/dashboard')} 
                style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 15px', border: '1px solid #ddd', background: '#fff' }}
            >
                ← Back to Overview
            </button>

            {/* TECHNICAL HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>{data.part_number}</h1>
                <span className={`status-tag status-${data.status?.toLowerCase()}`} style={{ fontSize: '1.2rem', padding: '10px 30px' }}>
                    {data.status}
                </span>
            </div>

            {/* MANAGEMENT TOOLBAR */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <select value={viewMode} onChange={e => setViewMode(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff' }}>
                    <option value="Engineer">View As: Engineer</option>
                    <option value="Reviewer">View As: Reviewer</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '30px' }}>
                
                {/* LEFT COLUMN: METADATA SECTION */}
                <div style={{ border: '1px solid #ddd', background: '#fff', boxShadow: 'var(--shadow)' }}>
                    <div className="form-section-header">Engineering Record</div>
                    
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h2>{data.name}</h2>
                            <p>Owner: <strong>{data.created_by || 'System'}</strong></p>
                        </div>

                        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

                        {/* METADATA GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '5px' }}>Part Type</h4>
                                <p style={{ margin: 0, fontWeight: '500' }}>{data.part_type || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '5px' }}>Project</h4>
                                <p style={{ margin: 0, fontWeight: '500' }}>6040</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '5px' }}>Drawing Status</h4>
                                <p style={{ margin: 0, fontWeight: '500' }}>{data.drawing_2d || data.drawing_3d ? 'Available' : 'Not Available'}</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '5px' }}>Modification Category</h4>
                                <p style={{ margin: 0, fontWeight: '500' }}>{data.mod_type || 'N/A'}</p>
                            </div>
                        </div>

                        {/* LONG TEXT AREAS */}
                        <div style={{ marginBottom: '25px' }}>
                            <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px' }}>Technical Description</h4>
                            <div style={{ padding: '15px', background: '#fcfcfc', border: '1px solid #f0f0f0', minHeight: '60px' }}>
                                {data.mod_description || "No description provided."}
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '8px' }}>Reason for Release</h4>
                            <div style={{ padding: '15px', background: '#fcfcfc', border: '1px solid #f0f0f0', minHeight: '60px' }}>
                                {data.reason || "No modification reason logged."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: REVIEW SIDEBAR */}
                <div style={{ padding: '10px' }}>
                    <h3 style={{ marginTop: 0 }}>Review & Approval</h3>
                    
                    {/* COMMENT THREAD */}
                    <div className="timeline" style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '25px', marginTop: '20px', marginLeft: '10px' }}>
                        {data.storyline && data.storyline.map((log, index) => (
                            <div key={index} style={{ marginBottom: '30px', position: 'relative' }}>
                                <div style={{ width: '14px', height: '14px', background: 'var(--accent)', borderRadius: '50%', position: 'absolute', left: '-33px', top: '4px', border: '3px solid #fff' }}></div>
                                <strong style={{ display: 'block' }}>{log.action}</strong>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                    {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{log.details}</p>
                            </div>
                        ))}
                    </div>

                    {/* APPROVE BUTTON (Only for Reviewer) */}
                    {viewMode === 'Reviewer' && data.status === 'Review' && (
                        <div style={{ marginTop: '20px' }}>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add comment..." style={{ width: '100%', marginBottom: '10px' }} />
                            <button onClick={handleApprove} className="btn-yellow">Approve</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ReleaseDetail;