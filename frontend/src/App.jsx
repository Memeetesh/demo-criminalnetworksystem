import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import GraphCanvas from './components/GraphCanvas';
import ExtractedEntitiesView from './components/ExtractedEntitiesView';
import SuspiciousPatternsView from './components/SuspiciousPatternsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'entities' | 'alerts'
  const [statusText, setStatusText] = useState('System Online');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'
  const [uploading, setUploading] = useState(false);

  // Data states
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [entities, setEntities] = useState({});
  const [networkStats, setNetworkStats] = useState({});
  const [keyPlayers, setKeyPlayers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [suspiciousAlerts, setSuspiciousAlerts] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Filters & Controls
  const [filters, setFilters] = useState({
    PERSON: true,
    LOCATION: true,
    ORGANIZATION: true,
    VEHICLE: true,
    PHONE: true,
    EMAIL: true
  });
  const [layoutName, setLayoutName] = useState('cose-bilkent');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPath, setHighlightedPath] = useState([]);

  // Fetch initial graph & intelligence data on load
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setStatusText('Fetching network data...');
    setStatusType('info');

    try {
      // 1. Fetch graph data
      const graphRes = await fetch('/api/network/graph');
      if (graphRes.ok) {
        const data = await graphRes.json();
        setGraphData(data);
      }

      // 2. Fetch stats
      const statsRes = await fetch('/api/analysis/summary');
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setNetworkStats(stats);
      }

      // 3. Fetch key players
      const centralityRes = await fetch('/api/analysis/centrality');
      if (centralityRes.ok) {
        const players = await centralityRes.json();
        setKeyPlayers(players);
      }

      // 4. Fetch communities
      const commRes = await fetch('/api/analysis/communities');
      if (commRes.ok) {
        const comms = await commRes.json();
        setCommunities(comms);
      }

      // 5. Fetch suspicious alerts
      const suspiciousRes = await fetch('/api/patterns/suspicious');
      if (suspiciousRes.ok) {
        const alerts = await suspiciousRes.json();
        setSuspiciousAlerts(alerts);
      }

      // 6. Fetch entities list
      const entitiesRes = await fetch('/api/entities?limit=200');
      if (entitiesRes.ok) {
        const entData = await entitiesRes.json();
        const entMap = {};
        (entData.entities || []).forEach(e => { entMap[e.id] = e; });
        setEntities(entMap);
      }

      setStatusText('Network Data Loaded');
      setStatusType('success');
    } catch (err) {
      console.error('Data fetch error:', err);
      setStatusText('Backend Connection Idle');
      setStatusType('info');
    }
  };

  // Handle File Ingestion
  const handleFileUpload = async (file) => {
    setUploading(true);
    setStatusText(`Ingesting ${file.name}...`);
    setStatusType('info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();

      setStatusText(`Uploaded & Analyzed: ${result.record?.summary?.entities_extracted || 0} entities`);
      setStatusType('success');

      // Refresh all analytics & graph
      setTimeout(() => {
        fetchAllData();
      }, 500);
    } catch (err) {
      console.error('Upload error:', err);
      setStatusText('Upload Failed');
      setStatusType('error');
    } finally {
      setUploading(false);
    }
  };

  // Handle Pathfinder Trace
  const handleFindPath = async (sourceId, targetId) => {
    setStatusText(`Tracing path: ${sourceId} ➔ ${targetId}...`);
    try {
      const res = await fetch(`/api/network/path/${sourceId}/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.path_nodes && data.path_nodes.length > 0) {
          setHighlightedPath(data.path_nodes);
          setStatusText(`Path found: ${data.hop_count} hops`);
          setStatusType('success');
        } else {
          setStatusText('No connected path found between nodes');
          setStatusType('error');
        }
      }
    } catch (err) {
      console.error('Pathfinder error:', err);
      setStatusText('Pathfinder Failed');
      setStatusType('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusText={statusText}
        statusType={statusType}
        onUploadClick={() => document.getElementById('file-upload-input')?.click()}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Tab 1: Network Graph Canvas & Control Sidebars */}
        {activeTab === 'graph' && (
          <>
            <LeftSidebar
              filters={filters}
              setFilters={setFilters}
              layoutName={layoutName}
              setLayoutName={setLayoutName}
              onFileUpload={handleFileUpload}
              uploading={uploading}
              entities={entities}
              onFindPath={handleFindPath}
            />

            <main style={{ flex: 1, height: '100%', position: 'relative' }}>
              <GraphCanvas
                graphData={graphData}
                filters={filters}
                layoutName={layoutName}
                onNodeSelect={(nodeData) => setSelectedNode(nodeData)}
                searchQuery={searchQuery}
                highlightedPath={highlightedPath}
              />
            </main>

            <RightSidebar
              selectedNode={selectedNode}
              networkStats={networkStats}
              keyPlayers={keyPlayers}
              communities={communities}
              suspiciousAlerts={suspiciousAlerts}
              onNodeSelect={(node) => setSelectedNode(node)}
            />
          </>
        )}

        {/* Tab 2: Extracted Entities Database View */}
        {activeTab === 'entities' && (
          <ExtractedEntitiesView
            entities={entities}
            onNodeSelect={(entity) => {
              setSelectedNode(entity);
              setActiveTab('graph');
            }}
          />
        )}

        {/* Tab 3: Suspicious Risk Alerts View */}
        {activeTab === 'alerts' && (
          <SuspiciousPatternsView
            suspiciousAlerts={suspiciousAlerts}
            onNodeSelect={(alert) => {
              setSelectedNode(alert);
              setActiveTab('graph');
            }}
          />
        )}
      </div>
    </div>
  );
}
