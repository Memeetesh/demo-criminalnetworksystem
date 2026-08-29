import React, { useState } from 'react';
import { Upload, Filter, Layers, Navigation, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const ENTITY_TYPES = [
  { key: 'PERSON', label: 'Persons', color: '#ff6b9d' },
  { key: 'LOCATION', label: 'Locations', color: '#00e676' },
  { key: 'ORGANIZATION', label: 'Organizations', color: '#7c4dff' },
  { key: 'VEHICLE', label: 'Vehicles', color: '#448aff' },
  { key: 'PHONE', label: 'Phones', color: '#ff9100' },
  { key: 'EMAIL', label: 'Emails', color: '#e040fb' }
];

export default function LeftSidebar({
  filters,
  setFilters,
  layoutName,
  setLayoutName,
  onFileUpload,
  uploading,
  entities,
  onFindPath
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [sourceEntity, setSourceEntity] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFilterToggle = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handlePathSearch = () => {
    if (sourceEntity && targetEntity) {
      onFindPath(sourceEntity, targetEntity);
    }
  };

  if (collapsed) {
    return (
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '72px',
        zIndex: 90
      }}>
        <button
          onClick={() => setCollapsed(false)}
          className="glass-panel"
          style={{
            padding: '10px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside style={{
      width: '280px',
      height: 'calc(100vh - 60px)',
      background: 'rgba(10, 13, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      overflowY: 'auto',
      zIndex: 80,
      position: 'relative'
    }}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(true)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '16px',
          background: 'none',
          border: 'none',
          color: '#8492a6',
          cursor: 'pointer'
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {/* 1. Data Ingestion Panel */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Upload size={14} style={{ color: '#00f0ff' }} /> Data Ingestion
        </h3>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? '#00f0ff' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            background: dragOver ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input
            id="file-upload-input"
            type="file"
            accept=".csv,.json,.pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {uploading ? 'Processing...' : 'Drag & Drop files'}
          </p>
          <p style={{ fontSize: '10px', color: '#8492a6' }}>Supports CSV, JSON, PDF</p>
        </div>
      </div>

      {/* 2. Entity Filters */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} style={{ color: '#00ff88' }} /> Entity Filters
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {ENTITY_TYPES.map(({ key, label, color }) => {
            const active = filters[key] !== false;
            return (
              <div
                key={key}
                onClick={() => handleFilterToggle(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: active ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: color }} />
                  <span style={{ fontSize: '12px', color: active ? '#fff' : '#64748b' }}>{label}</span>
                </div>
                {active && <Check size={12} style={{ color: '#00ff88' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Layout Controls */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} style={{ color: '#a060ff' }} /> Graph Layout
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[
            { id: 'cose-bilkent', label: 'Force Physics' },
            { id: 'concentric', label: 'Concentric' },
            { id: 'circle', label: 'Circular' },
            { id: 'grid', label: 'Grid' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setLayoutName(id)}
              className={`btn-action ${layoutName === id ? 'active' : ''}`}
              style={{ justifyContent: 'center', fontSize: '11px' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Shortest Pathfinder Tool */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Navigation size={14} style={{ color: '#ffb703' }} /> Pathfinder Trace
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select
            value={sourceEntity}
            onChange={(e) => setSourceEntity(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fff',
              padding: '6px 10px',
              fontSize: '11px',
              outline: 'none'
            }}
          >
            <option value="" style={{ background: '#0a0d1a' }}>Select Source Entity...</option>
            {Object.values(entities || {}).map(e => (
              <option key={e.id} value={e.id} style={{ background: '#0a0d1a' }}>
                {e.name || e.label || e.id} ({e.type})
              </option>
            ))}
          </select>

          <select
            value={targetEntity}
            onChange={(e) => setTargetEntity(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fff',
              padding: '6px 10px',
              fontSize: '11px',
              outline: 'none'
            }}
          >
            <option value="" style={{ background: '#0a0d1a' }}>Select Target Entity...</option>
            {Object.values(entities || {}).map(e => (
              <option key={e.id} value={e.id} style={{ background: '#0a0d1a' }}>
                {e.name || e.label || e.id} ({e.type})
              </option>
            ))}
          </select>

          <button
            onClick={handlePathSearch}
            disabled={!sourceEntity || !targetEntity}
            className="btn-primary"
            style={{
              width: '100%',
              fontSize: '11px',
              padding: '7px',
              opacity: (!sourceEntity || !targetEntity) ? 0.5 : 1
            }}
          >
            Trace Path
          </button>
        </div>
      </div>
    </aside>
  );
}
