import React from 'react';
import { ShieldAlert } from 'lucide-react';

const FLAG_STYLES = {
  HIGH_CENTRALITY: { bg: 'rgba(0,240,255,0.1)', color: '#00f0ff', border: 'rgba(0,240,255,0.25)', label: 'High Centrality' },
  INTER_COMMUNITY_BRIDGE: { bg: 'rgba(160,96,255,0.1)', color: '#a060ff', border: 'rgba(160,96,255,0.25)', label: 'Community Bridge' },
  HIGH_ACTIVITY: { bg: 'rgba(255,51,102,0.1)', color: '#ff3366', border: 'rgba(255,51,102,0.25)', label: 'High Activity' }
};

const SuspiciousPatternsView = ({ suspiciousAlerts = [], onNodeSelect }) => {
  return (
    <div className="animate-fade-in" style={{ padding: 'var(--space-lg)', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="glass-panel" style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ padding: '10px', backgroundColor: 'rgba(255,51,102,0.15)', borderRadius: '10px', color: '#ff3366', flexShrink: 0 }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>Automated Threat & Anomaly Alerts</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Entities flagged by automated intelligence analysis based on network centrality, inter-community bridging, or abnormally high activity patterns.
          </p>
        </div>
      </div>

      {/* Alert Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {suspiciousAlerts.length > 0 ? (
          suspiciousAlerts.map((alert, index) => {
            const riskScore = alert.risk_score || alert.combined_score || 0;
            const flags = alert.flags || (alert.flag ? [alert.flag] : []);

            return (
              <div
                key={alert.id || index}
                className="glass-panel animate-fade-in"
                onClick={() => onNodeSelect && onNodeSelect(alert)}
                style={{
                  cursor: 'pointer', borderLeft: '4px solid #ff3366',
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#fff' }}>
                        {alert.name || alert.label || alert.id}
                      </h3>
                      <span className="badge-tag" style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-secondary)', fontSize: '0.65rem'
                      }}>
                        {alert.type || 'UNKNOWN'}
                      </span>
                    </div>

                    {/* Flag Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {flags.map(flag => {
                        const s = FLAG_STYLES[flag] || { bg: 'rgba(255,183,3,0.1)', color: '#ffb703', border: 'rgba(255,183,3,0.25)', label: flag.replace(/_/g, ' ') };
                        return (
                          <span key={flag} className="badge-tag" style={{
                            backgroundColor: s.bg, color: s.color,
                            border: `1px solid ${s.border}`, borderRadius: '20px',
                            fontSize: '0.7rem', padding: '3px 10px'
                          }}>
                            {s.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px', border: '1px solid var(--border-light)', minWidth: '80px'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      Threat
                    </span>
                    <span style={{
                      fontSize: '1.5rem', fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: riskScore > 0.7 ? '#ff3366' : riskScore > 0.4 ? '#ff9100' : '#ffb703'
                    }}>
                      {(riskScore * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ padding: '16px', display: 'inline-flex', backgroundColor: 'rgba(0,255,136,0.1)', borderRadius: '50%', color: 'var(--green)', marginBottom: '16px' }}>
              <ShieldAlert size={32} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>No active threats detected</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
              The network analysis hasn't flagged any entities with suspicious patterns. Ingest data to begin analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspiciousPatternsView;
