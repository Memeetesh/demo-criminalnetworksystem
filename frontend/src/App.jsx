import React, { useState, useEffect, useRef } from 'react';
import './index.css';

import Navbar from './components/Navbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import GraphCanvas from './components/GraphCanvas';
import ExtractedEntitiesView from './components/ExtractedEntitiesView';
import SuspiciousPatternsView from './components/SuspiciousPatternsView';
import PatternResultsView from './components/PatternResultsView';
import CDRAnalysisView from './components/CDRAnalysisView';

export default function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Data
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [entities, setEntities] = useState({});
  const [networkStats, setNetworkStats] = useState({});
  const [keyPlayers, setKeyPlayers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [suspiciousAlerts, setSuspiciousAlerts] = useState([]);
  const [patternResults, setPatternResults] = useState({ phones: [], vehicles: [], emails: [], money: [], dates: [], counts: { phones: 0, vehicles: 0, emails: 0, money: 0, dates: 0 } });
  const [cdrData, setCdrData] = useState({ summary: { total_records: 0 }, timeline: { contacts: [], events: [], total_events: 0 }, chord: { contacts: [], links: [], max_weight: 1 } });

  // Interaction
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    PERSON: true, LOCATION: true, ORGANIZATION: true,
    VEHICLE: true, PHONE: true, EMAIL: true, MISC: true
  });
  const [layoutName, setLayoutName] = useState('cose-bilkent');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [statusText, setStatusText] = useState('System Ready');
  const [statusType, setStatusType] = useState('info');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Toast
  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all data
  const fetchAllData = async () => {
    setStatusText('Fetching intelligence data...');
    setStatusType('info');
    try {
      const [graphRes, statsRes, centralityRes, commRes, suspiciousRes, entitiesRes, patternsRes] =
        await Promise.all([
          fetch('/api/network/graph').catch(() => ({ ok: false })),
          fetch('/api/analysis/summary').catch(() => ({ ok: false })),
          fetch('/api/analysis/centrality').catch(() => ({ ok: false })),
          fetch('/api/analysis/communities').catch(() => ({ ok: false })),
          fetch('/api/patterns/suspicious').catch(() => ({ ok: false })),
          fetch('/api/entities?limit=200').catch(() => ({ ok: false })),
          fetch('/api/patterns/all').catch(() => ({ ok: false })),
        ]);

      if (graphRes.ok) setGraphData(await graphRes.json());
      if (statsRes.ok) setNetworkStats(await statsRes.json());
      if (centralityRes.ok) setKeyPlayers(await centralityRes.json());
      if (commRes.ok) setCommunities(await commRes.json());
      if (suspiciousRes.ok) setSuspiciousAlerts(await suspiciousRes.json());
      if (patternsRes.ok) setPatternResults(await patternsRes.json());
      
      // Fetch CDR data if available
      try {
        const [cdrSummaryRes, cdrTimelineRes, cdrChordRes] = await Promise.all([
          fetch('/api/cdr/summary').catch(() => ({ ok: false })),
          fetch('/api/cdr/timeline').catch(() => ({ ok: false })),
          fetch('/api/cdr/chord').catch(() => ({ ok: false })),
        ]);
        const newCdrData = { ...cdrData };
        if (cdrSummaryRes.ok) newCdrData.summary = await cdrSummaryRes.json();
        if (cdrTimelineRes.ok) newCdrData.timeline = await cdrTimelineRes.json();
        if (cdrChordRes.ok) newCdrData.chord = await cdrChordRes.json();
        setCdrData(newCdrData);
      } catch (e) { console.error('CDR fetch error:', e); }

      if (entitiesRes.ok) {
        const entData = await entitiesRes.json();
        // API returns { entities: [...] } — store as map for dossier, keep array for sidebar
        const entMap = {};
        (entData.entities || entData || []).forEach(e => { entMap[e.id] = e; });
        setEntities(entMap);
      }

      setStatusText('Network Data Loaded');
      setStatusType('success');
    } catch (err) {
      console.error('Fetch error:', err);
      setStatusText('Backend Connection Idle');
      setStatusType('info');
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // Upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setShowUploadModal(false);
    setStatusText(`Ingesting ${file.name}...`);
    setStatusType('info');
    showToast(`Processing ${file.name}...`, 'info');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      const count = result.record?.summary?.entities_extracted || 0;
      setStatusText(`Analyzed: ${count} entities extracted`);
      setStatusType('success');
      showToast(`Success! ${count} entities extracted from ${file.name}`, 'success');
      setTimeout(() => fetchAllData(), 500);
    } catch (err) {
      console.error('Upload error:', err);
      setStatusText('Upload Failed');
      setStatusType('error');
      showToast('Upload failed. Check backend connection.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCDRUpload = async (file) => {
    setStatusText(`Processing CDR: ${file.name}...`);
    setStatusType('info');
    showToast(`Analyzing call records from ${file.name}...`, 'info');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/cdr/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('CDR upload failed');
      const result = await res.json();
      const count = result.summary?.total_records || 0;
      setStatusText(`CDR: ${count} records analyzed`);
      setStatusType('success');
      showToast(`Success! ${count} call records analyzed`, 'success');
      setTimeout(() => fetchAllData(), 500);
    } catch (err) {
      console.error('CDR upload error:', err);
      setStatusText('CDR Upload Failed');
      setStatusType('error');
      showToast('CDR upload failed. Check file format.', 'error');
    }
  };

  // Pathfinder
  const handleFindPath = async (sourceId, targetId) => {
    setStatusText(`Tracing path: ${sourceId} → ${targetId}...`);
    try {
      const res = await fetch(`/api/network/path/${sourceId}/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.path_nodes && data.path_nodes.length > 0) {
          setHighlightedPath(data.path_nodes);
          setStatusText(`Path found: ${data.hop_count} hops`);
          setStatusType('success');
          showToast(`Path traced: ${data.hop_count} hops`, 'success');
        } else {
          setStatusText('No path found');
          setStatusType('error');
          showToast('No connected path found between those entities', 'error');
        }
      }
    } catch (err) {
      console.error('Pathfinder error:', err);
      setStatusText('Pathfinder Failed');
      setStatusType('error');
    }
  };

  // Drag handlers for modal
  const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
  const handleDragLeave = (e) => { e.currentTarget.classList.remove('drag-over'); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // Convert entity map to array for components that need it
  const entitiesArray = Object.values(entities);

  return (
    <div className="app-container">
      {/* Hidden global file input */}
      <input
        type="file"
        id="file-upload-input"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,.json,.pdf"
        onChange={(e) => handleFileUpload(e.target.files[0])}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusText={statusText}
        statusType={statusType}
        onUploadClick={() => setShowUploadModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="main-grid">
        {activeTab === 'graph' && (
          <LeftSidebar
            filters={filters}
            setFilters={setFilters}
            layoutName={layoutName}
            setLayoutName={setLayoutName}
            onFileUpload={handleFileUpload}
            uploading={uploading}
            entities={entitiesArray}
            onFindPath={handleFindPath}
          />
        )}

        <div className="main-content">
          {activeTab === 'graph' && (
            <GraphCanvas
              graphData={graphData}
              filters={filters}
              layoutName={layoutName}
              onNodeSelect={(nodeData) => setSelectedNode(nodeData)}
              searchQuery={searchQuery}
              highlightedPath={highlightedPath}
            />
          )}

          {activeTab === 'entities' && (
            <ExtractedEntitiesView
              entities={entities}
              onNodeSelect={(entity) => {
                setSelectedNode(entity);
                setActiveTab('graph');
              }}
            />
          )}

          {activeTab === 'alerts' && (
            <SuspiciousPatternsView
              suspiciousAlerts={suspiciousAlerts}
              onNodeSelect={(alert) => {
                setSelectedNode(alert);
                setActiveTab('graph');
              }}
            />
          )}

          {activeTab === 'patterns' && (
            <PatternResultsView patternResults={patternResults} />
          )}

          {activeTab === 'cdr' && (
            <CDRAnalysisView cdrData={cdrData} onCDRUpload={handleCDRUpload} />
          )}
        </div>

        {activeTab === 'graph' && (
          <RightSidebar
            selectedNode={selectedNode}
            networkStats={networkStats}
            keyPlayers={keyPlayers}
            communities={communities}
            suspiciousAlerts={suspiciousAlerts}
            onNodeSelect={(node) => setSelectedNode(node)}
          />
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="glass-panel upload-modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600 }}>Ingest Intelligence Data</h3>
            <div
              className="upload-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📂</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Drag & drop case files here
              </p>
              <p style={{ color: 'var(--cyan)', fontSize: '0.85rem', cursor: 'pointer' }}>
                or click to browse files
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '12px' }}>
                Supports CSV, JSON, PDF
              </p>
            </div>
            {uploading && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="pulse-dot" />
                <span style={{ fontSize: '0.9rem', color: 'var(--cyan)' }}>Uploading and analyzing...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className={`toast-notification animate-fade-in toast-${toastMessage.type}`}>
          {toastMessage.type === 'error' ? '⚠️' : toastMessage.type === 'success' ? '✅' : 'ℹ️'}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
