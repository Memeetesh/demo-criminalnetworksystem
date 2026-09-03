import React, { useState, useMemo } from 'react';

const LANE_HEIGHT = 50;
const EVENT_SPACING = 50;
const DOT_RADIUS = 6;
const PADDING_TOP = 60; // extra room for rotated date labels
const MIN_DATE_GAP = 100; // minimum px between date labels

const CDRTimeline = ({ timelineData }) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const { contacts = [], events = [] } = timelineData || {};
  
  const width = Math.max(800, events.length * EVENT_SPACING + 120);
  const height = Math.max(300, contacts.length * LANE_HEIGHT + PADDING_TOP + 20);

  // Calculate date label positions, skipping labels that would overlap
  const dateLabels = useMemo(() => {
    const labels = [];
    let lastX = -Infinity;
    const seen = new Set();

    events.forEach((ev, i) => {
      if (!ev.date || seen.has(ev.date)) return;
      seen.add(ev.date);
      const x = i * EVENT_SPACING + 60;
      if (x - lastX >= MIN_DATE_GAP) {
        // Format date as "Jan 10" instead of "2024-01-10"
        const d = new Date(ev.date + 'T00:00:00');
        const short = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push({ date: ev.date, short, x });
        lastX = x;
      }
    });
    return labels;
  }, [events]);

  return (
    <div className="cdr-timeline-container">
      {/* Fixed Labels Panel */}
      <div className="cdr-timeline-labels">
        <div style={{ height: `${PADDING_TOP}px`, borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'flex-end', padding: '0 10px 6px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Contacts
        </div>
        {contacts.map((contact, i) => (
          <div 
            key={contact.phone}
            style={{
              height: `${LANE_HEIGHT}px`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border-light)',
              backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {contact.label}
          </div>
        ))}
      </div>

      {/* Scrollable SVG Panel */}
      <div className="cdr-timeline-scroll">
        <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
          <svg width={width} height={height} style={{ display: 'block' }}>
            <defs>
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f0ff" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffb703" />
              </marker>
            </defs>
            
            {/* Background Lanes */}
            {contacts.map((contact, i) => {
              const y = PADDING_TOP + i * LANE_HEIGHT;
              return (
                <rect 
                  key={`lane-${i}`}
                  x={0} y={y} width={width} height={LANE_HEIGHT}
                  fill={i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                />
              );
            })}
            
            {/* Lane dividers */}
            {contacts.map((contact, i) => (
              <line
                key={`div-${i}`}
                x1={0} y1={PADDING_TOP + (i + 1) * LANE_HEIGHT}
                x2={width} y2={PADDING_TOP + (i + 1) * LANE_HEIGHT}
                stroke="var(--border-light)" strokeWidth={1}
              />
            ))}

            {/* Date Labels — rotated to avoid overlap */}
            {dateLabels.map((d, i) => (
              <g key={`date-${i}`}>
                <line x1={d.x} y1={PADDING_TOP - 2} x2={d.x} y2={height} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <g transform={`translate(${d.x}, ${PADDING_TOP - 8}) rotate(-35)`}>
                  <text 
                    fill="var(--text-secondary)" fontSize="11" 
                    fontFamily="'JetBrains Mono', monospace"
                    textAnchor="start"
                  >
                    {d.short}
                  </text>
                </g>
              </g>
            ))}

            {/* Events */}
            {events.map((ev, i) => {
              const x = i * EVENT_SPACING + 60;
              const y1 = PADDING_TOP + ev.caller_lane * LANE_HEIGHT + LANE_HEIGHT / 2;
              const y2 = PADDING_TOP + ev.callee_lane * LANE_HEIGHT + LANE_HEIGHT / 2;
              
              const isCall = ev.type === 'CALL';
              const color = isCall ? '#00f0ff' : '#ffb703';
              const marker = isCall ? 'url(#arrow-cyan)' : 'url(#arrow-amber)';
              const isHovered = hoveredEvent?.id === ev.id;
              
              return (
                <g key={ev.id} 
                   onMouseEnter={() => setHoveredEvent({ ...ev, posX: x, posY: Math.min(y1, y2) })}
                   onMouseLeave={() => setHoveredEvent(null)}
                   style={{ cursor: 'pointer' }}>
                  
                  {/* Connection Line */}
                  <line 
                    x1={x} y1={y1} x2={x} y2={y2} 
                    stroke={color} strokeWidth={isHovered ? 3 : 1.5} 
                    opacity={isHovered ? 1 : 0.7}
                    markerEnd={marker} 
                  />
                  
                  {/* Caller Dot */}
                  <circle cx={x} cy={y1} r={isHovered ? DOT_RADIUS + 2 : DOT_RADIUS} fill={color} />
                  
                  {/* Invisible hover area */}
                  <rect x={x - 15} y={Math.min(y1, y2) - 10} width={30} height={Math.abs(y1 - y2) + 20} fill="transparent" />
                </g>
              );
            })}
          </svg>
          
          {hoveredEvent && (
            <div className="cdr-tooltip" style={{ left: hoveredEvent.posX + 15, top: hoveredEvent.posY - 10 }}>
              <div style={{ fontWeight: 'bold', color: hoveredEvent.type === 'CALL' ? 'var(--cyan)' : 'var(--amber)', marginBottom: '5px' }}>
                {hoveredEvent.type}
              </div>
              <div style={{ marginBottom: '5px' }}>
                {hoveredEvent.caller_label} &rarr; {hoveredEvent.callee_label}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Time: {hoveredEvent.timestamp}</div>
              {hoveredEvent.duration_display && hoveredEvent.duration_display !== '-' && <div style={{ color: 'var(--text-secondary)' }}>Duration: {hoveredEvent.duration_display}</div>}
              {hoveredEvent.cell_tower && <div style={{ color: 'var(--text-secondary)' }}>Tower: {hoveredEvent.cell_tower}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CDRTimeline;
