import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';

cytoscape.use(coseBilkent);

const ENTITY_COLORS = {
  PERSON: '#ff6b9d',
  LOCATION: '#00e676',
  ORGANIZATION: '#7c4dff',
  VEHICLE: '#448aff',
  PHONE: '#ff9100',
  EMAIL: '#e040fb'
};

const ENTITY_SHAPES = {
  PERSON: 'ellipse',
  LOCATION: 'round-rectangle',
  ORGANIZATION: 'hexagon',
  VEHICLE: 'diamond',
  PHONE: 'rectangle',
  EMAIL: 'triangle'
};

const COMMUNITY_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'
];

export default function GraphCanvas({ 
  graphData, 
  filters, 
  layoutName, 
  onNodeSelect, 
  searchQuery,
  highlightedPath
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#ffffff',
            'text-outline-color': '#070913',
            'text-outline-width': 2,
            'font-size': '11px',
            'font-weight': 600,
            'background-color': (ele) => ENTITY_COLORS[ele.data('type')] || '#8892a4',
            'shape': (ele) => ENTITY_SHAPES[ele.data('type')] || 'ellipse',
            'width': (ele) => Math.max(34, Math.min(85, (ele.data('betweenness_centrality') || 0.1) * 220 + 30)),
            'height': (ele) => Math.max(34, Math.min(85, (ele.data('betweenness_centrality') || 0.1) * 220 + 30)),
            'border-width': 2.5,
            'border-color': (ele) => {
              const comm = ele.data('community');
              return comm != null && comm >= 0 ? COMMUNITY_COLORS[comm % COMMUNITY_COLORS.length] : 'rgba(255,255,255,0.2)';
            },
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': (ele) => Math.max(1.5, Math.min(6, ele.data('weight') || 1)),
            'line-color': 'rgba(68, 138, 255, 0.4)',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'color': '#8492a6',
            'text-outline-color': '#070913',
            'text-outline-width': 1.5,
            'opacity': 0.75
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#00f0ff',
            'border-width': 4,
            'shadow-blur': 15,
            'shadow-color': '#00f0ff',
            'shadow-opacity': 0.9
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.15
          }
        },
        {
          selector: '.highlighted',
          style: {
            'border-color': '#ffb703',
            'border-width': 4,
            'line-color': '#ffb703',
            'opacity': 1,
            'shadow-blur': 12,
            'shadow-color': '#ffb703'
          }
        }
      ],
      layout: { name: 'preset' }
    });

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      onNodeSelect(node.data());

      // Highlight 1-hop neighborhood
      cy.elements().addClass('dimmed').removeClass('highlighted');
      node.removeClass('dimmed').addClass('highlighted');
      node.neighborhood().removeClass('dimmed').addClass('highlighted');
    });

    // Background tap resets selection
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('dimmed').removeClass('highlighted');
        onNodeSelect(null);
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  // Update elements when graphData changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !graphData) return;

    cy.elements().remove();

    const nodes = (graphData.nodes || []).map(n => ({ data: n.data || n }));
    const edges = (graphData.edges || []).map(e => ({ data: e.data || e }));

    if (nodes.length > 0) {
      cy.add([...nodes, ...edges]);
      runLayout(layoutName);
    }
  }, [graphData]);

  // Apply filters
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().forEach((node) => {
      const type = node.data('type');
      if (filters[type] !== false) {
        node.style('display', 'element');
      } else {
        node.style('display', 'none');
      }
    });
  }, [filters]);

  // Apply layout changes
  useEffect(() => {
    runLayout(layoutName);
  }, [layoutName]);

  // Apply search query highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (!searchQuery || searchQuery.trim() === '') {
      cy.elements().removeClass('dimmed').removeClass('highlighted');
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    cy.elements().addClass('dimmed').removeClass('highlighted');

    const matchedNodes = cy.nodes().filter(node => {
      const label = (node.data('label') || '').toLowerCase();
      const id = (node.data('id') || '').toLowerCase();
      return label.includes(q) || id.includes(q);
    });

    matchedNodes.removeClass('dimmed').addClass('highlighted');
    matchedNodes.neighborhood().removeClass('dimmed');
  }, [searchQuery]);

  // Highlight specific path
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !highlightedPath || highlightedPath.length === 0) return;

    cy.elements().addClass('dimmed').removeClass('highlighted');
    highlightedPath.forEach(id => {
      const node = cy.getElementById(id);
      if (node) node.removeClass('dimmed').addClass('highlighted');
    });
  }, [highlightedPath]);

  const runLayout = (name) => {
    const cy = cyRef.current;
    if (!cy) return;

    let options = { name: name || 'cose-bilkent', animate: true, animationDuration: 500 };
    if (name === 'cose-bilkent') {
      options = {
        ...options,
        idealEdgeLength: 90,
        nodeRepulsion: 6500,
        nodeDimensionsIncludeLabels: true
      };
    }
    cy.layout(options).run();
  };

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();
  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('dimmed').removeClass('highlighted');
      runLayout(layoutName);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Cytoscape DOM container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Canvas Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: 'rgba(15, 20, 35, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '6px',
        borderRadius: '10px',
        zIndex: 50
      }}>
        <button onClick={handleZoomIn} title="Zoom In" className="btn-action"><ZoomIn size={14} /></button>
        <button onClick={handleZoomOut} title="Zoom Out" className="btn-action"><ZoomOut size={14} /></button>
        <button onClick={handleFit} title="Fit View" className="btn-action"><Maximize2 size={14} /></button>
        <button onClick={handleReset} title="Reset Layout" className="btn-action"><RefreshCw size={14} /></button>
      </div>

      {/* Empty State Overlay */}
      {(!graphData || !graphData.nodes || graphData.nodes.length === 0) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          color: '#8492a6'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px dashed rgba(0, 240, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f0ff'
          }}>
            <RefreshCw className="animate-spin" size={24} />
          </div>
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '4px' }}>No Graph Loaded</h3>
          <p style={{ fontSize: '13px' }}>Upload a CSV, JSON, or PDF crime report to generate intelligence network.</p>
        </div>
      )}
    </div>
  );
}
