// AddClientModal.jsx
import React, { useState } from "react";
import "./AddClientModal.css";

export function AddClientModal({ isOpen, onClose, onAddClient }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nota, setNota] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = nombre.trim();
    if (!trimmedName) return;

    const id = trimmedName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const newClient = {
      id,
      nombre: trimmedName,
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      nota: nota.trim() || "",
      createdAt: new Date().toISOString(),
    };

    onAddClient(newClient);
    setNombre("");
    setEmail("");
    setTelefono("");
    setNota("");
  };

  return (
    <div className="cr-modal-backdrop">
      <div className="cr-modal">
        <div className="cr-modal-header">
          <h2>➕ Añadir cliente</h2>
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
              Guardar cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
