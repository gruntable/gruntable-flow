import { useState, useRef, useEffect } from "react";
import { C, BEHAVIOR_LABELS, BICON } from "../../../../../../styles.jsx";
import { listTables, deleteTable, replaceTable } from "../../../../services/table.js";
import { NODE_REGISTRY } from "../../../../utils/node-loader.js";

const SETTINGS_HTMLS = import.meta.glob(
  "../../../../../../nodes/*/settings/index.html",
  { query: '?raw', import: 'default', eager: true }
);
const SETTINGS_HTML_MAP = {};
for (const [path, html] of Object.entries(SETTINGS_HTMLS)) {
  const match = path.match(/nodes\/([^/]+)\//);
  if (match) SETTINGS_HTML_MAP[match[1].replace(/-/g, "_")] = html;
}

export default function SettingsTab({
  selNode, nodes, tableNames, nodePrompts, nodeSourceTables,
  setNodes, setTableNames, setNodePrompts, setNodeSourceTables,
  triggerSave, updateNodeTitle, saveToHistory, isRunning,
}) {
  const n = selNode;
  const manifest = NODE_REGISTRY[n?.node_type];
  const nodeHtml = SETTINGS_HTML_MAP[n?.node_type];
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(400);
  const iframeChangingRef = useRef(false);
  const [dbTables, setDbTables] = useState([]);

  const upstreamTables = (() => {
    const tables = [];
    for (const x of nodes) {
      if (x.id === n?.id) break;
      const name = tableNames[x.id]?.trim();
      if (name) tables.push(name);
    }
    return [...new Set(tables)];
  })();

  const allTables = [...new Set([...upstreamTables, ...dbTables])];

  const buildMsg = () => {
    const storedSource = nodeSourceTables[n.id];
    const srcTables = (() => {
      if (!storedSource) return [];
      if (Array.isArray(storedSource)) return storedSource;
      try { return JSON.parse(storedSource); } catch { return [storedSource]; }
    })().filter(Boolean);
    const bLabel = BEHAVIOR_LABELS[manifest?.behavior] || manifest?.behavior || '';
    const bIcon  = BICON[manifest?.behavior] || '';
    return {
      nodeTitle: n.title || n.label,
      behaviorLabel: bLabel + (bIcon ? ' ' + bIcon : ''),
      settings: n.settings || {},
      prompt: nodePrompts[n.id] ?? '',
      manifest,
      sourceTables: srcTables,
      allTables,
      tableName: tableNames[n.id] || '',
      conflictMode: n.tableOutput?.conflictMode || '',
      workflowTableNames: Object.entries(tableNames)
        .filter(([id]) => id !== n.id)
        .map(([_, name]) => name?.trim()).filter(Boolean),
    };
  };

  // Reset iframe height when switching nodes
  useEffect(() => { setIframeHeight(400); }, [n?.id]);

  // Load DB tables once
  useEffect(() => {
    listTables().then(data => setDbTables(data.tables || [])).catch(() => {});
  }, []);

  // Throttle iframe resize updates to prevent performance issues
  const lastResizeRef = useRef(0);
  // Message handler
  useEffect(() => {
    const handler = (e) => {
      if (!e.data?.type) return;

      if (e.data.type === 'resize') {
        const now = Date.now();
        if (now - lastResizeRef.current < 300) return;
        lastResizeRef.current = now;
        setIframeHeight(Math.max(150, e.data.height));
        return;
      }

      if (e.data.type === 'requestData') {
        const { resource, requestId } = e.data;
        const respond = (data) => iframeRef.current?.contentWindow?.postMessage(
          { type: 'dataResponse', resource, requestId, data }, '*'
        );
        if (resource === 'tables') {
          listTables()
            .then(data => respond([...new Set([...upstreamTables, ...(data.tables || [])])]))
            .catch(() => respond([]));
        } else {
          respond(null);
        }
        return;
      }

      if (e.data.type === 'deleteTable') {
        const { tableName } = e.data;
        if (window.confirm(`Delete table "${tableName}"? This cannot be undone.`)) {
          deleteTable(tableName).then(() => {
            listTables().then(data => {
              const tables = [...new Set([...upstreamTables, ...(data.tables || [])])];
              iframeRef.current?.contentWindow?.postMessage(
                { type: 'dataResponse', resource: 'tables', requestId: 'afterDelete', data: tables }, '*'
              );
            });
          });
        }
        return;
      }

      if (e.data.type === 'createSampleTables') {
        const { tables } = e.data;
        const promises = tables.map(t => replaceTable(t.name, t.columns, t.rows));
        Promise.all(promises).then(async () => {
          const data = await listTables();
          const allTables = [...new Set([...upstreamTables, ...(data.tables || [])])];
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'dataResponse', resource: 'tables', requestId: 'afterCreate', data: allTables }, '*'
          );
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'tablesCreated' }, '*'
          );
        }).catch(err => {
          console.error('[SettingsTab] createSampleTables error:', err);
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'tablesCreateFailed' }, '*'
          );
          alert('Error creating sample tables: ' + err.message);
        });
        return;
      }

      if (e.data.type === 'settingsChange') {
        iframeChangingRef.current = true;
        const { patch } = e.data;

        if (patch?.nodeTitle !== undefined) {
          updateNodeTitle(n.id, patch.nodeTitle.slice(0, 40));
        }
        if (patch?.prompt !== undefined) {
          setNodePrompts(p => ({ ...p, [n.id]: patch.prompt }));
        }
        if (patch?.settings) {
          const { processing: pp, ...top } = patch.settings;
          setNodes(ns => ns.map(x => x.id === n.id ? {
            ...x,
            settings: {
              ...x.settings,
              ...top,
              ...(pp ? { processing: { ...x.settings?.processing, ...pp } } : {}),
            }
          } : x));
        }
        if (patch?.sourceTable !== undefined) {
          setNodeSourceTables(s => ({ ...s, [n.id]: patch.sourceTable }));
        }
        if (patch?.sourceTables !== undefined) {
          setNodeSourceTables(s => ({ ...s, [n.id]: patch.sourceTables }));
        }
        if (patch?.tableName !== undefined) {
          setTableNames(t => ({ ...t, [n.id]: patch.tableName }));
          setNodes(ns => ns.map(x => x.id === n.id
            ? { ...x, tableOutput: { ...x.tableOutput, isNewTable: !allTables.some(t => t.toLowerCase() === patch.tableName.toLowerCase()) } }
            : x
          ));
        }
        if (patch?.conflictMode !== undefined) {
          setNodes(ns => ns.map(x => x.id === n.id
            ? { ...x, tableOutput: { ...x.tableOutput, conflictMode: patch.conflictMode } }
            : x
          ));
        }

        triggerSave();
        saveToHistory?.();
        setTimeout(() => { iframeChangingRef.current = false; }, 0);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [n?.id, setNodePrompts, setNodes, setTableNames, setNodeSourceTables,
      updateNodeTitle, triggerSave, saveToHistory, upstreamTables]);

  // Send stateUpdate on undo/redo (state changed outside iframe)
  const _title   = n?.title;
  const _settings = JSON.stringify(n?.settings);
  const _prompt  = nodePrompts[n?.id];
  const _source  = JSON.stringify(nodeSourceTables[n?.id]);
  const _tname   = tableNames[n?.id];
  const _conflict = n?.tableOutput?.conflictMode;
  const _allTables = JSON.stringify(allTables);

  useEffect(() => {
    if (iframeChangingRef.current) return;
    const iw = iframeRef.current?.contentWindow;
    if (!iw || !n) return;
    iw.postMessage({ type: 'stateUpdate', ...buildMsg() }, '*');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_title, _settings, _prompt, _source, _tname, _conflict, _allTables]);

  return (
    <div style={{ pointerEvents: isRunning ? 'none' : undefined, opacity: isRunning ? 0.5 : 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {nodeHtml ? (
        <iframe
          key={n.id}
          ref={iframeRef}
          srcDoc={nodeHtml}
          onLoad={() => {
            const iw = iframeRef.current?.contentWindow;
            if (!iw) return;
            iw.postMessage({ type: 'init', nodeId: n.id, ...buildMsg() }, '*');
          }}
          style={{ width: '100%', minHeight: '100%', height: iframeHeight, border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={`${n.node_type} settings`}
        />
      ) : (
        <div style={{ padding: 20, color: C.muted, fontSize: 12, fontStyle: 'italic' }}>
          No settings for this node.
        </div>
      )}
    </div>
  );
}
