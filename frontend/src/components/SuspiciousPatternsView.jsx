import React from 'react';
import { AlertTriangle, ShieldAlert, Zap, GitCommit, ChevronRight } from 'lucide-react';

export default function SuspiciousPatternsView({ suspiciousAlerts, onNodeSelect }) {
  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 60px)',
      padding: '24px',
      overflowY: 'auto',
      background: 'rgba(7, 9, 19, 0.95)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <ShieldAlert size={22} style={{ color: '#ff3366' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Automated Threat & Anomaly Alerts</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#8492a6' }}>
            Entities flagged based on high network centrality, inter-community bridge behavior, and temporal activity.
          </p>
        </div>

        {/* Flagged Alert Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(suspiciousAlerts || []).map((alert, idx) => {
            const riskScore = (alert.risk_score || alert.combined_score || 0).toFixed(3);
            const flags = alert.flags || ['HIGH_CENTRALITY'];

            return (
              <div
                key={alert.id || idx}
                onClick={() => onNodeSelect(alert)}
                className="glass-panel animate-fade-in"
                style={{
                  padding: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderLeft: '4px solid #ff3366',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                      {alert.label || alert.id}
                    </h3>
                    <span className={`badge-tag badge-${(alert.type || 'person').toLowerCase()}`}>
                      {alert.type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {flags.map((flag, fIdx) => (
                      <span
                        key={fIdx}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: flag === 'HIGH_CENTRALITY' ? 'rgba(0, 240, 255, 0.15)' :
                                      flag === 'INTER_COMMUNITY_BRIDGE' ? 'rgba(160, 96, 255, 0.15)' :
                                      'rgba(255, 51, 102, 0.15)',
                          color: flag === 'HIGH_CENTRALITY' ? '#00f0ff' :
                                 flag === 'INTER_COMMUNITY_BRIDGE' ? '#a060ff' :
                                 '#ff3366',
                          border: `1px solid ${flag === 'HIGH_CENTRALITY' ? 'rgba(0, 240, 255, 0.3)' :
                                              flag === 'INTER_COMMUNITY_BRIDGE' ? 'rgba(160, 96, 255, 0.3)' :
                                              'rgba(255, 51, 102, 0.3)'}`
                        }}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: '#8492a6', textTransform: 'uppercase' }}>Threat Rating</span>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: '#ff3366' }}>{riskScore}</p>
                  </div>
                  <ChevronRight size={18} style={{ color: '#8492a6' }} />
                </div>
              </div>
            );
          })}

          {(!suspiciousAlerts || suspiciousAlerts.length === 0) && (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: '#8492a6' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 12px', color: '#ffb703' }} />
              <p>No high-risk threats currently flagged. Upload crime reports to begin automated risk scanning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
