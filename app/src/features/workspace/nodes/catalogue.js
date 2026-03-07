// ─────────────────────────────────────────────
// NODE CATALOGUE — MVP-1 node set
// Node Types: AI Form, AI Go, File Export
// PRD: prd/nodes.md
// ─────────────────────────────────────────────
import { N8N_BASE } from "../../../config.js";

export const NODE_CATALOGUE = [
  // ── AI Extraction ──────────────────────────
  // behavior: "ai_form" — Has form UI (file upload), pauses for input, then QC
  {
    node_type: "ai_extraction",
    label: "AI Extraction",
    behavior: "ai_form",
    category: "AI",
    icon: "🗂️",
    desc: "Upload a file and let AI extract structured data from it. File upload is required.",
    n8n_form_url: `${N8N_BASE}/form/ai-extraction`,
    requires_file: true,
    requires_prompt: false,
    requires_table_input: false,
    output_modes: ["create", "overwrite"],
    prompt_label: "Extraction Prompt",
    prompt_placeholder: "e.g. Extract all transactions from this bank statement",
    table_name_label: "Output Table Name",
    table_name_hint: "Name this table to reference it in downstream nodes.",
    default_table_name: "AI Extraction Output",
  },

  // ── AI Transformation ──────────────────────
  // behavior: "ai_go" — Auto-triggers via webhook, runs AI, then pauses for QC
  {
    node_type: "ai_transformation",
    label: "AI Transformation",
    behavior: "ai_go",
    category: "AI",
    icon: "✨",
    desc: "Apply an AI transformation to an upstream table using a text prompt. No file upload needed.",
    requires_file: false,
    requires_prompt: true,
    requires_table_input: true,
    output_modes: ["create", "overwrite"],
    prompt_label: "Transformation Prompt",
    prompt_placeholder: "e.g. Normalize all dates to YYYY-MM-DD, remove duplicate rows",
    table_name_label: "Output Table Name",
    table_name_hint: "Name this table to reference it in downstream nodes.",
    default_table_name: "AI Transformation Output",
  },

  // ── Export ─────────────────────────────────
  // behavior: "file_export" — Auto-triggers via webhook, downloads file, no QC
  {
    node_type: "export_excel",
    label: "Export to Excel",
    behavior: "file_export",
    category: "Export",
    icon: "📤",
    desc: "Export a table to a .xlsx file.",
    requires_file: false,
    requires_prompt: false,
    requires_table_input: true,
    table_name_label: "Source Table Name",
    table_name_hint: "Enter the name of the table to export. Must match the output table name from the upstream node.",
    default_table_name: "",
  },
];
