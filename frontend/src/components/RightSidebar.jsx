import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Hash, 
  Activity, 
  Users, 
  Star, 
  Target, 
  Info, 
  ShieldAlert,
  Share2
} from 'lucide-react';

const ENTITY_COLORS = {
  PERSON: '#ff6b9d',
  PER: '#ff6b9d',
  LOCATION: '#00e676',
  LOC: '#00e676',
  ORGANIZATION: '#7c4dff',
  ORG: '#7c4dff',
  VEHICLE: '#448aff',
  PHONE: '#ff9100',
  EMAIL: '#e040fb',
  MISC: '#8892a4'
};

const RightSidebar = ({ 
  selectedNode, 
  networkStats, 
  keyPlayers = [], 
  communities = [], 
  suspiciousAlerts = [],
  onNodeSelect 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return Number.isInteger(num) ? num.toString() : num.toFixed(3);
  };

  const getEntityBadgeColor = (type) => {
    return ENTITY_COLORS[type] || ENTITY_COLORS.MISC;
  };

  if (isCollapsed) {
    return (
      <div className="glass-panel sidebar-right" style={{ width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
        <button className="btn-action" onClick={() => setIsCollapsed(false)} style={{ marginBottom: '2rem' }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#8892a4' }}>
          <Info size={24} title="Entity Dossier" />
          <Activity size={24} title="Network Stats" />
          <Star size={24} title="Key Players" />
          <Users size={24} title="Communities" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel sidebar-right" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button className="btn-action" onClick={() => setIsCollapsed(true)}>
          <ChevronRight size={20} />
        </button>
        <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Intelligence</h2>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Section 1 - Entity Dossier */}
        <section>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Entity Dossier
          </h3>
          
          {!selectedNode ? (
            <div style={{ 
              padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.2)', 
              borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' 
            }}>
              <Target size={32} style={{ color: '#8892a4', opacity: 0.5, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, color: '#8892a4', fontSize: '0.9rem' }}>Click a node in the graph to view intelligence details.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ 
                padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                borderTop: `3px solid ${getEntityBadgeColor(selectedNode.type)}`
              }}>
                <span className="badge-tag" style={{ 
                  backgroundColor: `${getEntityBadgeColor(selectedNode.type)}20`, 
                  color: getEntityBadgeColor(selectedNode.type),
                  border: `1px solid ${getEntityBadgeColor(selectedNode.type)}50`,
                  fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase'
                }}>
                  {selectedNode.type || 'UNKNOWN'}
                </span>
                <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: '#fff', wordBreak: 'break-word' }}>
                  {selectedNode.label || selectedNode.id}
                </h4>
              </div>
              
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892a4', fontSize: '0.85rem' }}>Degree Centrality</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace' }}>{formatNumber(selectedNode.degree_centrality)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892a4', fontSize: '0.85rem' }}>Betweenness</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace' }}>{formatNumber(selectedNode.betweenness_centrality)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892a4', fontSize: '0.85rem' }}>PageRank</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace' }}>{formatNumber(selectedNode.pagerank)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892a4', fontSize: '0.85rem' }}>Community ID</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedNode.community !== undefined ? selectedNode.community : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8892a4', fontSize: '0.85rem' }}>Mentions</span>
                  <span style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedNode.mention_count || 1}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 2 - Network Stats */}
        <section>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Network Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8892a4', marginBottom: '0.25rem' }}>
                <Hash size={14} />
                <span style={{ fontSize: '0.75rem' }}>Nodes</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
                {networkStats?.node_count || 0}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8892a4', marginBottom: '0.25rem' }}>
                <Share2 size={14} />
                <span style={{ fontSize: '0.75rem' }}>Edges</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
                {networkStats?.edge_count || 0}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8892a4', marginBottom: '0.25rem' }}>
                <Activity size={14} />
                <span style={{ fontSize: '0.75rem' }}>Density</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
                {networkStats?.density ? networkStats.density.toFixed(4) : '0.0000'}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8892a4', marginBottom: '0.25rem' }}>
                <Users size={14} />
                <span style={{ fontSize: '0.75rem' }}>Communities</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
                {networkStats?.community_count || 0}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - Top Influencers */}
        {keyPlayers && keyPlayers.length > 0 && (
          <section>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
              Top Influencers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {keyPlayers.slice(0, 5).map((player, idx) => {
                // Determine a max score for progress bar sizing. If not given, assume 1 is max.
                const score = player.combined_score || player.betweenness_centrality || 0;
                const maxScore = keyPlayers[0].combined_score || keyPlayers[0].betweenness_centrality || 1;
                const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));

                return (
                  <div 
                    key={`player-${player.id}-${idx}`}
                    onClick={() => onNodeSelect && onNodeSelect(player)}
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.5rem', 
                      borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    className="hover-bg-highlight"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                        {player.label || player.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#00e5ff', fontFamily: 'monospace' }}>
                        {score.toFixed(3)}
                      </span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, backgroundColor: '#00e5ff', height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 4 - Louvain Clusters */}
        {communities && communities.length > 0 && (
          <section>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#8892a4', letterSpacing: '1px', marginBottom: '0.75rem' }}>
              Louvain Clusters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {communities.map((comm, idx) => (
                <div key={`comm-${idx}`} style={{ 
                  backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', 
                  borderRadius: '6px', borderLeft: `3px solid hsl(${(comm.id * 137.5) % 360}, 70%, 50%)`,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Cluster {comm.id}</span>
                    <span style={{ fontSize: '0.75rem', color: '#8892a4', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                      {comm.member_count || comm.nodes?.length || 0} members
                    </span>
                  </div>
                  {comm.key_members && (
                    <div style={{ fontSize: '0.75rem', color: '#8892a4' }}>
                      Key: {comm.key_members.slice(0, 3).map(m => m.label || m.id || m).join(', ')}
                      {comm.key_members.length > 3 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default RightSidebar;
