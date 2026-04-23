import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EngineeringReleaseForm = ({ user }) => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]); // From PartID detail.xlsx
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);

    const [formData, setFormData] = useState({
        project: '6064', // Static
        system: '006',  // Static
        item: '',
        finish: '00',
        rev: '001',
        code: 'B',
        name: '',
        part_type: 'Assembly',
        mod_type: 'New',
        mod_description: '',
        reason: '',
        drawing_2d: false, drawing_3d: true,
        fea: false, test_reports: false, mandatory: false,
        compliance_adr: false, vehicle_ev: true, vehicle_marrua: false,
        stock_action: 'Need Update',
        supplier: '', cost_to_discuss: false
    });

    // Load Items for selection
    useEffect(() => {
        fetch('http://localhost:3000/api/dashboard-data', { credentials: 'include' })
            .then(res => res.json()).then(data => setItems(data.releases || []));
    }, []);

    // Filter Items based on ID or Keyword
    useEffect(() => {
        if (search.length > 0) {
            const filtered = items.filter(i => 
                i.name.toLowerCase().includes(search.toLowerCase()) || 
                i.part_number.includes(search)
            );
            setResults(filtered.slice(0, 5));
        } else {
            setResults([]);
        }
    }, [search, items]);

    // Automate Revision Logic
    const handleSelectItem = async (itemCode, itemName) => {
        setSearch(itemName);
        setResults([]);
        
        const res = await fetch(`http://localhost:3000/api/check-revision?product=6064&system=006&item=${itemCode}`, { credentials: 'include' });
        const data = await res.json();
        
        setFormData(prev => ({ 
            ...prev, 
            item: itemCode, 
            name: itemName, 
            rev: data.nextRevision,
            mod_type: data.nextRevision === '001' ? 'New' : 'Modified'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullPN = `${formData.project}.${formData.system}.${formData.item}.${formData.finish}.${formData.rev}.${formData.code}`;
        
        const res = await fetch('http://localhost:3000/api/components', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, part_number: fullPN }),
            credentials: 'include'
        });
        if (res.ok) navigate('/dashboard');
    };

    return (
        <div className="modern-form-container" style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '10px' }}>Engineering Release Form</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>Standardised workflow for Bortana EV Component registration.</p>

            <form onSubmit={handleSubmit} className="white-card">
                
                {/* 1. PART INFORMATION */}
                <section className="form-section">
                    <h3>1. Part Information</h3>
                    <div className="grid-3">
                        <div className="field">
                            <label>Project Code</label>
                            <input type="text" value="6064-MK1" readOnly className="input-readonly" />
                        </div>
                        <div className="field">
                            <label>System</label>
                            <input type="text" value="006-Battery" readOnly className="input-readonly" />
                        </div>
                        <div className="field">
                            <label>Search Item (ID or Name)</label>
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. 002 or Enclosure" />
                            {results.length > 0 && (
                                <div className="search-results">
                                    {results.map(r => (
                                        <div key={r.id} onClick={() => handleSelectItem(r.id || '001', r.name)}>
                                            {r.id} - {r.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid-3" style={{ marginTop: '20px' }}>
                        <div className="field">
                            <label>Finished Stage</label>
                            <select onChange={e => setFormData({...formData, finish: e.target.value})}>
                                <option value="00">00 - Finished</option>
                                <option value="01">01 - Unfinished</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Revision (Auto-increment)</label>
                            <input type="text" value={formData.rev} readOnly className="input-readonly" style={{ fontWeight: 'bold', color: 'var(--accent)' }} />
                        </div>
                        <div className="field">
                            <label>Bortana Code</label>
                            <input type="text" value="B" readOnly className="input-readonly" />
                        </div>
                    </div>
                </section>

                {/* 2. MODIFICATION & TYPE */}
                <section className="form-section">
                    <h3>2. Modification & Classification</h3>
                    <div className="grid-3">
                        <div className="field">
                            <label>Part Type</label>
                            <select onChange={e => setFormData({...formData, part_type: e.target.value})}>
                                <option>Assembly</option><option>Manufactured</option>
                                <option>Sourced - Finished</option><option>Software</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Modification Type</label>
                            <input type="text" value={formData.mod_type} readOnly className="input-readonly" />
                        </div>
                        <div className="field">
                            <label>Responsible Engineer</label>
                            <input type="text" value={user} readOnly className="input-readonly" />
                        </div>
                    </div>
                    <div className="field" style={{ marginTop: '20px' }}>
                        <label>Reason for Modification</label>
                        <textarea rows="2" onChange={e => setFormData({...formData, reason: e.target.value})} />
                    </div>
                </section>

                {/* 3. DESIGN & ANALYSIS CHECKLIST */}
                <section className="form-section">
                    <h3>3. Design & Analysis</h3>
                    <div className="grid-3" style={{ background: '#f9f9f9', padding: '15px' }}>
                        <label><input type="checkbox" checked={formData.drawing_3d} onChange={e => setFormData({...formData, drawing_3d: e.target.checked})} /> 3D Drawing Available</label>
                        <label><input type="checkbox" onChange={e => setFormData({...formData, fea: e.target.checked})} /> FEA Required</label>
                        <label><input type="checkbox" onChange={e => setFormData({...formData, test_reports: e.target.checked})} /> Test Reports</label>
                    </div>
                </section>

                <div className="form-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Discard</button>
                    <button type="submit" className="btn-yellow" style={{ padding: '12px 60px' }}>Register Release</button>
                </div>
            </form>
        </div>
    );
};

export default EngineeringReleaseForm;