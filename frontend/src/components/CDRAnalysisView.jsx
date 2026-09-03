import React, { useState, useRef } from 'react';
import { PhoneCall, Upload, Activity, Share2 } from 'lucide-react';
import CDRTimeline from './CDRTimeline';
import CDRChordDiagram from './CDRChordDiagram';

const CDRAnalysisView = ({ cdrData, onCDRUpload }) => {
  const [activeView, setActiveView] = useState('timeline');
  const fileInputRef = useRef(null);
  const { summary = {}, timeline = {}, chord = {} } = cdrData || {};
  const hasData = summary.total_records > 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onCDRUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <PhoneCall size={24} style={{ color: 'var(--cyan)' }} />
          Call Details Analysis
        </h2>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv" 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={16} /> Upload CDR Data
          </button>
        </div>
      </div>

      {!hasData ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', border: '1px dashed var(--border-light)', borderRadius: '12px' }}>
          <PhoneCall size={64} style={{ opacity: 0.15, marginBottom: '20px', color: 'var(--text-primary)' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>No CDR Data Loaded</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current?.click()}
          >
            Select CSV File
          </button>
        </div>
      ) : (
        <>
          <div className="cdr-summary-grid">
            <div className="cdr-stat-card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '5px' }}>Total Records</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--cyan)' }}>{summary.total_records}</div>
            </div>
            <div className="cdr-stat-card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '5px' }}>Total Calls</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--green)' }}>{summary.total_calls}</div>
            </div>
            <div className="cdr-stat-card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '5px' }}>Total SMS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--amber)' }}>{summary.total_sms}</div>
            </div>
            <div className="cdr-stat-card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '5px' }}>Total Duration</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--purple)' }}>{summary.total_duration_display}</div>
            </div>
            <div className="cdr-stat-card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '5px' }}>Unique Contacts</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b9d' }}>{summary.unique_contacts}</div>
            </div>
            <div className="cdr-stat-card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '5px' }}>Peak Hour</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--red)' }}>{summary.peak_hour_display}</div>
            </div>
          </div>

          <div className="cdr-view-toggle">
            <button 
              className={`cdr-view-btn ${activeView === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveView('timeline')}
            >
              <Activity size={16} /> Timeline View
            </button>
            <button 
              className={`cdr-view-btn ${activeView === 'chord' ? 'active' : ''}`}
              onClick={() => setActiveView('chord')}
            >
              <Share2 size={16} /> Chord Diagram
            </button>
          </div>

          <div style={{ marginTop: 'var(--space-md)' }}>
            {activeView === 'timeline' ? (
              <CDRTimeline timelineData={timeline} />
            ) : (
              <CDRChordDiagram chordData={chord} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CDRAnalysisView;
