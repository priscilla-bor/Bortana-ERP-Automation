import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const EngineeringReleaseForm = ({ user }) => {
    const navigate = useNavigate();
    
    // --- RESTORED LOGIC VARIABLES ---
    const [itemMaster, setItemMaster] = useState([]);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    
    // RESTORED FULL STATE OBJECT
    const [formData, setFormData] = useState({
        project: '6040', system: '006', item: '', finish: '00', rev: '001', code: 'B',
        
        part_name: '', mod_type: 'New', 
        date: new Date().toISOString().split('T')[0],
        
        drawing_2d: false, drawing_3d: true,
        fea: 'No', test_reports: 'No', mandatory: 'No',

        doc_internal: [], 
        doc_external: [],

        compliance_adr: false, compliance_intl: false, compliance_others: '',
        cars_delivered: 'No',

        vehicle_ev: true, vehicle_marrua: false,
        inform_sw: false, inform_telematics: false,
        
        stock_action: [], 
        stock_details: '',

        supplier_name: '', cost_notes: '',
        approval_person: ''
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}/item-master`, { credentials: 'include' })
            .then(res => res.json()).then(data => setItemMaster(data));
    }, []);

    useEffect(() => {
        if (search.trim() === '' || search === formData.item) {
            setResults([]);
            return;
        }

        const filtered = itemMaster.filter(item =>
            item.id.toLowerCase().includes(search.toLowerCase()) ||
            item.name.toLowerCase().includes(search.toLowerCase())
        );
        setResults(filtered);
    }, [search, itemMaster, formData.item]);

    useEffect(() => {
        const fetchRevision = async () => {
            if (!formData.project || !formData.system || !formData.item || !formData.finish) return;
            const res = await fetch(`${API_BASE_URL}/check-revision?product=${formData.project}&system=${formData.system}&item=${formData.item}&finish=${formData.finish}`, { credentials: 'include' });
            const data = await res.json();
            setFormData(prev => ({ 
                ...prev, 
                rev: data.nextRevision,
                mod_type: data.nextRevision === '001' ? 'New' : 'Modified'
            }));
        };
        fetchRevision();
    }, [formData.project, formData.system, formData.item, formData.finish]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        if (formData.item && value !== formData.item) {
            setFormData(prev => ({ ...prev, item: '', part_name: '' }));
        }

        if (/^\d{3}$/.test(value)) {
            setFormData(prev => ({ ...prev, item: value }));
        }
    };

    const selectItem = (item) => {
        setSearch(item.id); 
        setFormData(prev => ({ ...prev, item: item.id, part_name: item.name })); 
        setResults([]); 
    };

    // RESTORED CHECKLIST LOGIC
    const handleCheckList = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    // RESTORED SUBMIT LOGIC & ROUTING
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullPN = `${formData.project}.${formData.system}.${formData.item}.${formData.finish}.${formData.rev}.${formData.code}`;

        await fetch(`${API_BASE_URL}/components`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, part_number: fullPN, name: formData.part_name, status: 'Review' }),
            credentials: 'include'
        });
        
        // Routes to the requested Review volume
        navigate('/portal?status=Review');
    };

    return (
        <div className="page-container">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '2.2rem', color: 'var(--text-h)' }}>Engineering Overview</h1>
                <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '1rem' }}>Bortana EV Maintenance & Release Portal</p>
            </div>
            
            <form onSubmit={handleSubmit} className="white-card">
                
                {/* PART IDENTIFIER STRUCTURE */}
                <div className="form-section-header">Part Identifier Structure</div>
                <div className="identifier-row">
                    <div className="identifier-segment-box">
                        <label className="identifier-label">Product</label>
                        <input type="text" value={formData.project} readOnly className="identifier-input-clean id-readonly" />
                    </div>
                    <div className="identifier-segment-box">
                        <label className="identifier-label">System</label>
                        <input type="text" value={formData.system} readOnly className="identifier-input-clean id-readonly" />
                    </div>
                    <div className="identifier-segment-box" style={{flex: 1.5}}>
                        <label className="identifier-label">Item</label>
                        <input 
                            type="text" 
                            className="identifier-input-clean" 
                            value={search} 
                            onChange={handleSearchChange} 
                            placeholder="Search or ID..." 
                            autoComplete="off" 
                        />
                        {results.length > 0 && (
                            <div className="search-results-floating">
                                {results.map(i => (
                                    <div key={i.id} onClick={() => selectItem(i)}>
                                        {i.id} - {i.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="identifier-segment-box">
                        <label className="identifier-label">Finish</label>
                        <select 
                            className="identifier-input-clean" 
                            value={formData.finish} 
                            onChange={e => setFormData({...formData, finish: e.target.value})}
                        >
                            <option value="00">00</option><option value="01">01</option><option value="02">02</option>
                        </select>
                    </div>
                    <div className="identifier-segment-box">
                        <label className="identifier-label">Revision</label>
                        <input type="text" value={formData.rev} readOnly className="identifier-input-clean id-readonly" style={{ fontWeight: '600' }} />
                    </div>
                    <div className="identifier-segment-box" style={{flex: 0.7}}>
                        <label className="identifier-label">Code</label>
                        <input type="text" value={formData.code} readOnly className="identifier-input-clean id-readonly" />
                    </div>
                </div>

                <div style={{ margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border)' }}>
                    <code style={{ fontSize: '1.15rem', fontWeight: '600', color: '#444', fontFamily: 'monospace' }}>
                        {formData.project}.{formData.system}.{formData.item || 'XXX'}.{formData.finish}.{formData.rev}.{formData.code}
                    </code>
                    <p style={{fontSize: '0.85rem', margin: '8px 0 0', color: '#666', fontWeight: '600', textTransform: 'uppercase'}}>
                        {formData.rev === '001' ? "New Item Detected" : "Existing Item - Incrementing Revision"}
                    </p>
                </div>

                {/* DESIGN & ANALYSIS */}
                <div className="form-section-header">Design & Analysis</div>
                <div className="form-grid-4">
                    <div className="field-box">
                        <label className="main-label">Drawing</label>
                        <div className="vertical-checkbox-group">
                            <label><input type="checkbox" checked={formData.drawing_2d} onChange={e => setFormData({...formData, drawing_2d: e.target.checked})} /> 2D Drawing</label>
                            <label><input type="checkbox" checked={formData.drawing_3d} onChange={e => setFormData({...formData, drawing_3d: e.target.checked})} /> 3D Model</label>
                        </div>
                    </div>
                    {['FEA', 'Test Reports', 'Mandatory'].map(title => {
                        const stateKey = title.toLowerCase().replace(' ', '_');
                        return (
                            <div key={title} className="field-box">
                                <label className="main-label">{title}</label>
                                <div className="vertical-checkbox-group">
                                    <label><input type="radio" name={title} checked={formData[stateKey] === 'Yes'} onChange={() => setFormData({...formData, [stateKey]: 'Yes'})} /> Yes</label>
                                    <label><input type="radio" name={title} checked={formData[stateKey] === 'No'} onChange={() => setFormData({...formData, [stateKey]: 'No'})} /> No</label>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* DOCUMENTATION AFFECTED */}
                <div className="form-section-header">Documentation Affected</div>
                <div className="form-grid-2">
                    <div className="field-box">
                        <label className="main-label">Internal</label>
                        <div className="vertical-checkbox-group">
                            {['Workshop Manual', 'Technical Specification'].map(item => (
                                <label key={item}>
                                    <input type="checkbox" checked={formData.doc_internal.includes(item)} onChange={() => handleCheckList('doc_internal', item)} /> {item}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="field-box">
                        <label className="main-label">External</label>
                        <div className="vertical-checkbox-group">
                            {['Parts Catalogue', 'Operator’s Handbook', 'Maintenance Supplement', 'Training Material', 'Documentation'].map(item => (
                                <label key={item}>
                                    <input type="checkbox" checked={formData.doc_external.includes(item)} onChange={() => handleCheckList('doc_external', item)} /> {item}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* REGULATORY & DELIVERY */}
                <div className="form-section-header">Regulatory & Delivery</div>
                <div className="form-grid-2">
                    <div className="field-box">
                        <label className="main-label">Compliance</label>
                        <div className="vertical-checkbox-group">
                            <label><input type="checkbox" checked={formData.compliance_adr} onChange={e => setFormData({...formData, compliance_adr: e.target.checked})} /> ADR (Australian Design Rules)</label>
                            <label><input type="checkbox" checked={formData.compliance_intl} onChange={e => setFormData({...formData, compliance_intl: e.target.checked})} /> International Standards</label>
                            <div style={{marginTop: '10px'}}>
                                <input type="text" placeholder="Other (specify)..." value={formData.compliance_others} onChange={e => setFormData({...formData, compliance_others: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div className="field-box">
                        <label className="main-label">Cars Delivered</label>
                        <div className="vertical-checkbox-group">
                            <label><input type="radio" name="delivered" checked={formData.cars_delivered === 'Yes'} onChange={() => setFormData({...formData, cars_delivered: 'Yes'})} /> Yes</label>
                            <label><input type="radio" name="delivered" checked={formData.cars_delivered === 'No'} onChange={() => setFormData({...formData, cars_delivered: 'No'})} /> No</label>
                        </div>
                    </div>
                </div>

                {/* VEHICLE & STOCK */}
                <div className="form-section-header">Vehicle & Stock Management</div>
                <div className="form-grid-25-25-50">
                    <div className="field-box">
                        <label className="main-label">Affected Vehicle Type</label>
                        <div className="vertical-checkbox-group">
                            <label><input type="checkbox" checked={formData.vehicle_ev} onChange={e => setFormData({...formData, vehicle_ev: e.target.checked})} /> Bortana EV</label>
                            <label><input type="checkbox" checked={formData.vehicle_marrua} onChange={e => setFormData({...formData, vehicle_marrua: e.target.checked})} /> Marrua</label>
                        </div>
                    </div>
                    <div className="field-box">
                        <label className="main-label">Inform</label>
                        <div className="vertical-checkbox-group">
                            <label><input type="checkbox" checked={formData.inform_sw} onChange={e => setFormData({...formData, inform_sw: e.target.checked})} /> Software Team</label>
                            <label><input type="checkbox" checked={formData.inform_telematics} onChange={e => setFormData({...formData, inform_telematics: e.target.checked})} /> Telematics Team</label>
                        </div>
                    </div>
                    <div className="field-box">
                        <label className="main-label">Stock Action</label>
                        <div className="vertical-checkbox-group" style={{marginBottom: '15px'}}>
                            {['Need Update', 'Take Away', 'Transform', 'Finish Stock'].map(s => (
                                <label key={s}>
                                    <input type="checkbox" checked={formData.stock_action.includes(s)} onChange={() => handleCheckList('stock_action', s)} /> {s}
                                </label>
                            ))}
                        </div>
                        <textarea placeholder="Stock Details..." value={formData.stock_details} onChange={e => setFormData({...formData, stock_details: e.target.value})} />
                    </div>
                </div>

                {/* SUPPLIER & COSTS */}
                <div className="form-section-header">Supplier & Costs</div>
                <div className="form-grid-2">
                    <div className="field-box">
                        <label className="main-label">Supplier Name / Type</label>
                        <input type="text" placeholder="Enter supplier..." value={formData.supplier_name} onChange={e => setFormData({...formData, supplier_name: e.target.value})} />
                    </div>
                    <div className="field-box">
                        <label className="main-label">Cost Type / Discussion Notes</label>
                        <input type="text" placeholder="Enter notes..." value={formData.cost_notes} onChange={e => setFormData({...formData, cost_notes: e.target.value})} />
                    </div>
                </div>

                {/* APPROVAL WORKFLOW */}
                <div className="form-section-header">Approval Workflow</div>
                <div className="form-grid-2">
                    <div className="field-box">
                        <label className="main-label">Final Approval</label>
                        <select value={formData.approval_person} onChange={e => setFormData({...formData, approval_person: e.target.value})}>
                            <option value="">Select Approver</option>
                            <option value="David Lee">David Lee</option>
                            <option value="Eva Green">Eva Green</option>
                        </select>
                    </div>
                    <div className="field-box">
                        <label className="main-label">Date of Approval</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                </div>

                <div style={{marginTop: '50px', textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: '30px'}}>
                    <button type="button" onClick={() => navigate('/dashboard')} style={{background: 'none', border: 'none', marginRight: '30px', cursor: 'pointer', fontWeight: '600', color: '#888', textTransform: 'uppercase'}}>Discard</button>
                    <button type="submit" className="btn-yellow" disabled={!formData.item}>Submit for Review</button>
                </div>
            </form>
        </div>
    );
};

export default EngineeringReleaseForm;