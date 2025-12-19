// AddClientModal.jsx
import React, { useState } from "react";
import "./AddClientModal.css";

export function AddClientModal({ isOpen, onClose, onAddClient, client = null, onUpdateClient = null }) {
  const [nombre, setNombre] = useState(client ? client.nombre : "");
  const [email, setEmail] = useState(client ? client.email || "" : "");
  const [telefono, setTelefono] = useState(client ? client.telefono || "" : "");
  const [nota, setNota] = useState(client ? client.nota || "" : "");

  const CLIENTS_KEY = "cr_clients_v1";

  if (!isOpen) return null;

  // keep inputs in sync when client prop changes (open edit modal)
  React.useEffect(() => {
    if (client) {
      setNombre(client.nombre || "");
      setEmail(client.email || "");
      setTelefono(client.telefono || "");
      setNota(client.nota || "");
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = nombre.trim();
    if (!trimmedName) return;

    // create a readable slug based on the name (e.g. "Juan Perez" -> "juanperez")
    const baseId = trimmedName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    let id = baseId || String(Date.now());
    try {
      const raw = localStorage.getItem(CLIENTS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      let suffix = 2;
      while (existing.some((c) => c.id === id)) {
        id = `${baseId}${suffix}`;
        suffix += 1;
      }
    } catch (err) {
      console.warn("No se pudo comprobar unicidad de id de cliente", err);
    }

    const newClient = {
      id,
      nombre: trimmedName,
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      nota: nota.trim() || "",
      createdAt: client ? client.createdAt : new Date().toISOString(),
    };

    if (client && onUpdateClient) {
      onUpdateClient(newClient);
    } else {
      onAddClient(newClient);
    }
    setNombre("");
    setEmail("");
    setTelefono("");
    setNota("");
  };

  return (
    <div className="cr-modal-backdrop">
      <div className="cr-modal">
        <div className="cr-modal-header">
          <h2>{client ? '✏️ Editar cliente' : '➕ Añadir cliente'}</h2>
          <button
            type="button"
            className="cr-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="cr-modal-body" onSubmit={handleSubmit}>
          <label className="cr-field">
            <span>Nombre completo</span>
            <input
              type="text"
              className="cr-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Carlos García"
              required
            />
          </label>

          <label className="cr-field">
            <span>Email (opcional)</span>
            <input
              type="email"
              className="cr-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@example.com"
            />
          </label>

          <label className="cr-field">
            <span>Teléfono (opcional)</span>
            <input
              type="tel"
              className="cr-input"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+34..."
            />
          </label>

          <label className="cr-field">
            <span>Nota / Patología (opcional)</span>
            <textarea
              className="cr-textarea"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej. Dolor patelar, fase de readaptación"
              rows={3}
            />
          </label>

          <div className="cr-modal-footer">
            <button
              type="button"
              className="cr-btn cr-btn-ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="cr-btn cr-btn-primary">
              {client ? 'Actualizar cliente' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
