// ClientSelector.jsx
//
// Componente: ClientSelector
// - Propósito: Mostrar un selector/buscador de clientes (pacientes) para el
//   planificador de ejercicios. Permite buscar por nombre/nota/email/id,
//   seleccionar un cliente, copiar o abrir un enlace público al cliente y
//   abrir el modal para añadir un nuevo cliente.
// - Props:
//    `clients` (Array): lista de objetos cliente { id, nombre, nota, ... }.
//    `selectedClientId` (string|null): id del cliente actualmente seleccionado.
//    `onChangeClient` (fn): callback cuando cambia la selección (id|null).
//    `onOpenAddClient` (fn): callback para abrir el modal de añadir cliente.
//    `disableAdd` (bool): si true oculta el botón de "Añadir cliente".
//    `fixedClientId` (string|null): si se establece, bloquea la edición (vista pública).
// - Comportamiento:
//    - Filtra la lista según el término de búsqueda.
//    - Genera un enlace público `/contadorreps/:clientId` que se puede copiar
//      al portapapeles o abrir en una nueva pestaña.
//    - Mantiene compatibilidad visual con los estilos compartidos (.cr-*)
//
// Notas:
// - Este componente está localizado en `src/pages/Ejercicio/Client`.
// - Los estilos se cargan desde `ClientSelector.css`.
//
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
  // callback to open the Assign modal from outside (renders a small + inside the select)
  onOpenAssign = null,
  // optional: pass current assignments so we can include them in the shared link
  exerciseAssignments = [],
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopyLink = (id) => {
    if (!id) return;
    const path = `/contadorreps/${encodeURIComponent(id)}`;
    let url = `${window.location.origin}${path}`;
    try {
      const clientAssignments = (exerciseAssignments || []).filter(a => String(a.clientId) === String(id));
      if (clientAssignments && clientAssignments.length > 0) {
        const payload = JSON.stringify(clientAssignments);
        // base64url encode
        const b64 = btoa(unescape(encodeURIComponent(payload))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        url = `${url}?a=${b64}`;
      }
    } catch (e) {
      // ignore encoding errors
    }
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

  const buildShareUrl = (id) => {
    const path = `/contadorreps/${encodeURIComponent(id)}`;
    let url = `${window.location.origin}${path}`;
    try {
      const clientAssignments = (exerciseAssignments || []).filter(a => String(a.clientId) === String(id));
      if (clientAssignments && clientAssignments.length > 0) {
        const payload = JSON.stringify(clientAssignments);
        const b64 = btoa(unescape(encodeURIComponent(payload))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        url = `${url}?a=${b64}`;
      }
    } catch (e) {
      // ignore
    }
    return url;
  };

  const handleOpenLink = (id) => {
    if (!id) return;
    const url = buildShareUrl(id);
    window.open(url, "_blank");
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
        <div className="cr-select-wrap">
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

          {/* Small in-select assign button (visually inside the select) */}
          {selectedClientId && !fixedClientId && onOpenAssign && (
            <button
              type="button"
              className="cr-select-add-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenAssign();
              }}
              title="Asignar ejercicio al cliente"
            >
              ➕
            </button>
          )}
        </div>
      )}

      {selectedClientId && (
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Link: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 6 }}>{buildShareUrl(selectedClientId)}</code>
          </div>
          {!fixedClientId && (
            <button type="button" className="cr-btn" onClick={() => handleOpenLink(selectedClientId)} style={{ padding: "6px 8px" }}>
              Abrir
            </button>
          )}
          <button type="button" className="cr-btn" onClick={() => { const u = buildShareUrl(selectedClientId); if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(u).catch(()=>handleCopyLink(selectedClientId)); } else { handleCopyLink(selectedClientId); } }} style={{ padding: "6px 8px" }}>
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
