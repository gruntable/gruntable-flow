import { useState, useRef } from "react";
import { C, S, BICON, BEHAVIOR_LABELS } from "../../../platform/styles.jsx";

export default function SettingsTab({
  selNode, nodes, tableNames, nodePrompts, nodeSourceTables,
  setNodes, setTableNames, setNodePrompts, setNodeSourceTables,
  triggerSave, updateNodeTitle,
}) {
  const [titleHover, setTitleHover] = useState(false);
  const [tableNameWarning, setTableNameWarning] = useState(null);
  const warningTimeoutRef = useRef(null);
  const n = selNode;

  const isFirst = nodes.indexOf(n) === 0;
  const noTableInput = !n.requires_table_input;

  const upstreamTables = (() => {
    const tables = [];
    for (const x of nodes) {
      if (x.id === n.id) break;
      const name = tableNames[x.id]?.trim();
      if (name) tables.push(name);
    }
    return [...new Set(tables)];
  })();

  const MAX_INPUT_TABLES = 5;

  const getSourceTablesArray = (nodeId) => {
    const value = nodeSourceTables[nodeId];
    if (!value) return [""];
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return [value];
  };

  const sourceTablesArray = n.node_type === "ai_transformation" ? getSourceTablesArray(n.id) : [];
  const canAddMoreInputs = sourceTablesArray.length < MAX_INPUT_TABLES;

  // Helper function to generate unique table name
  const generateUniqueTableName = (baseName, currentNodeId) => {
    const trimmedName = baseName.trim();
    if (!trimmedName) return trimmedName;
    
    // Get all table names from other nodes
    const existingNames = Object.entries(tableNames)
      .filter(([nodeId, name]) => nodeId !== currentNodeId && name?.trim())
      .map(([_, name]) => name.trim());
    
    // Check if name already exists
    if (!existingNames.includes(trimmedName)) {
      return trimmedName;
    }
    
    // Generate unique name with counter
    let counter = 2;
    let uniqueName = `${trimmedName} (${counter})`;
    while (existingNames.includes(uniqueName)) {
      counter++;
      uniqueName = `${trimmedName} (${counter})`;
    }
    
    return uniqueName;
  };

  const renderUserForm = () => {
    if (!n.requires_file) return null;
    return (
      <>
        <div style={S.sectionBar("#3b82f6")}>
          <span>📁</span> User Form
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={S.fieldRow}>
            <div style={S.label}>File upload</div>
            <div style={{ flex: 1, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
              Upload your file in the <strong>Run tab</strong>. Supported formats: PDF, PNG, JPG, XLSX, XLS, CSV.
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderProcessingParams = () => {
    if (n.behavior === "file_export" || n.behavior === "export") {
      const rawVal = nodePrompts[n.id] ?? "";
      const baseName = rawVal.endsWith(".xlsx") ? rawVal.slice(0, -5) : rawVal;
      return (
        <div style={{ marginBottom: 8 }}>
          <div style={S.fieldRow}>
            <div style={S.label}>File name</div>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...S.input, paddingRight: baseName ? 46 : 10 }}
                placeholder="e.g. report"
                value={baseName}
                onChange={e => {
                  const base = e.target.value.replace(/\.xlsx$/i, "");
                  const stored = base ? `${base}.xlsx` : "";
                  setNodePrompts(p => ({ ...p, [n.id]: stored }));
                  triggerSave();
                }}
              />
              {baseName && (
                <span style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  fontSize: 11, color: C.muted, pointerEvents: "none", userSelect: "none",
                }}>
                  .xlsx
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    const hasPrompt = n.requires_prompt || n.prompt_label;
    if (!hasPrompt) {
      return (
        <div style={{ color: C.muted, fontSize: 12, fontStyle: "italic", marginBottom: 8 }}>
          No processing parameters for this node.
        </div>
      );
    }

    return (
      <div style={{ marginBottom: 8 }}>
        <div>
          <div style={S.fieldRow}>
            <div style={{ ...S.label, display: "flex", alignItems: "center", gap: 4 }}>
              {n.prompt_label ?? "Prompt"}
              {n.requires_prompt && (
                <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 700 }}>required</span>
              )}
            </div>
            <textarea
              style={{ ...S.input, resize: "vertical", minHeight: 80, lineHeight: 1.5, fontFamily: "inherit" }}
              placeholder={n.prompt_placeholder ?? "Describe what you want…"}
              value={nodePrompts[n.id] ?? ""}
              onChange={e => {
                setNodePrompts(p => ({ ...p, [n.id]: e.target.value }));
                triggerSave();
              }}
            />
          </div>
          {n.requires_prompt && !nodePrompts[n.id]?.trim() && (
            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
              A prompt is required before this node can run.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 2 }}>
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            fontWeight: 700,
            fontSize: 14,
            borderBottom: titleHover ? `2px solid ${C.black}` : "2px solid transparent",
            outline: "none",
            background: "transparent",
            padding: "6px 0",
            fontFamily: "inherit",
            transition: "border-color 0.15s ease",
            cursor: "text",
            minWidth: 20,
            display: "inline-block",
            whiteSpace: "pre",
          }}
          onMouseEnter={() => setTitleHover(true)}
          onMouseLeave={() => setTitleHover(false)}
          onBlur={e => {
            if (updateNodeTitle) {
              updateNodeTitle(n.id, e.target.innerText.slice(0, 40));
            }
          }}
        >
          {n.title || n.label}
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
        <span>{n.label}</span>
        <span style={{ margin: "0 6px", color: "#ccc" }}>•</span>
        <span>{BEHAVIOR_LABELS[n.behavior] || n.behavior}</span>
        <span style={{ marginLeft: 4, minWidth: 44, display: 'inline-block', textAlign: 'center', whiteSpace: 'nowrap' }}>{BICON[n.behavior]}</span>
      </div>

      {!noTableInput && (
        <>
          <div style={{ ...S.sectionBar("#22c55e"), opacity: isFirst ? 0.45 : 1 }}>
            <span>📊</span> Table Source
          </div>
          {isFirst ? (
            <div style={{ marginBottom: 8, opacity: 0.45 }}>
              <div style={{ ...S.input, background: "#f5f5f5", color: C.muted, fontStyle: "italic" }}>
                No upstream table exists yet.
              </div>
            </div>
          ) : upstreamTables.length > 0 ? (
            n.node_type === "ai_transformation" ? (
              <div style={{ marginBottom: 8 }}>
                {sourceTablesArray.map((tableValue, idx) => (
                  <div key={idx} style={{ ...S.fieldRow, marginBottom: 6 }}>
                    <div style={S.label}>{idx === 0 ? "Input tables" : ""}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <select
                        style={{ ...S.input, flex: 1 }}
                        value={tableValue}
                        onChange={e => {
                          const newArray = [...sourceTablesArray];
                          newArray[idx] = e.target.value;
                          setNodeSourceTables(s => ({ ...s, [n.id]: newArray }));
                          triggerSave();
                        }}
                      >
                        <option value="">Select table...</option>
                        {upstreamTables.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {sourceTablesArray.length > 1 && (
                        <button
                          onClick={() => {
                            const newArray = sourceTablesArray.filter((_, i) => i !== idx);
                            setNodeSourceTables(s => ({ ...s, [n.id]: newArray }));
                            triggerSave();
                          }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 16, color: "#ef4444", padding: "4px 8px"
                          }}
                          title="Remove input"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  {canAddMoreInputs ? (
                    <button
                      onClick={() => {
                        const newArray = [...sourceTablesArray, ""];
                        setNodeSourceTables(s => ({ ...s, [n.id]: newArray }));
                        triggerSave();
                      }}
                      style={{
                        background: "none", border: "1px dashed #ccc", borderRadius: 4,
                        padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#666"
                      }}
                    >
                      + Add Input
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: C.muted }}>Maximum {MAX_INPUT_TABLES} inputs</span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 8 }}>
                <div style={S.fieldRow}>
                  <div style={S.label}>Input table</div>
                  <select
                    style={S.input}
                    value={nodeSourceTables[n.id] ?? upstreamTables[0]}
                    onChange={e => {
                      setNodeSourceTables(s => ({ ...s, [n.id]: e.target.value }));
                      triggerSave();
                    }}
                  >
                    {upstreamTables.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )
          ) : (
            <div style={{ marginBottom: 8 }}>
              <div style={{ ...S.input, background: "#f5f5f5", color: C.muted, fontStyle: "italic" }}>
                No upstream table exists yet
              </div>
            </div>
          )}
        </>
      )}

      {renderUserForm()}

      <div style={S.sectionBar("#f59e0b")}>
        <span>⚙️</span> Processing Parameters
      </div>
      {renderProcessingParams()}

      {(n.behavior !== "file_export" && n.behavior !== "export") && (
        <>
          <div style={S.sectionBar("#8b5cf6")}>
            <span>📤</span> Table Output
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={S.fieldRow}>
              <div style={S.label}>Output mode</div>
              <select
                style={S.input}
                value={n.tableOutput?.mode ?? "create"}
                onChange={e => {
                  setNodes(ns => ns.map(x => x.id === n.id
                    ? { ...x, tableOutput: { ...x.tableOutput, mode: e.target.value } }
                    : x
                  ));
                  triggerSave();
                }}
              >
                <option value="create">Create new table</option>
                {(n.output_modes ?? ["create"]).includes("overwrite") && !isFirst && (
                  <option value="overwrite">Select existing table (overwrite)</option>
                )}
              </select>
            </div>
            <div style={S.fieldRow}>
              <div style={S.label}>Table name</div>
              {(n.tableOutput?.mode ?? "create") === "create" ? (
                <input
                  style={S.input}
                  placeholder="e.g. AI Extraction Output"
                  value={tableNames[n.id] ?? ""}
                  onChange={e => {
                    const value = e.target.value.replace(/_/g, ' ');
                    setTableNames(t => ({ ...t, [n.id]: value }));
                  }}
                  onBlur={e => {
                    const inputValue = e.target.value;
                    const uniqueName = generateUniqueTableName(inputValue, n.id);
                    if (uniqueName !== inputValue) {
                      setTableNames(t => ({ ...t, [n.id]: uniqueName }));
                      // Show warning that table name was auto-changed
                      const originalName = inputValue.trim();
                      setTableNameWarning(`${originalName} table already exists`);
                      // Clear previous timeout if exists
                      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
                      // Set new timeout to clear warning after 5 seconds
                      warningTimeoutRef.current = setTimeout(() => {
                        setTableNameWarning(null);
                      }, 5000);
                    } else {
                      // Clear warning if name is unique
                      setTableNameWarning(null);
                      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
                    }
                    triggerSave();
                  }}
                />
              ) : upstreamTables.length > 0 ? (
                <select style={S.input} onChange={triggerSave}>
                  {upstreamTables.map(t => <option key={t}>{t}</option>)}
                </select>
              ) : (
                <div style={{ ...S.input, background: "#f5f5f5", color: C.muted, fontStyle: "italic" }}>
                  No upstream table exists yet
                </div>
              )}
            </div>
            {(n.tableOutput?.mode ?? "create") === "create" && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
                Spaces recommended (underscores will be auto-converted)
              </div>
            )}
            {n.table_name_hint && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
                {n.table_name_hint}
              </div>
            )}
            {tableNameWarning && (
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: 500 }}>
                {tableNameWarning}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
