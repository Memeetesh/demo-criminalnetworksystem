import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Share2 } from 'lucide-react';

cytoscape.use(coseBilkent);

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

const ENTITY_SHAPES = {
  PERSON: 'ellipse',
  PER: 'ellipse',
  LOCATION: 'round-rectangle',
  LOC: 'round-rectangle',
  ORGANIZATION: 'hexagon',
  ORG: 'hexagon',
  VEHICLE: 'diamond',
  PHONE: 'rectangle',
  EMAIL: 'triangle',
  MISC: 'ellipse'
};

const GraphCanvas = ({ 
  graphData, 
  filters, 
  layoutName, 
  searchQuery, 
  highlightedPath, 
  onNodeSelect 
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#fff',
            'text-outline-color': '#111928',
            'text-outline-width': 2,
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'shape': (ele) => ENTITY_SHAPES[ele.data('type')] || 'ellipse',
            'background-color': (ele) => ENTITY_COLORS[ele.data('type')] || '#8892a4',
            'width': (ele) => {
              const bc = ele.data('betweenness_centrality') || 0;
              return Math.max(34, Math.min(85, 34 + bc * 100));
            },
            'height': (ele) => {
              const bc = ele.data('betweenness_centrality') || 0;
              return Math.max(34, Math.min(85, 34 + bc * 100));
            },
            'border-width': 2,
            'border-color': (ele) => {
              const comm = ele.data('community');
              return comm !== undefined ? `hsl(${(comm * 137.5) % 360}, 70%, 50%)` : '#374151';
            },
            'transition-property': 'opacity, border-color, box-shadow',
            'transition-duration': 200
          }
        },
        {
          selector: 'edge',
          style: {
            'width': (ele) => Math.max(1, (ele.data('weight') || 1) * 1.5),
            'line-color': 'rgba(107, 114, 128, 0.5)',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#9ca3af',
            'text-outline-color': '#111928',
            'text-outline-width': 1,
            'text-opacity': 0,
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'rgba(107, 114, 128, 0.5)',
            'transition-property': 'opacity, line-color, target-arrow-color',
            'transition-duration': 200
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#00e5ff',
            'border-width': 4,
            'shadow-blur': 15,
            'shadow-color': '#00e5ff',
            'shadow-opacity': 0.8
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
            'border-color': '#ffc107',
            'border-width': 3,
            'shadow-blur': 10,
            'shadow-color': '#ffc107',
            'shadow-opacity': 0.8,
            'z-index': 10
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#ffc107',
            'target-arrow-color': '#ffc107',
            'text-opacity': 1,
            'width': 3,
            'z-index': 10
          }
        }
      ],
      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 5
    });

    // Interaction events
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      
      // Notify parent
      if (onNodeSelect) {
        onNodeSelect(node.data());
      }

      // Highlight ego network
      cyRef.current.elements().addClass('dimmed').removeClass('highlighted');
      const neighborhood = node.neighborhood().add(node);
      neighborhood.removeClass('dimmed').addClass('highlighted');
    });

    cyRef.current.on('tap', (evt) => {
      if (evt.target === cyRef.current) {
        // Clicked on background
        cyRef.current.elements().removeClass('dimmed').removeClass('highlighted');
        if (onNodeSelect) {
          onNodeSelect(null);
        }
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load data
  useEffect(() => {
    if (!cyRef.current || !graphData) return;

    let elements = [];
    const rawNodes = graphData.nodes || (graphData.data && graphData.data.nodes) || [];
    const rawEdges = graphData.edges || (graphData.data && graphData.data.edges) || [];
    
    // Detect if nodes are already in Cytoscape format {data: {...}} or flat {id: ...}
    const nodes = rawNodes.map(n => n.data ? n : { data: n });
    const edges = rawEdges.map(e => e.data ? e : { data: e });
    elements = [...nodes, ...edges];

    if (elements.length > 0) {
      cyRef.current.elements().remove();
      cyRef.current.add(elements);
      setIsEmpty(false);
      runLayout(layoutName || 'cose-bilkent');
    } else {
      setIsEmpty(true);
    }
  }, [graphData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle layout changes
  useEffect(() => {
    if (cyRef.current && !isEmpty) {
      runLayout(layoutName);
    }
  }, [layoutName, isEmpty]);

  // Handle filters
  useEffect(() => {
    if (!cyRef.current || isEmpty) return;

    cyRef.current.batch(() => {
      cyRef.current.nodes().forEach(node => {
        const type = node.data('type') || 'MISC';
        const typeKey = Object.keys(ENTITY_COLORS).find(k => k === type || k.startsWith(type) || type.startsWith(k));
        
        // If filter is explicitly false for this type, hide it
        if (filters && typeKey && filters[typeKey] === false) {
          node.style('display', 'none');
        } else {
          node.style('display', 'element');
        }
      });
    });
  }, [filters, isEmpty]);

  // Handle Search Query
  useEffect(() => {
    if (!cyRef.current || isEmpty) return;

    if (!searchQuery) {
      cyRef.current.elements().removeClass('dimmed').removeClass('highlighted');
      return;
    }

    const query = searchQuery.toLowerCase();
    cyRef.current.batch(() => {
      cyRef.current.elements().addClass('dimmed').removeClass('highlighted');
      
      const matchingNodes = cyRef.current.nodes().filter(node => {
        const label = (node.data('label') || '').toLowerCase();
        const type = (node.data('type') || '').toLowerCase();
        const id = (node.data('id') || '').toLowerCase();
        return label.includes(query) || type.includes(query) || id.includes(query);
      });

      matchingNodes.removeClass('dimmed').addClass('highlighted');
    });
  }, [searchQuery, isEmpty]);

  // Handle Highlighted Path (Pathfinder)
  useEffect(() => {
    if (!cyRef.current || isEmpty) return;

    if (!highlightedPath || highlightedPath.length === 0) {
      // Don't reset if we are currently searching
      if (!searchQuery) {
         cyRef.current.elements().removeClass('dimmed').removeClass('highlighted');
      }
      return;
    }

    cyRef.current.batch(() => {
      cyRef.current.elements().addClass('dimmed').removeClass('highlighted');
      
      // Path is array of node IDs
      for (let i = 0; i < highlightedPath.length; i++) {
        const nodeId = highlightedPath[i];
        cyRef.current.getElementById(nodeId).removeClass('dimmed').addClass('highlighted');
        
        if (i < highlightedPath.length - 1) {
          const nextId = highlightedPath[i + 1];
          // Highlight edge between them
          const edges = cyRef.current.edges(`[source = "${nodeId}"][target = "${nextId}"], [source = "${nextId}"][target = "${nodeId}"]`);
          edges.removeClass('dimmed').addClass('highlighted');
        }
      }
    });
  }, [highlightedPath, isEmpty]);

  function runLayout(layout) {
    if (!cyRef.current) return;
    
    let options = { name: layout, animate: true, animationDuration: 500 };
    
    if (layout === 'cose-bilkent' || layout === 'coseBilkent') {
      options.name = 'cose-bilkent';
      options.nodeRepulsion = 4500;
      options.idealEdgeLength = 100;
    }

    const layoutInstance = cyRef.current.layout(options);
    layoutInstance.run();
  }

  const handleZoomIn = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current && cyRef.current.fit(cyRef.current.elements(':visible'), 50);
  const handleRefresh = () => runLayout(layoutName || 'cose-bilkent');

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px', backgroundColor: '#0b1120' }}>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      />
      
      {isEmpty && (
        <div style={{ 
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11, 17, 32, 0.8)',
          color: '#8892a4', pointerEvents: 'none'
        }}>
          <Share2 size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#e5e7eb' }}>No Network Data</h2>
          <p>Ingest data to visualize the criminal network.</p>
        </div>
      )}

      {!isEmpty && (
        <div className="glass-panel" style={{ 
          position: 'absolute', bottom: '20px', right: '20px', 
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          padding: '0.5rem', borderRadius: '8px'
        }}>
          <button className="btn-action" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={20} />
          </button>
          <button className="btn-action" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={20} />
          </button>
          <button className="btn-action" onClick={handleFit} title="Fit to Screen">
            <Maximize2 size={20} />
          </button>
          <button className="btn-action" onClick={handleRefresh} title="Recalculate Layout">
            <RefreshCw size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;
