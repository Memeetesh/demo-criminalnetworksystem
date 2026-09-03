import React, { useState } from 'react';
import { ScanSearch, Phone, Car, Mail, DollarSign, Calendar } from 'lucide-react';

const CATEGORIES = [
  { key: 'phones', label: 'Phone Numbers', icon: Phone, color: '#ff9100' },
  { key: 'vehicles', label: 'Vehicle Plates', icon: Car, color: '#448aff' },
  { key: 'emails', label: 'Email Addresses', icon: Mail, color: '#e040fb' },
  { key: 'money', label: 'Money/Currency', icon: DollarSign, color: '#ffd700' },
  { key: 'dates', label: 'Dates', icon: Calendar, color: '#26c6da' }
];

const PatternResultsView = ({ patternResults }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const { phones, vehicles, emails, money, dates, counts } = patternResults;
  const totalCount = counts.phones + counts.vehicles + counts.emails + counts.money + counts.dates;

  const renderPhone = (item, idx) => (
    <div key={`phone-${idx}`} className="pattern-result-row animate-fade-in">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#fff' }}>{item.normalized || item.raw}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Raw: {item.raw}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="badge-tag badge-phone">{item.type || 'PHONE'}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doc: {item.doc_id}</span>
      </div>
    </div>
  );

  const renderVehicle = (item, idx) => (
    <div key={`vehicle-${idx}`} className="pattern-result-row animate-fade-in">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#fff' }}>{item.normalized || item.raw}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Raw: {item.raw}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="badge-tag badge-vehicle">{item.plate_type || 'VEHICLE'}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doc: {item.doc_id}</span>
      </div>
    </div>
  );

  const renderEmail = (item, idx) => (
    <div key={`email-${idx}`} className="pattern-result-row animate-fade-in">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#fff' }}>{item.raw}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="badge-tag badge-email">{item.domain || 'EMAIL'}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doc: {item.doc_id}</span>
      </div>
    </div>
  );

  const renderMoney = (item, idx) => (
    <div key={`money-${idx}`} className="pattern-result-row animate-fade-in">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#fff' }}>
          {item.currency}{item.amount ? item.amount.toLocaleString() : ''}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Raw: {item.raw}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="badge-tag badge-money">MONEY</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doc: {item.doc_id}</span>
      </div>
    </div>
  );

  const renderDate = (item, idx) => (
    <div key={`date-${idx}`} className="pattern-result-row animate-fade-in">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#fff' }}>{item.normalized || item.raw}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Raw: {item.raw}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="badge-tag badge-date">DATE</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doc: {item.doc_id}</span>
      </div>
    </div>
  );

  const getFilteredItems = () => {
    let items = [];
    if (activeCategory === 'all' || activeCategory === 'phones') items.push(...phones.map((item, idx) => ({ ...item, type_key: 'phones', render: () => renderPhone(item, idx) })));
    if (activeCategory === 'all' || activeCategory === 'vehicles') items.push(...vehicles.map((item, idx) => ({ ...item, type_key: 'vehicles', render: () => renderVehicle(item, idx) })));
    if (activeCategory === 'all' || activeCategory === 'emails') items.push(...emails.map((item, idx) => ({ ...item, type_key: 'emails', render: () => renderEmail(item, idx) })));
    if (activeCategory === 'all' || activeCategory === 'money') items.push(...money.map((item, idx) => ({ ...item, type_key: 'money', render: () => renderMoney(item, idx) })));
    if (activeCategory === 'all' || activeCategory === 'dates') items.push(...dates.map((item, idx) => ({ ...item, type_key: 'dates', render: () => renderDate(item, idx) })));
    return items;
  };

  const filteredItems = getFilteredItems();

  return (
    <div style={{ padding: 'var(--space-lg)', height: '100%', overflowY: 'auto' }} className="animate-fade-in">
      <div className="glass-panel" style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '12px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '12px', color: 'var(--cyan)' }}>
          <ScanSearch size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Regex Pattern Extraction Engine</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Extracting structured data using regex patterns. Total matches: <strong style={{ color: 'var(--cyan)' }}>{totalCount}</strong>
          </p>
        </div>
      </div>

      <div className="pattern-summary-grid">
        {CATEGORIES.map(cat => (
          <div 
            key={cat.key} 
            className={`pattern-summary-card ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
            style={{ borderTop: `3px solid ${cat.color}` }}
          >
            <cat.icon size={24} style={{ color: cat.color, marginBottom: '8px' }} />
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
              {counts[cat.key]}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {cat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="pattern-tab-bar">
        <button 
          className={`pattern-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Patterns
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.key}
            className={`pattern-tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => item.render())
        ) : (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ScanSearch size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>No patterns found for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternResultsView;
