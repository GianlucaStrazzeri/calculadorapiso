// ExerciseSelector.jsx
import React, { useState, useMemo } from "react";
import { EXERCISE_TYPES } from "./exercisesConfig";
import "./ContadorReps.css";
import VideoPreview from "./VideoPreview";

export default function ExerciseSelector({
  exercises,
  selectedExercise,
  onChange,
  onOpenAddExercise,
  disableAdd = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  // Always show the search panel (no quick access buttons)
  const [showSearchPanel] = useState(true);

  const filteredExercises = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return exercises.filter((ex) => {
      if (!term) return true;
      const text = `${ex.label} ${ex.id}`.toLowerCase();
      return text.includes(term);
    });
  }, [exercises, searchTerm]);

  return (
    <section>
      {/* Título + botón añadir */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <h2 className="cr-section-label" style={{ marginBottom: 0 }}>
          Ejercicio
        </h2>
        {!disableAdd && (
          <button
            type="button"
            onClick={onOpenAddExercise}
            className="cr-btn"
            style={{
              padding: "0.25rem 0.7rem",
              fontSize: "0.8rem",
              borderRadius: 999,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            ➕ Añadir ejercicio
          </button>
        )}
      </div>

      {/* Nota: se elimina el acceso rápido para usar solo búsqueda */}

      {/* Panel de búsqueda (scroll interno, para no alargar toda la página) */}
      {showSearchPanel && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#ffffff",
          }}
        >
          <div className="cr-exercise-search-row">
            <input
              type="text"
              className="cr-exercise-search-input"
              placeholder="Buscar ejercicio (nombre, tipo...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div
            style={{
              maxHeight: 230,
              overflowY: "auto",
            }}
          >
            <div className="cr-exercise-grid">
              {filteredExercises.map((ex) => {
                const isActive = ex.id === selectedExercise.id;
                const isWeighted =
                  ex.type === EXERCISE_TYPES.WEIGHTED;

                return (
                  <button
                    key={ex.id}
                    onClick={() => onChange(ex)}
                    className={
                      "cr-exercise-card" +
                      (isActive ? " cr-exercise-card--active" : "")
                    }
                    style={
                      isActive
                        ? { borderColor: ex.color }
                        : undefined
                    }
                  >
                    <VideoPreview exercise={ex} size="small" asButton={false} />
                    <div className="cr-exercise-text">
                      <span className="cr-exercise-name">
                        {ex.label}
                      </span>
                      <span className="cr-exercise-type-badge">
                        {isWeighted ? "Con peso" : "Peso corporal"}
                      </span>
                      {isActive && (
                        <span className="cr-exercise-selected">
                          Seleccionado
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
