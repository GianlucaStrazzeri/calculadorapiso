// AddExerciseModal.jsx
// Modal para añadir nuevos ejercicios (con imagen/vídeo opcional)

import React, { useState, useEffect } from "react";
import { EXERCISE_TYPES } from "./exercisesConfig";
import { DEFAULT_AREAS, DEFAULT_EQUIPMENT, DEFAULT_GOALS } from "./filtersConfig";

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

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9áéíóúüñ]+/gi, "_")
      .replace(/^_+|_+$/g, "");
  }

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
      // campos opcionales para medios
      mediaType: mediaType === "none" ? undefined : mediaType,
      mediaUrl: mediaType === "none" || !mediaUrl.trim() ? undefined : mediaUrl.trim(),
    };

    // attach optional metadata if present
    if (equipment && equipment.length > 0) newExercise.equipment = equipment;
    if (goal && goal.length > 0) newExercise.goal = goal;
    if (area) newExercise.area = area;
    if (level) newExercise.level = level;

    onAddExercise(newExercise);
  }

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.65)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "32px 12px",
    zIndex: 50,
  };

  const modalStyle = {
    width: "100%",
    maxWidth: 720,
    background: "#ffffff",
    borderRadius: 12,
    padding: "1rem 1.25rem",
    boxShadow: "0 20px 45px rgba(15,23,42,0.4)",
    color: "#0f172a",
    // make modal vertically scrollable when content exceeds viewport
    maxHeight: "calc(100vh - 64px)",
    overflowY: "auto",
  };

  const titleStyle = {
    fontSize: "1.1rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  };

  const labelStyle = {
    fontSize: "0.8rem",
    fontWeight: 600,
    marginBottom: 4,
    color: "#64748b",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.4rem 0.55rem",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: "0.85rem",
    marginBottom: 8,
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 60,
    resize: "vertical",
  };

  const rowStyle = {
    display: "flex",
    gap: 8,
    marginBottom: 8,
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={titleStyle}>Añadir nuevo ejercicio</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Nombre del ejercicio</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Sentadilla goblet a cajón"
              style={inputStyle}
            />
          </div>

          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={inputStyle}
              >
                <option value={EXERCISE_TYPES.BODYWEIGHT}>Peso corporal</option>
                <option value={EXERCISE_TYPES.WEIGHTED}>Con peso / máquina</option>
              </select>
            </div>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Emoji</label>
              <input
                type="text"
                maxLength={4}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: 0, height: 34 }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve explicación del objetivo, musculatura principal, etc."
              style={textareaStyle}
            />
          </div>

          <div style={{ marginTop: 4, marginBottom: 8 }}>
            <label style={labelStyle}>Imagen o vídeo de referencia (opcional)</label>
            <div style={rowStyle}>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                style={{ ...inputStyle, flex: 0.45 }}
              >
                <option value="none">Sin medio</option>
                <option value="image">Imagen (URL)</option>
                <option value="video">Vídeo (URL)</option>
              </select>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... (YouTube, imagen, etc.)"
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            {mediaType === "image" && mediaUrl && (
              <div style={{ marginBottom: 8 }}>
                <img
                  src={mediaUrl}
                  alt="Vista previa"
                  style={{ maxWidth: "100%", maxHeight: 140, borderRadius: 8 }}
                />
              </div>
            )}
            {mediaType === "video" && mediaUrl && (
              <div style={{ marginBottom: 8 }}>
                <video
                  src={mediaUrl}
                  controls
                  style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8 }}
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <label style={labelStyle}>Equipamiento (selecciona varios con Ctrl/Cmd)</label>
            <select
              multiple
              value={equipment}
              onChange={(e) => setEquipment(Array.from(e.target.selectedOptions, (o) => o.value))}
              style={{ ...inputStyle, height: 110 }}
            >
              {DEFAULT_EQUIPMENT.map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Objetivo (puedes seleccionar varios)</label>
              <select
                multiple
                value={goal}
                onChange={(e) => setGoal(Array.from(e.target.selectedOptions, (o) => o.value))}
                style={{ ...inputStyle, height: 110 }}
              >
                {DEFAULT_GOALS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div style={{ width: 220 }}>
              <label style={labelStyle}>Zona principal</label>
              <select value={area} onChange={(e) => setArea(e.target.value)} style={inputStyle}>
                <option value="">(ninguna)</option>
                {DEFAULT_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Nivel</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle}>
              <option value="inicial">Inicial</option>
              <option value="medio">Medio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: 999,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: 999,
                border: "none",
                background: "#22c55e",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Guardar ejercicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
