import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ReleasePortal = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [releases, setReleases] = useState([]);
    const [selected, setSelected] = useState([]);
    
    // Filters State
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Extract parameters from URL
    const statusFilter = searchParams.get('status') || 'all';
    const timeframe = searchParams.get('timeframe') || 'all';

    useEffect(() => {
        const query = new URLSearchParams();
        
        if (statusFilter !== 'all') query.append('status', statusFilter);
        if (categoryFilter !== 'all') query.append('category', categoryFilter);
        
        if (startDate || endDate) {
            if (startDate) query.append('start', startDate);
            if (endDate) query.append('end', endDate);
        } else if (timeframe !== 'all') {
            query.append('timeframe', timeframe);
        }
        
        query.append('sort', sortBy);

        fetch(`http://localhost:3000/api/releases?${query.toString()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setReleases(data || []))
            .catch(err => console.error("Error fetching releases:", err));
    }, [statusFilter, categoryFilter, timeframe, startDate, endDate, sortBy]);

    const handleClearFilters = () => {
        setCategoryFilter('all');
        setStartDate('');
        setEndDate('');
        setSortBy('date');
        setSearchParams({}); 
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSearchParams(prev => {
            if (newStatus === 'all') prev.delete('status');
            else prev.set('status', newStatus);
            return prev;
        });
    };

    const handleSelect = (e, id) => {
        e.stopPropagation();
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        setSelected(selected.length === releases.length ? [] : releases.map(r => r.id));
    };

    const handleDelete = async () => {
        if (!selected.length) return;
        await fetch('http://localhost:3000/api/releases/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selected }),
            credentials: 'include'
        });
        window.location.reload();
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        return new Date(date).toLocaleDateString();
    };

    // Unified style object for the action controls
    const actionControlStyle = {
        padding: '10px 16px',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        background: '#fff',
        color: 'var(--text-h)',
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        fontFamily: 'inherit'
    };

    return (
        <div className="page-container">
            {/* Standardized Page Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '2.2rem', color: 'var(--text-h)' }}>Release Portal</h1>
                <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '1rem' }}>Manage your engineering releases and action items.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                
                {/* Sidebar Filter Menu */}
                <aside className="white-card" style={{ padding: '30px', marginTop: 0, alignSelf: 'start' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-h)' }}>Filters</h3>
                        <button onClick={handleClearFilters} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase' }}>
                            Clear all
                        </button>
                    </div>

                    <div className="field-box" style={{ padding: 0, border: 'none', marginBottom: '20px' }}>
                        <label className="main-label">Status</label>
                        <select value={statusFilter} onChange={handleStatusChange}>
                            <option value='all'>All Statuses</option>
                            <option value='Review'>Pending Review</option>
                            <option value='Approved'>Approved</option>
                            <option value='Assigned'>Action Item</option>
                        </select>
                    </div>

                    <div className="field-box" style={{ padding: 0, border: 'none', marginBottom: '25px' }}>
                        <label className="main-label">Category</label>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value='all'>All Categories</option>
                            <option value='Assembly'>Assembly</option>
                            <option value='Manufactured'>Manufactured</option>
                            <option value='Sourced - Finished'>Sourced - Finished</option>
                            <option value='Sourced - Unfinished'>Sourced - Unfinished</option>
                        </select>
                    </div>

                    <div className="field-box" style={{ padding: 0, border: 'none' }}>
                        <label className="main-label" style={{ marginBottom: '10px' }}>Date Range</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* List Controls - Now Unified */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '15px', borderBottom: '2px solid var(--bortana-yellow)' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-h)' }}>
                                {statusFilter === 'all' ? 'All Releases' : statusFilter === 'Review' ? 'Review Releases' : `${statusFilter} Releases`}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button 
                                onClick={handleSelectAll} 
                                style={actionControlStyle}
                            >
                                Select all
                            </button>
                            <button 
                                onClick={handleDelete} 
                                disabled={!selected.length} 
                                style={{ 
                                    ...actionControlStyle,
                                    cursor: selected.length ? 'pointer' : 'not-allowed',
                                    opacity: selected.length ? 1 : 0.5 
                                }}
                            >
                                Delete
                            </button>
                            <select 
                                value={sortBy} 
                                onChange={e => setSortBy(e.target.value)} 
                                style={{ ...actionControlStyle, width: 'auto', outline: 'none' }}
                            >
                                <option value='date'>Sort by: Date</option>
                            </select>
                        </div>
                    </div>

                    {/* Release List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {releases.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => navigate(`/release/${item.id}`)} 
                                className="white-card"
                                style={{ 
                                    marginTop: 0,
                                    display: 'grid', 
                                    gridTemplateColumns: 'auto 1fr auto', 
                                    gap: '20px', 
                                    alignItems: 'center', 
                                    padding: '25px', 
                                    cursor: 'pointer', 
                                    transition: 'transform 0.2s ease, border-color 0.2s ease' 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <input type='checkbox' checked={selected.includes(item.id)} onChange={(e) => handleSelect(e, item.id)} onClick={e => e.stopPropagation()} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-h)' }}>{item.part_number}</div>
                                    <div style={{ color: 'var(--text)', marginTop: '4px', fontSize: '0.95rem' }}>{item.name}</div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'var(--accent-bg)', color: 'var(--text-h)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                            {item.status || 'Review'}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: '#888' }}>{getRelativeTime(item.created_at)}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {item.created_by}
                                </div>
                            </div>
                        ))}
                        
                        {releases.length === 0 && (
                            <div className="white-card" style={{ marginTop: 0, padding: '60px', textAlign: 'center', color: '#888' }}>
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-h)' }}>No releases found</p>
                                <p style={{ margin: '8px 0 0', fontSize: '0.95rem' }}>Try adjusting your filters or clearing the date range.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ReleasePortal;