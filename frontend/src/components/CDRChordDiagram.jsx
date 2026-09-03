import React, { useState, useMemo } from 'react';

const CDRChordDiagram = ({ chordData }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const { contacts = [], links = [], max_weight = 1 } = chordData || {};
  
  const SIZE = 600;
  const CENTER = SIZE / 2;
  const RADIUS = SIZE * 0.32;
  const NODE_RADIUS = 8;
  const LABEL_OFFSET = 40;
  
  // Calculate node positions around circle
  const nodePositions = useMemo(() => {
    if (contacts.length === 0) return [];
    return contacts.map((c, i) => {
      const angle = (2 * Math.PI * i) / contacts.length - Math.PI / 2;
      return {
        ...c,
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
        angle,
        labelX: CENTER + (RADIUS + LABEL_OFFSET) * Math.cos(angle),
        labelY: CENTER + (RADIUS + LABEL_OFFSET) * Math.sin(angle)
      };
    });
  }, [contacts]);

  // Build index map: source/target can be integer index or phone string
  const nodeByKey = useMemo(() => {
    const map = {};
    nodePositions.forEach((n, i) => {
      map[i] = n;              // by integer index
      map[n.phone] = n;        // by phone string
      if (n.index !== undefined) map[n.index] = n; // by backend index
    });
    return map;
  }, [nodePositions]);
  
  const getArcPath = (x1, y1, x2, y2) => {
    // Quadratic bezier curving toward center
    const mx = CENTER + (CENTER - (x1 + x2) / 2) * 0.15;
    const my = CENTER + (CENTER - (y1 + y2) / 2) * 0.15;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  };

  const getArcColor = (weight) => {
    const ratio = weight / (max_weight || 1);
    if (ratio > 0.6) return '#ff3366';
    if (ratio > 0.3) return '#a060ff';
    return '#00f0ff';
  };

  if (contacts.length === 0) {
    return (
      <div className="cdr-chord-container" style={{ minHeight: 300, justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No data available for chord diagram.</p>
      </div>
    );
  }

  return (
    <div className="cdr-chord-container" style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: '100%', maxWidth: '600px', height: 'auto', display: 'block' }}>
        {/* Center glow */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.15} fill="rgba(0, 240, 255, 0.03)" />

        {/* Links / Arcs */}
        {links.map((link, i) => {
          // Resolve source/target — support both index (int) and phone (string) lookups
          const sourceNode = nodeByKey[link.source] || nodeByKey[link.source_phone];
          const targetNode = nodeByKey[link.target] || nodeByKey[link.target_phone];
          if (!sourceNode || !targetNode) return null;
          
          const isFaded = (hoveredNode !== null && sourceNode.phone !== hoveredNode && targetNode.phone !== hoveredNode) || 
                          (hoveredLink !== null && hoveredLink !== i);
          const isHighlighted = hoveredLink === i || 
                               (hoveredNode !== null && (sourceNode.phone === hoveredNode || targetNode.phone === hoveredNode));
          
          const strokeWidth = 1.5 + (link.weight / max_weight) * 5;
          const color = getArcColor(link.weight);
          
          return (
            <path
              key={`link-${i}`}
              d={getArcPath(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y)}
              fill="none"
              stroke={color}
              strokeWidth={isHighlighted ? strokeWidth + 2 : strokeWidth}
              opacity={isFaded ? 0.08 : (isHighlighted ? 0.95 : 0.5)}
              onMouseEnter={() => setHoveredLink(i)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{ transition: 'opacity 0.2s, stroke-width 0.2s', cursor: 'pointer' }}
            />
          );
        })}
        
        {/* Nodes + Labels */}
        {nodePositions.map((node, i) => {
          const isFaded = hoveredNode !== null && node.phone !== hoveredNode;
          const isActive = hoveredNode === node.phone;
          const cosAngle = Math.cos(node.angle);
          const textAnchor = cosAngle > 0.1 ? 'start' : (cosAngle < -0.1 ? 'end' : 'middle');
          
          // Rotate label to follow the angle for better readability
          const labelAngleDeg = (node.angle * 180) / Math.PI;
          const flipLabel = cosAngle < -0.1;
          const rotation = flipLabel ? labelAngleDeg + 180 : labelAngleDeg;
          
          return (
            <g key={`node-${i}`} 
               onMouseEnter={() => setHoveredNode(node.phone)} 
               onMouseLeave={() => setHoveredNode(null)}
               style={{ cursor: 'pointer' }}
               opacity={isFaded ? 0.3 : 1}>
              
              {/* Outer ring on hover */}
              {isActive && (
                <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 4} fill="none" stroke="var(--cyan)" strokeWidth={2} opacity={0.5} />
              )}
              
              {/* Node circle */}
              <circle cx={node.x} cy={node.y} r={isActive ? NODE_RADIUS + 1 : NODE_RADIUS} fill="var(--cyan)" />
              
              {/* Label */}
              <text 
                x={node.labelX} y={node.labelY} 
                fill="var(--text-primary)" 
                fontSize="11" 
                fontFamily="'Inter', sans-serif"
                fontWeight={isActive ? 600 : 400}
                textAnchor={textAnchor} 
                dominantBaseline="middle"
                style={{ pointerEvents: 'none' }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Tooltip for hovered link */}
      {hoveredLink !== null && links[hoveredLink] && (
        <div className="cdr-tooltip" style={{ bottom: 20, right: 20 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#fff' }}>
            {links[hoveredLink].source_label} ↔ {links[hoveredLink].target_label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ color: 'var(--cyan)' }}>📞 Calls: {links[hoveredLink].calls}</span>
            <span style={{ color: 'var(--amber)' }}>💬 SMS: {links[hoveredLink].sms}</span>
            <span style={{ color: 'var(--purple)' }}>⏱ Duration: {Math.floor(links[hoveredLink].total_duration / 60)}m {links[hoveredLink].total_duration % 60}s</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CDRChordDiagram;
