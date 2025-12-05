// ExerciseSelector.jsx
import React, { useState, useMemo } from "react";
import { EXERCISE_TYPES } from "./exercisesConfig";
import "./ContadorReps.css";
import VideoPreview from "./VideoPreview";
import ModalFiltroEjercicios from "./ModalFiltroEjercicios";
import { DEFAULT_AREAS, DEFAULT_EQUIPMENT, DEFAULT_GOALS } from "./filtersConfig";

export default function ExerciseSelector({
  exercises,
  selectedExercise,
  onChange,
  onOpenAddExercise,
  disableAdd = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [goalFilter, setGoalFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  // Always show the search panel (no quick access buttons)
  const [showSearchPanel] = useState(true);

  // derive filter options from exercises metadata (if present)
  const filterOptions = useMemo(() => {
    const eq = new Set();
    const goals = new Set();
    const areas = new Set();
    const levels = new Set();
    (exercises || []).forEach((ex) => {
      if (ex.equipment) {
        if (Array.isArray(ex.equipment)) ex.equipment.forEach((v) => eq.add(String(v)));
        else eq.add(String(ex.equipment));
      }
      if (ex.goal) {
        if (Array.isArray(ex.goal)) ex.goal.forEach((v) => goals.add(String(v)));
        else goals.add(String(ex.goal));
      }
      if (ex.area) areas.add(String(ex.area));
      if (ex.level) levels.add(String(ex.level));
    });
    return {
      equipment: Array.from(eq).sort(),
      goals: Array.from(goals).sort(),
      areas: Array.from(areas).sort(),
      levels: Array.from(levels).sort(),
    };
  }, [exercises]);

  // Merge derived options with defaults: use defaults when derived lists are empty
  const mergedOptions = React.useMemo(() => ({
    equipment: filterOptions.equipment && filterOptions.equipment.length > 0 ? filterOptions.equipment : DEFAULT_EQUIPMENT,
    goals: filterOptions.goals && filterOptions.goals.length > 0 ? filterOptions.goals : DEFAULT_GOALS,
    areas: filterOptions.areas && filterOptions.areas.length > 0 ? filterOptions.areas : DEFAULT_AREAS,
    levels: filterOptions.levels && filterOptions.levels.length > 0 ? filterOptions.levels : ["inicial", "medio", "avanzado"],
  }), [filterOptions]);

  const filteredExercises = useMemo(() => {
    const term = String(searchTerm || "").toLowerCase();
    return exercises.filter((ex) => {
      // search text
      const text = `${ex.label || ""} ${ex.id || ""}`.toLowerCase();
      if (term && !text.includes(term)) return false;

      // equipment filter
      if (equipmentFilter) {
        const eq = ex.equipment ? (Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment]) : [];
        if (!eq.map(String).map((s) => s.toLowerCase()).includes(equipmentFilter.toLowerCase())) return false;
      }

      // goal filter
      if (goalFilter) {
        const g = ex.goal ? (Array.isArray(ex.goal) ? ex.goal : [ex.goal]) : [];
        if (!g.map(String).map((s) => s.toLowerCase()).includes(goalFilter.toLowerCase())) return false;
      }

      // area filter
      if (areaFilter) {
        if (!ex.area || String(ex.area).toLowerCase() !== areaFilter.toLowerCase()) return false;
      }

      // level filter
      if (levelFilter) {
        if (!ex.level || String(ex.level).toLowerCase() !== levelFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [exercises, searchTerm, equipmentFilter, goalFilter, areaFilter, levelFilter]);

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
              <div className="cr-exercise-search-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  className="cr-exercise-search-input"
                  placeholder="Buscar ejercicio (nombre, tipo...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="cr-btn" onClick={() => setShowFiltersModal(true)} style={{ padding: '6px 10px' }} title="Abrir filtros">
                  Filtros
                </button>
              </div>

          {/* Filters moved to modal (open via button on the right of the search input) */}
          <ModalFiltroEjercicios
            isOpen={showFiltersModal}
            onClose={() => setShowFiltersModal(false)}
            filters={{ equipment: equipmentFilter, goal: goalFilter, area: areaFilter, level: levelFilter, searchTerm }}
            setFilters={(next) => {
              setEquipmentFilter(next.equipment || "");
              setGoalFilter(next.goal || "");
              setAreaFilter(next.area || "");
              setLevelFilter(next.level || "");
              if (typeof next.searchTerm === "string") setSearchTerm(next.searchTerm);
            }}
            options={mergedOptions}
          />

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
