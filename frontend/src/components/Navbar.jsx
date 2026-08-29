import React from 'react';
import { Shield, Activity, Upload, Search, Network, Users, AlertTriangle, Cpu } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  statusText, 
  statusType, 
  onUploadClick,
  searchQuery,
  setSearchQuery
}) {
  const getStatusColor = () => {
    if (statusType === 'error') return '#ff3366';
    if (statusType === 'success') return '#00ff88';
    return '#00f0ff';
  };

  return (
    <header style={{
      height: '60px',
      background: 'rgba(10, 13, 26, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 100
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(124, 77, 255, 0.3))',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00f0ff'
        }}>
          <Shield size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px', color: '#fff' }}>
              CRIMINAL NETWORK INTELLIGENCE
            </h1>
            <span style={{
              background: 'rgba(255, 51, 102, 0.15)',
              color: '#ff3366',
              border: '1px solid rgba(255, 51, 102, 0.3)',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              CIB CLASSIFIED
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#8492a6' }}>AI Analytics Engine & Entity Mapper</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => setActiveTab('graph')}
          className={`btn-action ${activeTab === 'graph' ? 'active' : ''}`}
        >
          <Network size={14} /> Network Graph
        </button>
        <button
          onClick={() => setActiveTab('entities')}
          className={`btn-action ${activeTab === 'entities' ? 'active' : ''}`}
        >
          <Users size={14} /> Extracted Entities
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`btn-action ${activeTab === 'alerts' ? 'active' : ''}`}
        >
          <AlertTriangle size={14} /> Suspicious Alerts
        </button>
      </div>

      {/* Search & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8492a6' }} />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 32px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>

        {/* Upload Trigger Button */}
        <button onClick={onUploadClick} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Upload size={14} /> Ingest Data
        </button>

        {/* Live Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div className="pulse-dot" style={{ backgroundColor: getStatusColor(), color: getStatusColor() }} />
          <span style={{ fontSize: '11px', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>{statusText}</span>
        </div>
      </div>
    </header>
  );
}
