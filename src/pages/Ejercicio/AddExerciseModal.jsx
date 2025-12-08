// AddExerciseModal.jsx
// Modal para añadir nuevos ejercicios (con imagen/vídeo opcional)

import React, { useState, useEffect } from "react";
import { EXERCISE_TYPES } from "./exercisesConfig";
import { DEFAULT_AREAS, DEFAULT_EQUIPMENT, DEFAULT_GOALS } from "./filtersConfig";
import './AddExerciseModal.css';

/**
 * AddExerciseModal
 * - Muestra un modal para crear un nuevo ejercicio con metadatos opcionales.
 * - Props:
 *    `isOpen` (boolean): controla la visibilidad del modal.
 *    `onClose` (function): callback al cerrar el modal.
 *    `onAddExercise` (function): callback con el objeto ejercicio al enviar el formulario.
 *
 * Internamente contiene helpers:
 *  - `slugify(text)`: genera un id a partir del nombre.
 *  - `handleSubmit(e)`: valida y compone el objeto `newExercise`, luego llama a `onAddExercise`.
 */
export default function AddExerciseModal({ isOpen, onClose, onAddExercise }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState(EXERCISE_TYPES.BODYWEIGHT);
  const [emoji, setEmoji] = useState("🏋️");
  const [color, setColor] = useState("#3b82f6");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState("none"); // "none" | "image" | "video"
  const [mediaUrl, setMediaUrl] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [goal, setGoal] = useState([]);
  const [area, setArea] = useState("");
  const [level, setLevel] = useState("inicial");

  useEffect(() => {
    if (isOpen) {
      // reset básico al abrir
      setLabel("");
      setType(EXERCISE_TYPES.BODYWEIGHT);
      setEmoji("🏋️");
      setColor("#3b82f6");
      setDescription("");
      setMediaType("none");
      setMediaUrl("");
      setEquipment([]);
      setGoal([]);
      setArea("");
      setLevel("inicial");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Genera un id legible a partir del label
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9áéíóúüñ]+/gi, "_")
      .replace(/^_+|_+$/g, "");
  }

  // Maneja el envío del formulario: compone el objeto ejercicio y lo entrega al callback
  function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim()) return;

    const id = slugify(label) || `ejercicio_${Date.now()}`;

    const newExercise = {
      id,
      label: label.trim(),
      emoji: emoji || "🏋️",
      color: color || "#3b82f6",
      type,
      description:
        description.trim() ||
        "Ejercicio personalizado añadido por el usuario.",
      mediaType: mediaType === "none" ? undefined : mediaType,
      mediaUrl: mediaType === "none" || !mediaUrl.trim() ? undefined : mediaUrl.trim(),
    };

    if (equipment && equipment.length > 0) newExercise.equipment = equipment;
    if (goal && goal.length > 0) newExercise.goal = goal;
    if (area) newExercise.area = area;
    if (level) newExercise.level = level;

    onAddExercise(newExercise);
  }

  return (
    <div className="aem-overlay">
      <div className="aem-modal">
        <div className="aem-header">
          <h2 className="aem-title">Añadir nuevo ejercicio</h2>
          <button type="button" onClick={onClose} className="aem-close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="aem-label">Nombre del ejercicio</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Sentadilla goblet a cajón"
              className="aem-input"
            />
          </div>

          <div className="aem-row">
            <div style={{ flex: 1 }}>
              <label className="aem-label">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="aem-input">
                <option value={EXERCISE_TYPES.BODYWEIGHT}>Peso corporal</option>
                <option value={EXERCISE_TYPES.WEIGHTED}>Con peso / máquina</option>
              </select>
            </div>
            <div className="aem-col-80">
              <label className="aem-label">Emoji</label>
              <input type="text" maxLength={4} value={emoji} onChange={(e) => setEmoji(e.target.value)} className="aem-input" />
            </div>
            <div className="aem-col-80">
              <label className="aem-label">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="aem-color-input" />
            </div>
          </div>

          <div>
            <label className="aem-label">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve explicación del objetivo, musculatura principal, etc." className="aem-textarea" />
          </div>

          <div className="aem-section">
            <label className="aem-label">Imagen o vídeo de referencia (opcional)</label>
            <div className="aem-row">
              <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="aem-input aem-media-select">
                <option value="none">Sin medio</option>
                <option value="image">Imagen (URL)</option>
                <option value="video">Vídeo (URL)</option>
              </select>
              <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://... (YouTube, imagen, etc.)" className="aem-input aem-media-url" />
            </div>
            {mediaType === "image" && mediaUrl && (
              <div className="aem-media-preview aem-media-image">
                <img src={mediaUrl} alt="Vista previa" />
              </div>
            )}
            {mediaType === "video" && mediaUrl && (
              <div className="aem-media-preview aem-media-video">
                <video src={mediaUrl} controls />
              </div>
            )}
          </div>

          <div className="aem-section">
            <label className="aem-label">Equipamiento (selecciona varios con Ctrl/Cmd)</label>
            <select multiple value={equipment} onChange={(e) => setEquipment(Array.from(e.target.selectedOptions, (o) => o.value))} className="aem-input aem-select-multiple">
              {DEFAULT_EQUIPMENT.map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          <div className="aem-row">
            <div style={{ flex: 1 }}>
              <label className="aem-label">Objetivo (puedes seleccionar varios)</label>
              <select multiple value={goal} onChange={(e) => setGoal(Array.from(e.target.selectedOptions, (o) => o.value))} className="aem-input aem-select-multiple">
                {DEFAULT_GOALS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="aem-col-220">
              <label className="aem-label">Zona principal</label>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="aem-input">
                <option value="">(ninguna)</option>
                {DEFAULT_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="aem-section">
            <label className="aem-label">Nivel</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="aem-input">
              <option value="inicial">Inicial</option>
              <option value="medio">Medio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          <div className="aem-actions">
            <button type="button" onClick={onClose} className="aem-btn aem-btn-cancel">Cancelar</button>
            <button type="submit" className="aem-btn aem-btn-save">Guardar ejercicio</button>
          </div>
        </form>
      </div>
    </div>
  );
}
