import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, S } from '../../styles.jsx';
import Sidebar from './components/Sidebar.jsx';
import BannerCard from './components/BannerCard.jsx';
import WorkflowCard from './components/WorkflowCard.jsx';
import TemplateCard from './components/TemplateCard.jsx';
import EmptyWorkflowsPanel from './components/EmptyWorkflowsPanel.jsx';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BANNERS = [
  { id: 1, img_url: null, target_url: '#', title: 'Getting Started Tutorial' },
  { id: 2, img_url: null, target_url: '#', title: 'Webinar: AI Data Extraction' },
  { id: 3, img_url: null, target_url: '#', title: 'Import from Accurate' },
  { id: 4, img_url: null, target_url: '#', title: 'Excel Export Guide' },
];

const MOCK_FEATURED_TEMPLATES = [
  { id: 101, name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Manual Import',    description: 'Import sales transactions from Excel into Accurate Online.',              img_url: null },
  { id: 102, name: 'Rekap Data Pelanggan',         platform: 'Excel',    inputMethod: 'Direct API Input', description: 'Extract and consolidate customer records into a clean Excel sheet.',    img_url: null },
  { id: 103, name: 'Laporan Keuangan Bulanan',     platform: 'Jurnal',   inputMethod: 'Manual Import',    description: 'Automate monthly financial report generation for Jurnal.',              img_url: null },
  { id: 104, name: 'Sinkronisasi Produk',          platform: 'Zahir',    inputMethod: 'Direct API Input', description: 'Sync product catalog data into Zahir via direct API.',                 img_url: null },
];

const INIT_WORKFLOWS = [
  { id: 1, name: 'Importer Transaksi Penjualan', lastRun: '12 Sep 2025' },
  { id: 2, name: 'Rekap Data Pelanggan',         lastRun: '10 Sep 2025' },
  { id: 3, name: 'Laporan Keuangan Bulanan',     lastRun: '8 Sep 2025'  },
];


// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage({ onNavigateToWorkflow }) {
  const navigate = useNavigate();

  const [workflows,        setWorkflows]        = useState(INIT_WORKFLOWS);
  const [showEmpty,        setShowEmpty]        = useState(false);
  const [deleteTarget,     setDeleteTarget]     = useState(null);

  function handleRenameWorkflow(id, newName) {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
  }

  function handleDeleteWorkflow(id) {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    setDeleteTarget(null);
  }

  const sortedWorkflows = [...workflows].sort(
    (a, b) => new Date(b.lastRun) - new Date(a.lastRun)
  );

  const showLearn     = MOCK_BANNERS.length > 0;
  const showFeatured  = MOCK_FEATURED_TEMPLATES.length > 0;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif', background: C.white }}>

      <Sidebar activePage="home" />

      {/* ── Main scrollable area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 48px', boxSizing: 'border-box' }}>

        <div style={{ fontSize: 22, fontWeight: 700, color: C.black, marginBottom: 28 }}>Home</div>

        {/* ── Learn + Featured Templates ────────────────────────────────── */}
        {(showLearn || showFeatured) && (
          <div style={{ display: 'flex', gap: 28, marginBottom: 48, height: 260 }}>

            {/* Left: Learn */}
            {showLearn && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.black, marginBottom: 12 }}>Learn</div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
                  {MOCK_BANNERS.slice(0, 4).map(b => (
                    <BannerCard key={b.id} img_url={b.img_url} target_url={b.target_url} title={b.title} />
                  ))}
                </div>
              </div>
            )}

            {/* Right: Featured Templates */}
            {showFeatured && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.black }}>Featured Templates</span>
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
                  {MOCK_FEATURED_TEMPLATES.slice(0, 4).map(t => (
                    <TemplateCard
                      key={t.id}
                      name={t.name}
                      platform={t.platform}
                      inputMethod={t.inputMethod}
                      description={t.description}
                      showChips={false}
                      imgStyle={true}
                      img_url={t.img_url}
                      onClick={() => navigate(`/templates/${t.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── My Workflows ──────────────────────────────────────────────── */}
        <section style={{ marginBottom: 48 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.black, flex: 1 }}>My Workflows</span>

            {!showEmpty && (
              <select
                defaultValue="lastRun"
                style={{ ...S.input, width: 'auto', fontSize: 12, padding: '5px 10px' }}
              >
                <option value="lastRun">Sort by last run</option>
              </select>
            )}

            {/* DEV TOGGLE — remove once real data is wired */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: C.muted,
              border: `1px dashed ${C.border}`, borderRadius: 4,
              padding: '2px 8px', cursor: 'pointer', userSelect: 'none',
            }}>
              <input
                type="checkbox"
                checked={showEmpty}
                onChange={e => setShowEmpty(e.target.checked)}
                style={{ margin: 0 }}
              />
              empty state
            </label>
          </div>

          {showEmpty ? (
            <EmptyWorkflowsPanel
              onNewWorkflow={onNavigateToWorkflow}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

              {/* + New Workflow card */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: 16,
                border: `2px dashed ${C.border}`, borderRadius: 8,
                background: C.white,
              }}>
                <button style={S.btnP} onClick={onNavigateToWorkflow}>
                  + New Workflow
                </button>
                <span
                  style={{ fontSize: 13, color: C.mid, cursor: 'pointer' }}
                  onClick={() => navigate('/templates')}
                >
                  or browse templates
                </span>
              </div>

              {sortedWorkflows.map(wf => (
                <WorkflowCard
                  key={wf.id}
                  name={wf.name}
                  lastRun={wf.lastRun}
                  onClick={() => onNavigateToWorkflow(wf.id)}
                  onRename={newName => handleRenameWorkflow(wf.id, newName)}
                  onDelete={() => setDeleteTarget({ id: wf.id, name: wf.name })}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.white, borderRadius: 10,
              padding: '32px 36px', width: 380,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: C.black }}>Delete this workflow?</div>
            <div style={{ fontSize: 13, color: C.mid }}>"{deleteTarget.name}"</div>
            <div style={{ fontSize: 13, color: C.muted }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={S.btnS} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                style={{ ...S.btnP, background: C.red, border: `1px solid ${C.red}` }}
                onClick={() => handleDeleteWorkflow(deleteTarget.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
