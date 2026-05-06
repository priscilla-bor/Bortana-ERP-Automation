import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const EngineeringReleaseForm = ({ user }) => {
    const navigate = useNavigate();
    
    // --- LOGIC VARIABLES ---
    const [itemMaster, setItemMaster] = useState([]);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    
    // STATE OBJECT
    const [formData, setFormData] = useState({
        // Part Information
        project: '6040', system: '006', item: '', finish: '00', rev: '001', code: 'B',
        part_name: '',
        part_number: '',
        Assembly: false,
        Sourced_Finished: false,
        Sourced_Unfinished: false,

        // Modification Details
        New: true, 
        Modified: false, 
        Phaseout: false,
        modification_description: '',
        modification_reason: '',
        responsible_engineer: user?.name || '', 

        // Design & Analysis
        drawing_2d: false, 
        drawing_3d: true,
        fea: 'No', 
        test_reports: 'No', 
        mandatory: 'No',

        // Impact (Consolidated Section)
        doc_internal: [], 
        doc_external: [],
        compliance_adr: false, 
        compliance_intl: false, 
        compliance_others: '',
        cars_delivered: 'No',
        vehicle_ev: true, 
        vehicle_marrua: false,
        inform_sw: false, 
        inform_telematics: false,
        stock_action: [], 
        stock_details: '',

        // Supplier & Costs
        supplier_name: '', 
        cost_notes: '',

        // Approval Workflow
        approval_person: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Auto-fill Responsible Engineer from Auth User
    useEffect(() => {
        if (user && user.name) {
            setFormData(prev => ({ ...prev, responsible_engineer: user.name }));
        }
    }, [user]);

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

    const handleCheckList = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullPN = `${formData.project}.${formData.system}.${formData.item}.${formData.finish}.${formData.rev}.${formData.code}`;

        await fetch(`${API_BASE_URL}/components`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, part_number: fullPN, name: formData.part_name, status: 'Review' }),
            credentials: 'include'
        });
        
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
                <div className="form-section-header">Part Identifier</div>
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

                {/* PART INFORMATION */}
                <div className="form-section-header">Part Information</div>

                <div className="form-grid-2">
                    <div className="field-box">
                        <label className="main-label">Part Name</label>
                        <input type="text" placeholder="Enter part name..." value={formData.part_name} onChange={e => setFormData({...formData, part_name: e.target.value})} />
                    </div>

                <div className="field-box">
                        <label className="main-label">Part Number </label>
                        <input 
                            type="text" 
                            value={formData.part_number} 
                            readOnly 
                            className="id-readonly" 
                            style={{ fontWeight: '600', backgroundColor: '#f9f9f9' }} 
                        />
                    </div>

                    <div className="field-box">
                            <label className="main-label">Project Code</label>
                            <input 
                                type="text" 
                                value="6040" 
                                readOnly 
                                className="id-readonly" 
                                style={{ fontWeight: '600' }} 
                            />
                        </div>


                    <div className="field-box">
                        <label className="main-label">Part Type</label>
                        <div className="vertical-checkbox-group">
                            <label><input type="checkbox" checked={formData.Assembly} onChange={e => setFormData({...formData, Assembly: e.target.checked})} /> Assembly</label>
                            <label><input type="checkbox" checked={formData.Sourced_Finished} onChange={e => setFormData({...formData, Sourced_Finished: e.target.checked})} /> Sourced - Finished</label>
                            <label><input type="checkbox" checked={formData.Sourced_Unfinished} onChange={e => setFormData({...formData, Sourced_Unfinished: e.target.checked})} /> Sourced - Unfinished</label>
                        </div>                
                    </div>
                </div>
            
                {/* MODIFICATION DETAILS */}
                <div className='form-section-header'>Modification Details</div>
                <div className='form-grid-2'>
                    <div className='field-box'>
                        <label className='main-label'>Modification Type</label>
                        <label><input type="checkbox" checked={formData.New} onChange={e => setFormData({...formData, New: e.target.checked})} /> New</label>
                        <label><input type="checkbox" checked={formData.Modified} onChange={e => setFormData({...formData, Modified: e.target.checked})} /> Modified</label>
                        <label><input type="checkbox" checked={formData.Phaseout} onChange={e => setFormData({...formData, Phaseout: e.target.checked})} /> Phaseout</label>
                    </div>

                    <div className='field-box'>
                        <label className='main-label'>Modification Description</label>
                        <textarea placeholder='Enter modification description...' value={formData.modification_description} onChange={e => setFormData({...formData, modification_description: e.target.value})} />
                    </div>

                    <div className='field-box'>
                        <label className='main-label'>Modification Reason</label>
                        <textarea placeholder='Enter modification reason...' value={formData.modification_reason} onChange={e => setFormData({...formData, modification_reason: e.target.value})} />
                    </div>

                    <div className="field-box">
                            <label className="main-label">Responsible Engineer</label>
                            <input 
                                type="text" 
                                value={formData.responsible_engineer} 
                                readOnly 
                                className="id-readonly"  
                            />
                        </div>
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

                {/* CONSOLIDATED IMPACT SECTION */}
                <div className="form-section-header">Impact</div>
                <div className="form-grid-2">
                    {/* Documentation */}
                    <div className="field-box">
                        <label className="main-label">Documentation Affected</label>
                        <div className="vertical-checkbox-group">
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '5px 0' }}>Internal</p>
                            {['Workshop Manual', 'Technical Specification'].map(item => (
                                <label key={item}>
                                    <input type="checkbox" checked={formData.doc_internal.includes(item)} onChange={() => handleCheckList('doc_internal', item)} /> {item}
                                </label>
                            ))}
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '10px 0 5px' }}>External</p>
                            {['Parts Catalogue', 'Operator’s Handbook', 'Maintenance Supplement', 'Training Material/Documentation'].map(item => (
                                <label key={item}>
                                    <input type="checkbox" checked={formData.doc_external.includes(item)} onChange={() => handleCheckList('doc_external', item)} /> {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Regulatory & Stock */}
                    <div className="field-box">
                        <label className="main-label">Compliance & Regulatory</label>
                        <div className="vertical-checkbox-group" style={{ marginBottom: '20px' }}>
                            <label><input type="checkbox" checked={formData.compliance_adr} onChange={e => setFormData({...formData, compliance_adr: e.target.checked})} /> ADR (Australian Design Rules)</label>
                            <label><input type="checkbox" checked={formData.compliance_intl} onChange={e => setFormData({...formData, compliance_intl: e.target.checked})} /> International Standards</label>
                            <input type="text" placeholder="Other Compliance..." value={formData.compliance_others} onChange={e => setFormData({...formData, compliance_others: e.target.value})} style={{ marginTop: '5px' }} />
                        </div>

                        <label className="main-label">Vehicle & Stock Management</label>
                        <div className="vertical-checkbox-group">
                            <label><input type="checkbox" checked={formData.vehicle_ev} onChange={e => setFormData({...formData, vehicle_ev: e.target.checked})} /> Bortana EV</label>
                            <label><input type="checkbox" checked={formData.vehicle_marrua} onChange={e => setFormData({...formData, vehicle_marrua: e.target.checked})} /> Marrua</label>
                            <div style={{ marginTop: '10px' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Stock Action</p>
                                {['Need Update', 'Take Away', 'Transform', 'Finish Stock'].map(s => (
                                    <label key={s}>
                                        <input type="checkbox" checked={formData.stock_action.includes(s)} onChange={() => handleCheckList('stock_action', s)} /> {s}
                                    </label>
                                ))}
                                <textarea placeholder="Stock Details..." value={formData.stock_details} onChange={e => setFormData({...formData, stock_details: e.target.value})} style={{ marginTop: '10px' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUPPLIER & COSTS */}
                <div className="form-section-header">Supplier & Costs</div>
                <div className="form-grid-2">
                    <div className="field-box">
                        <label className="main-label">Supplier Name</label>
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
                        <label className="main-label">Reviewer</label>
                        <select value={formData.approval_person} onChange={e => setFormData({...formData, approval_person: e.target.value})}>
                            <option value="">Select Approver</option>
                            <option value="Shiying Wu">Shiying Wu</option>
                            <option value="David Lee">David Lee</option>
                            <option value="Eva Green">Eva Green</option>
                        </select>
                    </div>
                    <div className="field-box"> 
                        <label className="main-label">Date</label>
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