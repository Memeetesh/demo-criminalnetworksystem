import React, { useState } from 'react';
import { Search, Filter, Phone, Car, Mail, MapPin, Building, User, ChevronRight } from 'lucide-react';

const TYPE_ICONS = {
  PERSON: User,
  LOCATION: MapPin,
  ORGANIZATION: Building,
  VEHICLE: Car,
  PHONE: Phone,
  EMAIL: Mail
};

export default function ExtractedEntitiesView({ entities, onNodeSelect }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const entityList = Object.values(entities || {});

  const filtered = entityList.filter(item => {
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const name = (item.name || item.label || item.id || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 60px)',
      padding: '24px',
      overflowY: 'auto',
      background: 'rgba(7, 9, 19, 0.95)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Extracted Entities Database</h2>
            <p style={{ fontSize: '13px', color: '#8492a6' }}>
              Showing {filtered.length} of {entityList.length} total extracted entities
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'PERSON', 'LOCATION', 'ORGANIZATION', 'VEHICLE', 'PHONE', 'EMAIL'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`btn-action ${filterType === type ? 'active' : ''}`}
                style={{ fontSize: '11px', textTransform: 'capitalize' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8492a6' }} />
          <input
            type="text"
            placeholder="Search entity database by name, alias, phone, vehicle plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Entities Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filtered.map(entity => {
            const Icon = TYPE_ICONS[entity.type] || User;
            return (
              <div
                key={entity.id}
                onClick={() => onNodeSelect(entity)}
                className="glass-panel"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: '#00f0ff'
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                        {entity.name || entity.label || entity.id}
                      </h3>
                      <span className={`badge-tag badge-${(entity.type || 'person').toLowerCase()}`}>
                        {entity.type}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#8492a6' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8492a6', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <span>Mentions: <strong style={{ color: '#fff' }}>{entity.mention_count || 1}</strong></span>
                  <span>Cluster: <strong style={{ color: '#a060ff' }}>Group #{entity.community ?? 'N/A'}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
