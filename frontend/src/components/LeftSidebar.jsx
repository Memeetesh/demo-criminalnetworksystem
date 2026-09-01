import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Circle, 
  Grid, 
  Cpu, 
  Search, 
  Map 
} from 'lucide-react';

const ENTITY_COLORS = {
  PERSON: '#ff6b9d',
  LOCATION: '#00e676',
  ORGANIZATION: '#7c4dff',
  VEHICLE: '#448aff',
  PHONE: '#ff9100',
  EMAIL: '#e040fb',
  MISC: '#8892a4'
};

const LeftSidebar = ({ 
  filters, 
  setFilters, 
  layoutName, 
  setLayoutName, 
  onFileUpload, 
  uploading, 
  entities = [], 
  onFindPath 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  // Responsive logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1200) {
        setIsCollapsed(false);
      }
    };
    
    // Set initial state
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const toggleFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleTracePath = () => {
    if (sourceNode && targetNode && onFindPath) {
      onFindPath(sourceNode, targetNode);
    }
  };

  if (isCollapsed) {
    return (
      <div className="glass-panel sidebar-left" style={{ width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
        <button className="btn-action" onClick={() => setIsCollapsed(false)} style={{ marginBottom: '2rem' }}>
          <ChevronRight size={20} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#8892a4' }}>
          <UploadCloud size={24} title="Data Ingestion" />
          <Search size={24} title="Filters" />
          <Share2 size={24} title="Layout" />
          <Map size={24} title="Pathfinder" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel sidebar-left" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Controls</h2>
        <button className="btn-action" onClick={() => setIsCollapsed(true)}>
          <ChevronLeft size={20} />
        </button>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Section 1 - Data Ingestion */}
        <section>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Data Ingestion
          </h3>
          <div 
            className={`drop-zone ${isDragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragActive ? '#00e5ff' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              backgroundColor: isDragActive ? 'rgba(0, 229, 255, 0.05)' : 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => document.getElementById('sidebar-file-input').click()}
          >
            <input 
              type="file" 
              id="sidebar-file-input" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".pdf,.json,.csv"
            />
            <UploadCloud size={32} style={{ color: isDragActive ? '#00e5ff' : '#8892a4', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#e5e7eb' }}>
              {uploading ? 'Processing...' : 'Drag & drop text or JSON files here'}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', display: 'block' }}>
              or click to browse
            </span>
          </div>
        </section>

        {/* Section 2 - Entity Filters */}
        <section>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Entity Filters
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(ENTITY_COLORS).map(([type, color]) => {
              const isActive = filters ? filters[type] !== false : true;
              return (
                <div 
                  key={type}
                  onClick={() => toggleFilter(type)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
                    <span style={{ fontSize: '0.85rem', color: isActive ? '#fff' : '#6b7280' }}>{type}</span>
                  </div>
                  {isActive && <Check size={14} style={{ color }} />}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3 - Graph Layout */}
        <section>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Graph Layout
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { id: 'cose-bilkent', label: 'Force Physics', icon: Share2 },
              { id: 'concentric', label: 'Concentric', icon: Circle },
              { id: 'circle', label: 'Circular', icon: Cpu },
              { id: 'grid', label: 'Grid', icon: Grid }
            ].map(layout => {
              const Icon = layout.icon;
              const isActive = layoutName === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => setLayoutName(layout.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem', borderRadius: '6px', border: '1px solid',
                    backgroundColor: isActive ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0,0,0,0.2)',
                    borderColor: isActive ? '#00e5ff' : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#00e5ff' : '#8892a4',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Icon size={20} />
                  <span style={{ fontSize: '0.75rem' }}>{layout.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 4 - Pathfinder */}
        <section>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Pathfinder
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <select 
              value={sourceNode} 
              onChange={(e) => setSourceNode(e.target.value)}
              style={{ 
                width: '100%', padding: '0.5rem', borderRadius: '4px', 
                backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)', outline: 'none'
              }}
            >
              <option value="">Select Source Entity...</option>
              {entities.map(n => <option key={`src-${n.id}`} value={n.id}>{n.label || n.id}</option>)}
            </select>
            
            <select 
              value={targetNode} 
              onChange={(e) => setTargetNode(e.target.value)}
              style={{ 
                width: '100%', padding: '0.5rem', borderRadius: '4px', 
                backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)', outline: 'none'
              }}
            >
              <option value="">Select Target Entity...</option>
              {entities.map(n => <option key={`tgt-${n.id}`} value={n.id}>{n.label || n.id}</option>)}
            </select>
            
            <button 
              className="btn-primary" 
              onClick={handleTracePath}
              disabled={!sourceNode || !targetNode}
              style={{ 
                opacity: (!sourceNode || !targetNode) ? 0.5 : 1,
                cursor: (!sourceNode || !targetNode) ? 'not-allowed' : 'pointer'
              }}
            >
              Trace Path
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LeftSidebar;
