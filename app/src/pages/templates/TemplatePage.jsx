import { useParams, useNavigate } from 'react-router-dom';
import { C, S } from '../../styles.jsx';

// All templates that can be viewed by direct URL
const ALL_TEMPLATES = [
  { id: 101, name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Manual Import',    description: 'Import sales transactions from Excel into Accurate Online. This template extracts transaction data from uploaded spreadsheets, maps fields to Accurate\'s format, and prepares a clean import file ready for upload.' },
  { id: 102, name: 'Rekap Data Pelanggan',         platform: 'Excel',    inputMethod: 'Direct API Input', description: 'Extract and consolidate customer records into a clean Excel sheet. Pulls data from your source, deduplicates entries, and outputs a formatted spreadsheet ready for review or upload.' },
  { id: 103, name: 'Laporan Keuangan Bulanan',     platform: 'Jurnal',   inputMethod: 'Manual Import',    description: 'Automate monthly financial report generation for Jurnal. Upload your raw transaction export and get a structured report compatible with Jurnal\'s import format.' },
  { id: 104, name: 'Sinkronisasi Produk',          platform: 'Zahir',    inputMethod: 'Direct API Input', description: 'Sync product catalog data into Zahir via direct API. Maps SKUs, prices, and stock levels from your source into Zahir\'s product schema.' },
  { id: 1,   name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Manual Import',    description: 'Import sales transactions from Excel into Accurate Online.' },
  { id: 2,   name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Manual Import',    description: 'Import sales transactions from Excel into Accurate Online.' },
  { id: 3,   name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Direct API Input', description: 'Import sales transactions via Direct API Input into Accurate Online.' },
  { id: 4,   name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Manual Import',    description: 'Import sales transactions from Excel into Accurate Online.' },
  { id: 5,   name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Manual Import',    description: 'Import sales transactions from Excel into Accurate Online.' },
  { id: 6,   name: 'Importer Transaksi Penjualan', platform: 'Accurate', inputMethod: 'Direct API Input', description: 'Import sales transactions via Direct API Input into Accurate Online.' },
];

export default function TemplatePage() {
  const { id }  = useParams();
  const navigate = useNavigate();

  const template = ALL_TEMPLATES.find(t => String(t.id) === id) ?? null;

  if (!template) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif', color: C.muted, fontSize: 15,
      }}>
        Template not found.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: C.white }}>

      {/* ── Minimal public header ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 48px', borderBottom: `1px solid ${C.border}`,
      }}>
        <span
          style={{ fontWeight: 700, fontSize: 16, color: C.black, cursor: 'pointer' }}
          onClick={() => navigate('/home')}
        >
          Gruntable
        </span>
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: 760, margin: '0 auto',
        padding: '48px 24px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>

        {/* Back link */}
        <button
          onClick={() => navigate('/home')}
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            color: C.muted, fontSize: 13, padding: 0,
            alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← Back to home
        </button>

        {/* Title */}
        <div style={{ fontSize: 26, fontWeight: 700, color: C.black, lineHeight: 1.3 }}>
          {template.name}
        </div>

        {/* Metadata chips */}
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            padding: '4px 12px', border: `1px solid ${C.border}`,
            borderRadius: 20, fontSize: 12, color: C.mid,
          }}>
            {template.platform}
          </span>
          <span style={{
            padding: '4px 12px', border: `1px solid ${C.border}`,
            borderRadius: 20, fontSize: 12, color: C.mid,
          }}>
            {template.inputMethod}
          </span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 14, color: C.mid, lineHeight: 1.8 }}>
          {template.description}
        </div>

        {/* Image gallery placeholder */}
        <div style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          background: C.bg, height: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.muted, fontSize: 13,
        }}>
          Screenshot / Image
        </div>

        {/* Video placeholder */}
        <div style={{
          border: `1px solid ${C.border}`, borderRadius: 8,
          background: C.bg, height: 120,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, color: C.muted, fontSize: 13,
        }}>
          ▶ Video Walkthrough
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <button
            style={{ ...S.btnP, padding: '12px 40px', fontSize: 14 }}
            onClick={() => navigate('/workflow')}
          >
            Use Template
          </button>
        </div>

      </div>
    </div>
  );
}
