// ClientSelector.jsx
import React, { useState, useMemo } from "react";
import "./ClientSelector.css"; // o un css propio si prefieres

export function ClientSelector({
  clients,
  selectedClientId,
  onChangeClient,
  onOpenAddClient,
  // new props:
  disableAdd = false, // hide the add button when true
  fixedClientId = null, // if set, make the selector read-only and force this client
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopyLink = (id) => {
    if (!id) return;
    const path = `/contadorreps/${encodeURIComponent(id)}`;
    const url = `${window.location.origin}${path}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {
        // fallback handled below
      });
    } else {
      // fallback: create textarea
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        console.warn("No se pudo copiar enlace", e);
      }
      document.body.removeChild(ta);
    }
  };

  const handleOpenLink = (id) => {
    if (!id) return;
    const path = `/contadorreps/${encodeURIComponent(id)}`;
    window.open(path, "_blank");
  };

  const filtered = useMemo(() => {
    const term = String(searchTerm || "").trim().toLowerCase();
    if (!term) return clients || [];
    return (clients || []).filter((c) => {
      const text = `${c.nombre || ""} ${c.nota || ""} ${c.email || ""} ${c.id || ""}`.toLowerCase();
      return text.includes(term);
    });
  }, [clients, searchTerm]);

  return (
    <div className="cr-client-selector">
      <div className="cr-client-selector-header">
        <h3>Paciente / Cliente</h3>
        <input
          type="text"
          className="cr-exercise-search-input"
          placeholder="Buscar cliente (nombre, nota...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginLeft: 12, width: 260 }}
        />
        {!disableAdd && (
          <button
            type="button"
            className="cr-btn cr-btn-secondary"
            onClick={onOpenAddClient}
          >
            ➕ Añadir cliente
          </button>
        )}
      </div>

      {(!clients || clients.length === 0) ? (
        <p className="cr-client-empty">
          Todavía no hay clientes. Añade el primero para asignarle ejercicios.
        </p>
      ) : (
        <select
          className="cr-select"
          value={selectedClientId || ""}
          onChange={(e) => onChangeClient(e.target.value || null)}
        >
          <option value="">Sin cliente seleccionado</option>
          {filtered.map((client) => (
            <option key={client.id} value={client.id}>
              {client.nombre} {client.nota ? `· ${client.nota}` : ""}
            </option>
          ))}
        </select>
      )}

      {selectedClientId && (
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Link: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 6 }}>{`/contadorreps/${selectedClientId}`}</code>
          </div>
          {!fixedClientId && (
            <button type="button" className="cr-btn" onClick={() => handleOpenLink(selectedClientId)} style={{ padding: "6px 8px" }}>
              Abrir
            </button>
          )}
          <button type="button" className="cr-btn" onClick={() => handleCopyLink(selectedClientId)} style={{ padding: "6px 8px" }}>
            Copiar enlace
          </button>
        </div>
      )}

      {fixedClientId && (
        <div style={{ marginTop: 8, color: "#9ca3af", fontSize: "0.9rem" }}>
          Vista pública del paciente — no se pueden añadir ni cambiar clientes aquí.
        </div>
      )}
    </div>
  );
}
