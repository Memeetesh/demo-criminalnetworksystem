import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Share2, 
  FileText, 
  AlertTriangle, 
  Database,
  Menu,
  X
} from 'lucide-react';

const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  statusText, 
  statusType, 
  onUploadClick, 
  searchQuery, 
  setSearchQuery 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getStatusColor = () => {
    switch(statusType) {
      case 'success': return '#00e676';
      case 'error': return '#ff1744';
      case 'warning': return '#ff9100';
      case 'processing': return '#2979ff';
      default: return '#78909c';
    }
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Section */}
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="logo-icon" style={{ color: '#00e676' }}>
            <Shield size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '1px' }}>
              CRIMINAL NETWORK INTELLIGENCE
            </h1>
            <span className="badge-tag badge-alert" style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255, 23, 68, 0.15)', color: '#ff1744', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ff1744' }}>
              CIB CLASSIFIED
            </span>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button 
            className="btn-action"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ padding: '0.5rem' }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Desktop / Expanded Mobile Actions */}
        <div className="navbar-actions" style={{ 
          display: isMobile && !isMobileMenuOpen ? 'none' : 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '1rem',
          flex: isMobile ? '1 1 100%' : 'auto'
        }}>
          
          {/* Search Bar (Hidden on Mobile) */}
          {!isMobile && (
            <div className="search-bar" style={{ position: 'relative', minWidth: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8892a4' }} />
              <input 
                type="text" 
                placeholder="Search entities, phones, addresses..." 
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 1rem 0.5rem 2.2rem', 
                  borderRadius: '6px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Status Indicator */}
          <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div 
              className="pulse-dot" 
              style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 8px ${getStatusColor()}`
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#b0bec5' }}>
              {statusText || 'System Ready'}
            </span>
          </div>

          {/* Ingest Data Button */}
          <button className="btn-primary" onClick={onUploadClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <Database size={16} />
            Ingest Data
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="navbar-tabs" style={{ 
        display: isMobile && !isMobileMenuOpen ? 'none' : 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        marginTop: '1rem', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        paddingTop: '0.5rem',
        gap: '0.5rem'
      }}>
        <button 
          className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`} 
          onClick={() => setActiveTab('graph')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            background: activeTab === 'graph' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', borderRadius: '4px', color: activeTab === 'graph' ? '#fff' : '#8892a4',
            cursor: 'pointer', transition: 'all 0.2s', justifyContent: isMobile ? 'flex-start' : 'center'
          }}
        >
          <Share2 size={16} />
          Network Graph
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'entities' ? 'active' : ''}`} 
          onClick={() => setActiveTab('entities')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            background: activeTab === 'entities' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', borderRadius: '4px', color: activeTab === 'entities' ? '#fff' : '#8892a4',
            cursor: 'pointer', transition: 'all 0.2s', justifyContent: isMobile ? 'flex-start' : 'center'
          }}
        >
          <FileText size={16} />
          Extracted Entities
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} 
          onClick={() => setActiveTab('alerts')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            background: activeTab === 'alerts' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', borderRadius: '4px', color: activeTab === 'alerts' ? '#fff' : '#8892a4',
            cursor: 'pointer', transition: 'all 0.2s', justifyContent: isMobile ? 'flex-start' : 'center'
          }}
        >
          <AlertTriangle size={16} />
          Suspicious Alerts
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
