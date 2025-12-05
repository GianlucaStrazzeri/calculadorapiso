import React from "react";
import "./ContadorReps.css";

export default function ModalFiltroEjercicios({
  isOpen,
  onClose,
  filters,
  setFilters,
  options = { equipment: [], goals: [], areas: [], levels: [] },
}) {
  if (!isOpen) return null;

  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({ equipment: "", goal: "", area: "", level: "", searchTerm: "" });
  };

  return (
    <div className="cr-modal-backdrop">
      <div className="cr-modal" style={{ maxWidth: 720 }}>
        <div className="cr-modal-header">
          <h3>Filtrar ejercicios</h3>
          <button type="button" className="cr-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="cr-modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="cr-field">
              <span>Material</span>
              <select value={filters.equipment || ""} onChange={(e) => update('equipment', e.target.value)} className="cr-select">
                <option value="">(todos)</option>
                {options.equipment.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label className="cr-field">
              <span>Objetivo</span>
              <select value={filters.goal || ""} onChange={(e) => update('goal', e.target.value)} className="cr-select">
                <option value="">(todos)</option>
                {options.goals.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label className="cr-field">
              <span>Zona</span>
              <select value={filters.area || ""} onChange={(e) => update('area', e.target.value)} className="cr-select">
                <option value="">(todas)</option>
                {options.areas.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label className="cr-field">
              <span>Nivel</span>
              <select value={filters.level || ""} onChange={(e) => update('level', e.target.value)} className="cr-select">
                <option value="">(todos)</option>
                {options.levels.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="cr-modal-footer">
          <button type="button" className="cr-btn cr-btn-ghost" onClick={handleClear}>Limpiar</button>
          <button type="button" className="cr-btn cr-btn-primary" onClick={onClose}>Aplicar y cerrar</button>
        </div>
      </div>
    </div>
  );
}
