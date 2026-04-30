import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const MasterList = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard-data`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCatalog(data.releases || []));
  }, []);

  const filtered = catalog.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || i.part_number.includes(search)
  );

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Engineering Catalog</h1>
        <button onClick={() => navigate('/dashboard')}>← Back</button>
      </div>

      <input 
        type="text" 
        placeholder="Search by Description or Part ID..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ddd' }}
      />

      <table className="catalog-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Part Number</th>
            <th style={{ padding: '12px' }}>Description</th>
            <th style={{ padding: '12px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontFamily: 'var(--mono)' }}>{item.part_number}</td>
              <td style={{ padding: '12px' }}>{item.name}</td>
              <td style={{ padding: '12px' }}>
                <span className={`status-tag status-${item.status.toLowerCase()}`}>{item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterList;