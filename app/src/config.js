// ─────────────────────────────────────────────
// N8N CONFIGURATION
// Update N8N_BASE if the host changes.
// n8n form paths are defined in nodes/catalogue.js and
// must match imported workflows in /n8n/workflows.
//
// To switch environments, create/edit app/.env.local:
//   STG:  VITE_API_BASE_URL=https://n8n-stg.gruntable.com
//   PROD: VITE_API_BASE_URL=https://grunts.gruntable-api.com
// Then restart the dev server. .env.local is gitignored.
// ─────────────────────────────────────────────

export const N8N_BASE = import.meta.env.VITE_API_BASE_URL || "https://n8n-stg.gruntable.com";

// Orchestrator endpoints (PRD: prd/platform/orchestrator.md)
export const ORCHESTRATOR_ENDPOINTS = {
  START: `${N8N_BASE}/webhook/orchestrator/start`,
  STATUS: `${N8N_BASE}/webhook/orchestrator/status`,
  ADVANCE: `${N8N_BASE}/webhook/orchestrator/advance`,
  NODE_COMPLETE: `${N8N_BASE}/webhook/orchestrator/node-complete`,
};

// Table utility endpoints (PRD: prd/platform/n8n-workflows/utilities.md)
export const TABLE_ENDPOINTS = {
  READ: `${N8N_BASE}/webhook/table/read`,
  EDIT: `${N8N_BASE}/webhook/table/edit`,
  ROW: `${N8N_BASE}/webhook/table/row`,
};

// Initial workflow nodes — empty; user adds nodes via the picker
export const INITIAL_NODES = [];
