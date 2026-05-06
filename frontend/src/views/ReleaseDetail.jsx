import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ReleaseDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        fetch(`${API_BASE_URL}/releases/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(val => setData(val))
            .catch(err => console.error("Fetch error:", err));
    }, [id]);

    const handleAction = async (action) => {
        const statusMap = { 'Approve': 'Approved', 'Reject': 'Rejected' };
        const payload = {
            comment: newComment,
            status: statusMap[action] || null
        };

        await fetch(`${API_BASE_URL}/approve/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        window.location.reload();
    };

    if (!data) return <div className="page-container">Loading Engineering Record...</div>;

    const parseList = (str) => { try { return JSON.parse(str || "[]"); } catch (e) { return []; } };

    return (
        <div className="page-container" style={{ maxWidth: '1400px' }}>
            
            {/* 1. TOP NAV & LIFECYCLE */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', background: '#fff', padding: '15px 25px', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button onClick={() => navigate(`/releases/${data.id - 1}`)} className="nav-icon-btn">← Prev Case</button>
                    <div className="lifecycle-bar">
                        <div className="step active">Created</div>
                        <div className="line"></div>
                        <div className={`step ${data.status === 'Review' ? 'current' : 'active'}`}>Review</div>
                        <div className="line"></div>
                        <div className={`step ${data.status === 'Approved' ? 'approved' : (data.status === 'Rejected' ? 'rejected' : '')}`}>
                            {data.status === 'Rejected' ? 'Rejected' : 'Released'}
                        </div>
                    </div>
                    <button onClick={() => navigate(`/releases/${data.id + 1}`)} className="nav-icon-btn">Next Case →</button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-red" onClick={() => handleAction('Reject')}>Reject</button>
                    <button className="btn-green" onClick={() => handleAction('Approve')}>Approve Release</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '25px', alignItems: 'start' }}>
                
                {/* 2. RECORD SESSION (LEFT COLUMN - MIRRORS FORM) */}
                <div className="white-card" style={{ padding: 0 }}>
                    <div style={{ padding: '30px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                        <h1 style={{ fontSize: '2.8rem', margin: 0, letterSpacing: '-1px' }}>{data.part_number}</h1>
                        <div style={{ marginTop: '10px' }}>
                            <span className={`status-tag status-${data.status?.toLowerCase()}`} style={{ fontSize: '1rem', padding: '5px 20px' }}>
                                {data.status}
                            </span>
                        </div>
                    </div>

                    <div style={{ padding: '40px' }}>
                        
                        {/* SECTION 1: PART INFORMATION */}
                        <div className="form-section-header">1. Part Information</div>
                        <div className="form-grid-2">
                            <DetailBox label="Part Name" value={data.name} />
                            <DetailBox label="Project Code" value="6040" />
                            <DetailBox label="Part Type" value={[
                                data.Assembly ? 'Assembly' : null,
                                data.Sourced_Finished ? 'Sourced-Finished' : null,
                                data.Sourced_Unfinished ? 'Sourced-Unfinished' : null
                            ].filter(Boolean).join(', ') || 'N/A'} />
                        </div>

                        {/* SECTION 2: MODIFICATION DETAILS */}
                        <div className="form-section-header" style={{ marginTop: '40px' }}>2. Modification Details</div>
                        <div className="form-grid-2">
                            <DetailBox label="Modification Type" value={[
                                data.New ? 'New' : null,
                                data.Modified ? 'Modified' : null,
                                data.Phaseout ? 'Phaseout' : null
                            ].filter(Boolean).join(', ') || 'N/A'} />
                            <DetailBox label="Responsible Engineer" value={data.responsible_engineer} />
                            <DetailBox label="Description" value={data.mod_description} fullWidth />
                            <DetailBox label="Reason" value={data.reason} fullWidth />
                        </div>

                        {/* SECTION 3: DESIGN & ANALYSIS */}
                        <div className="form-section-header" style={{ marginTop: '40px' }}>3. Design & Analysis</div>
                        <div className="form-grid-4">
                            <DetailBox label="Drawing" value={`${data.drawing_2d ? '2D ' : ''}${data.drawing_3d ? '3D' : ''}` || 'None'} />
                            <DetailBox label="FEA" value={data.fea} />
                            <DetailBox label="Test Reports" value={data.test_reports} />
                            <DetailBox label="Mandatory" value={data.mandatory} />
                        </div>

                        {/* SECTION 4: IMPACT */}
                        <div className="form-section-header" style={{ marginTop: '40px' }}>4. Impact Analysis</div>
                        <div className="form-grid-2">
                            <DetailBox label="Internal Docs" value={parseList(data.doc_internal).join(', ') || 'None'} />
                            <DetailBox label="External Docs" value={parseList(data.doc_external).join(', ') || 'None'} />
                            <DetailBox label="Compliance" value={`${data.compliance_adr ? 'ADR ' : ''}${data.compliance_intl ? 'Intl ' : ''}${data.compliance_others || ''}`} />
                            <DetailBox label="Vehicles" value={`${data.vehicle_ev ? 'EV ' : ''}${data.vehicle_marrua ? 'Marrua' : ''}`} />
                            <DetailBox label="Stock Action" value={parseList(data.stock_action).join(', ') || 'No Action'} />
                            <DetailBox label="Stock Details" value={data.stock_details} fullWidth />
                        </div>

                        {/* SECTION 5: SUPPLIER & COSTS */}
                        <div className="form-section-header" style={{ marginTop: '40px' }}>5. Supplier & Costs</div>
                        <div className="form-grid-2">
                            <DetailBox label="Supplier Name" value={data.supplier_name} />
                            <DetailBox label="Cost Notes" value={data.cost_notes} />
                        </div>

                        {/* SECTION 6: APPROVAL WORKFLOW */}
                        <div className="form-section-header" style={{ marginTop: '40px' }}>6. Approval Workflow</div>
                        <div className="form-grid-2">
                            <DetailBox label="Reviewer" value={data.approval_person} />
                            <DetailBox label="Planned Date" value={data.approval_date} />
                        </div>
                    </div>
                </div>

                {/* 3. DISCUSSION & CHAT (RIGHT COLUMN) */}
                <div className="white-card" style={{ display: 'flex', flexDirection: 'column', height: '850px', padding: 0, position: 'sticky', top: '20px' }}>
                    <div className="form-section-header" style={{ background: 'var(--bortana-yellow)', color: '#000' }}>Project Discussion</div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f4f4f4' }}>
                        {(data.storyline || []).map((msg, i) => (
                            <div key={i} style={{ 
                                marginBottom: '15px', 
                                marginLeft: msg.user_name === user?.name ? '40px' : '0',
                                marginRight: msg.user_name === user?.name ? '0' : '40px'
                            }}>
                                <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '3px', textAlign: msg.user_name === user?.name ? 'right' : 'left' }}>
                                    <strong>{msg.user_name}</strong> • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div style={{ 
                                    padding: '12px 16px', 
                                    borderRadius: '12px', 
                                    background: msg.user_name === user?.name ? '#fff9c4' : '#fff',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    position: 'relative'
                                }}>
                                    {msg.details}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '20px', borderTop: '1px solid #eee', background: '#fff' }}>
                        <textarea 
                            placeholder="Add a comment or explain your decision..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '12px', minHeight: '100px', marginBottom: '10px', fontFamily: 'inherit' }}
                        />
                        <button className="btn-yellow" style={{ width: '100%', padding: '12px' }} onClick={() => handleAction('Comment')}>
                            Post Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal sub-component for the View-Only Record
const DetailBox = ({ label, value, fullWidth }) => (
    <div style={{ marginBottom: '20px', gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#999', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
            {label}
        </label>
        <div style={{ 
            padding: '12px 15px', 
            background: '#fcfcfc', 
            border: '1px solid #efefef', 
            borderRadius: '6px',
            color: '#333',
            fontSize: '0.95rem',
            minHeight: '44px',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap'
        }}>
            {value || '—'}
        </div>
    </div>
);

export default ReleaseDetail;