import React, { useState } from 'react';
import { User, MapPin, Building, Car, Phone, Mail, Search } from 'lucide-react';

const ENTITY_COLORS = {
  PERSON: '#ff6b9d',
  LOCATION: '#00e676',
  ORGANIZATION: '#7c4dff',
  VEHICLE: '#448aff',
  PHONE: '#ff9100',
  EMAIL: '#e040fb',
  MISC: '#8892a4'
};

const ExtractedEntitiesView = ({ entities = {}, onNodeSelect }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const entityArray = Array.isArray(entities) ? entities : Object.values(entities);

  const filteredEntities = entityArray.filter((entity) => {
    const matchesType = filterType === 'ALL' || entity.type === filterType;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (entity.name && entity.name.toLowerCase().includes(term)) ||
      (entity.label && entity.label.toLowerCase().includes(term)) ||
      (entity.id && entity.id.toLowerCase().includes(term));
    return matchesType && matchesSearch;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'PERSON': case 'PER': return <User size={18} />;
      case 'LOCATION': case 'LOC': return <MapPin size={18} />;
      case 'ORGANIZATION': case 'ORG': return <Building size={18} />;
      case 'VEHICLE': return <Car size={18} />;
      case 'PHONE': return <Phone size={18} />;
      case 'EMAIL': return <Mail size={18} />;
      default: return <User size={18} />;
    }
  };

  const types = ['ALL', 'PERSON', 'LOCATION', 'ORGANIZATION', 'VEHICLE', 'PHONE', 'EMAIL', 'MISC'];

  return (
    <div className="entities-view animate-fade-in" style={{ padding: 'var(--space-lg)', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="glass-panel" style={{ marginBottom: 'var(--space-md)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Extracted Entities Database</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {filteredEntities.length} of {entityArray.length} entities
          </p>
        </div>
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px',
              border: '1px solid var(--border-light)', backgroundColor: 'rgba(0,0,0,0.3)',
              color: '#fff', fontSize: '0.85rem', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-md)' }}>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className="btn-action"
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
              background: filterType === t ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: filterType === t ? 'var(--cyan)' : 'var(--border-light)',
              color: filterType === t ? 'var(--cyan)' : 'var(--text-secondary)'
            }}
          >
            {t !== 'ALL' && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ENTITY_COLORS[t] || '#888', marginRight: '6px' }} />}
            {t}
          </button>
        ))}
      </div>

      {/* Entity Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        {filteredEntities.length > 0 ? (
          filteredEntities.map(entity => {
            const color = ENTITY_COLORS[entity.type] || '#8892a4';
            return (
              <div
                key={entity.id}
                className="glass-panel"
                onClick={() => onNodeSelect && onNodeSelect(entity)}
                style={{ cursor: 'pointer', borderTop: `3px solid ${color}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ padding: '8px', backgroundColor: `${color}15`, borderRadius: '8px', color: color }}>
                    {getIcon(entity.type)}
                  </div>
                  <span className="badge-tag" style={{
                    backgroundColor: `${color}15`, color: color,
                    border: `1px solid ${color}40`, fontSize: '0.65rem'
                  }}>
                    {entity.type || 'MISC'}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#fff', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entity.name || entity.label || entity.id}
                </h3>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Mentions</div>
                    <div style={{ color: '#fff', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{entity.mention_count || 1}</div>
                  </div>
                  {entity.community !== undefined && (
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Community</div>
                      <div style={{ color: '#fff', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>#{entity.community}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No entities match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractedEntitiesView;
