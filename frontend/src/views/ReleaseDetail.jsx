import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ReleaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/releases/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(val => setData(val))
            .catch(err => console.error("Error fetching release:", err));
    }, [id]);

    if (!data) return <div className="page-container">Loading engineering record...</div>;

    const parseList = (str) => {
        try { return JSON.parse(str || "[]"); } 
        catch (e) { return []; }
    };

    return (
        <div className="page-container">
            {/* TECHNICAL HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '3rem', margin: 0, color: 'var(--text-h)' }}>{data.part_number}</h1>
                <span className={`status-tag status-${data.status?.toLowerCase()}`} style={{ fontSize: '1.2rem', padding: '10px 30px' }}>
                    {data.status}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '30px' }}>
                
                {/* LEFT COLUMN: THE ENGINEERING RECORD */}
                <div style={{ border: '1px solid #ddd', background: '#fff', boxShadow: 'var(--shadow)', borderRadius: '8px' }}>
                    <div className="form-section-header">Engineering Record</div>
                    
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 5px 0' }}>{data.name}</h2>
                            <p style={{ color: '#666' }}>Created by: <strong>{data.created_by || 'System'}</strong></p>
                        </div>

                        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

                        {/* 1. PART INFORMATION */}
                        <h3 className="detail-sub-header">1. Part Information</h3>
                        <div className="detail-grid">
                            <DetailItem label="Part Name" value={data.name} />
                            <DetailItem label="Part Number" value={data.part_number} />
                            <DetailItem label="Project Code" value="6040" />
                            <DetailItem label="Part Type" value={[
                                data.Assembly ? 'Assembly' : null,
                                data.Sourced_Finished ? 'Sourced-Finished' : null,
                                data.Sourced_Unfinished ? 'Sourced-Unfinished' : null
                            ].filter(Boolean).join(', ') || 'N/A'} />
                        </div>

                        {/* 2. MODIFICATION DETAILS */}
                        <h3 className="detail-sub-header">2. Modification Details</h3>
                        <div className="detail-grid">
                            <DetailItem label="Modification Type" value={[
                                data.New ? 'New' : null,
                                data.Modified ? 'Modified' : null,
                                data.Phaseout ? 'Phaseout' : null
                            ].filter(Boolean).join(', ') || 'N/A'} />
                            <DetailItem label="Responsible Engineer" value={data.responsible_engineer} />
                        </div>
                        <DetailItem label="Modification Description" value={data.mod_description} isFullWidth />
                        <DetailItem label="Modification Reason" value={data.reason} isFullWidth />

                        {/* 3. DESIGN & ANALYSIS */}
                        <h3 className="detail-sub-header">3. Design & Analysis</h3>
                        <div className="detail-grid">
                            <DetailItem label="2D Drawing" value={data.drawing_2d ? 'Yes' : 'No'} />
                            <DetailItem label="3D Model" value={data.drawing_3d ? 'Yes' : 'No'} />
                            <DetailItem label="FEA" value={data.fea} />
                            <DetailItem label="Test Reports" value={data.test_reports} />
                            <DetailItem label="Mandatory" value={data.mandatory} />
                        </div>

                        {/* 4. IMPACT */}
                        <h3 className="detail-sub-header">4. Impact Analysis</h3>
                        <div className="detail-grid">
                            <DetailItem label="Internal Docs" value={parseList(data.doc_internal).join(', ') || 'None'} />
                            <DetailItem label="External Docs" value={parseList(data.doc_external).join(', ') || 'None'} />
                            <DetailItem label="ADR Compliance" value={data.compliance_adr ? 'Yes' : 'No'} />
                            <DetailItem label="Vehicle Type" value={[
                                data.vehicle_ev ? 'Bortana EV' : null,
                                data.vehicle_marrua ? 'Marrua' : null
                            ].filter(Boolean).join(', ') || 'None'} />
                        </div>

                        {/* 5. SUPPLIER & COSTS */}
                        <h3 className="detail-sub-header">5. Supplier & Costs</h3>
                        <div className="detail-grid">
                            <DetailItem label="Supplier Name" value={data.supplier_name} />
                            <DetailItem label="Cost Notes" value={data.cost_notes} />
                        </div>

                        {/* 6. REVIEW & APPROVAL + COMMENTS */}
                        <h3 className="detail-sub-header">6. Review & Approval</h3>
                        <div className="detail-grid" style={{ marginBottom: '20px' }}>
                            <DetailItem label="Assigned Reviewer" value={data.approval_person} />
                            <DetailItem label="Planned Date" value={data.approval_date} />
                        </div>
                        
                        {/* THE DEDICATED COMMENT SESSION */}
                        <div style={{ marginTop: '10px' }}>
                            <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                Engineering Comments / Reviewer Feedback
                            </h4>
                            <div style={{ 
                                padding: '20px', 
                                background: '#fff9e6', // Subtle yellow to highlight feedback
                                border: '1px solid var(--bortana-yellow)', 
                                borderRadius: '6px',
                                minHeight: '100px',
                                fontSize: '0.95rem',
                                color: '#444',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {data.comment || "No feedback has been logged for this record yet."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: TIMELINE */}
                <div>
                    <div style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '8px', padding: '20px', position: 'sticky', top: '20px' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--bortana-yellow)', paddingBottom: '10px' }}>Activity Storyline</h3>
                        <div className="timeline" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {(data.storyline || []).map((log, idx) => (
                                <div key={idx} style={{ marginBottom: '20px', paddingLeft: '15px', borderLeft: '2px solid #eee' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{new Date(log.timestamp).toLocaleString()}</div>
                                    <div style={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>{log.action}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#555' }}>{log.details}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888', textAlign: 'right' }}>— {log.user_name}</div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-yellow" style={{ width: '100%', marginTop: '20px' }} onClick={() => navigate('/portal')}>Return to Portal</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable item for clean metadata display
const DetailItem = ({ label, value, isFullWidth = false }) => (
    <div style={{ marginBottom: '15px', gridColumn: isFullWidth ? '1 / -1' : 'auto' }}>
        <h4 style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '4px' }}>{label}</h4>
        <div style={{ 
            fontWeight: '500', 
            color: '#333',
            background: isFullWidth ? '#f9f9f9' : 'transparent',
            padding: isFullWidth ? '10px' : '0',
            border: isFullWidth ? '1px solid #eee' : 'none',
            borderRadius: '4px'
        }}>
            {value || '—'}
        </div>
    </div>
);

export default ReleaseDetail;