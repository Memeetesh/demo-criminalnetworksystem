import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Award, Users, AlertTriangle, Activity, Eye, Share2 } from 'lucide-react';

export default function RightSidebar({
  selectedNode,
  networkStats,
  keyPlayers,
  communities,
  suspiciousAlerts,
  onNodeSelect
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('details'); // 'details' | 'stats' | 'influencers' | 'communities' | 'alerts'

  if (collapsed) {
    return (
      <div style={{
        position: 'absolute',
        right: '12px',
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
          <ChevronLeft size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside style={{
      width: '320px',
      height: 'calc(100vh - 60px)',
      background: 'rgba(10, 13, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
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
          left: '12px',
          top: '16px',
          background: 'none',
          border: 'none',
          color: '#8492a6',
          cursor: 'pointer'
        }}
      >
        <ChevronRight size={16} />
      </button>

      {/* 1. Entity Detail Card */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={14} style={{ color: '#00f0ff' }} /> Entity Dossier
        </h3>

        {selectedNode ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge-tag badge-${(selectedNode.type || 'person').toLowerCase()}`}>
                {selectedNode.type || 'UNKNOWN'}
              </span>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                {selectedNode.label || selectedNode.name || selectedNode.id}
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#8492a6' }}>Degree Centrality</span>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#00f0ff' }}>
                  {((selectedNode.degree_centrality || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#8492a6' }}>Betweenness</span>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#00ff88' }}>
                  {((selectedNode.betweenness_centrality || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#8492a6' }}>PageRank</span>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#ffb703' }}>
                  {((selectedNode.pagerank || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#8492a6' }}>Cluster Group</span>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#a060ff' }}>
                  Group #{selectedNode.community ?? 'N/A'}
                </p>
              </div>
            </div>

            {selectedNode.mention_count && (
              <div style={{ fontSize: '11px', color: '#8492a6', display: 'flex', justifyContent: 'space-between' }}>
                <span>Document Mentions:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{selectedNode.mention_count}</span>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: '#8492a6', fontStyle: 'italic' }}>
            Click any node on the graph canvas to inspect entity dossier & connections.
          </p>
        )}
      </div>

      {/* 2. Network Intelligence Stats */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} style={{ color: '#00ff88' }} /> Network Statistics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px', color: '#8492a6' }}>Total Nodes</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{networkStats.node_count || 0}</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px', color: '#8492a6' }}>Total Edges</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{networkStats.edge_count || 0}</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px', color: '#8492a6' }}>Graph Density</span>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#00f0ff' }}>{(networkStats.density || 0).toFixed(4)}</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '10px', color: '#8492a6' }}>Communities</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#a060ff' }}>{networkStats.community_count || 0}</p>
          </div>
        </div>
      </div>

      {/* 3. Key Influencers Leaderboard */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={14} style={{ color: '#ffb703' }} /> Top Influencers (PageRank)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(keyPlayers || []).slice(0, 5).map((player, idx) => {
            const score = player.combined_score || player.score || 0;
            const percent = Math.min(100, Math.round(score * 300));
            return (
              <div
                key={player.id || idx}
                onClick={() => onNodeSelect(player)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                    #{idx + 1} {player.label || player.id}
                  </span>
                  <span className={`badge-tag badge-${(player.type || 'person').toLowerCase()}`}>
                    {player.type || 'ENT'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #00f0ff, #7c4dff)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Detected Communities Panel */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={14} style={{ color: '#a060ff' }} /> Louvain Clusters
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(communities || []).slice(0, 4).map((comm) => (
            <div
              key={comm.community_id}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '3px solid #a060ff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                <span>Community #{comm.community_id}</span>
                <span style={{ color: '#00f0ff' }}>{comm.member_count} members</span>
              </div>
              <p style={{ fontSize: '10px', color: '#8492a6', marginTop: '2px' }}>
                Key: {(comm.key_members || []).map(m => m.label || m.node).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
