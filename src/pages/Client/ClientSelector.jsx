// ClientSelector.jsx
import React, { useState, useMemo } from "react";
import "./ClientSelector.css"; // o un css propio si prefieres

export function ClientSelector({
  clients,
  selectedClientId,
  onChangeClient,
  onOpenAddClient,
}) {
  const [searchTerm, setSearchTerm] = useState("");

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
        <button
          type="button"
          className="cr-btn cr-btn-secondary"
          onClick={onOpenAddClient}
        >
          ➕ Añadir cliente
        </button>
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
    </div>
  );
}
