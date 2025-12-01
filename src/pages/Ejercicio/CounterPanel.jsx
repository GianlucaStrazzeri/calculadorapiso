// CounterPanel.jsx
import React from "react";
import { EXERCISE_TYPES } from "./exercisesConfig";
import "./ContadorReps.css";
import VideoPreview from "./VideoPreview";

export default function CounterPanel({
  selectedExercise,
  currentReps,
  targetReps,
  weightKg,
  seriesCount,
  onIncrement,
  onDecrement,
  onResetReps,
  onChangeTargetReps,
  onChangeWeight,
  onFinishSeries,
  onAddMultiple,
  onOpenTabata,
}) {
  const isWeighted = selectedExercise.type === EXERCISE_TYPES.WEIGHTED;

  return (
    <section className="cr-counter-panel">
      <div className="cr-counter-header">
        <div>
          <p className="cr-chip-label">Serie actual</p>
          <h2 className="cr-counter-exercise">
            <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 8 }}>
              {/* small video thumbnail preview if available */}
              <VideoPreview exercise={selectedExercise} size={"small"} />
            </span>
            {selectedExercise.label}
          </h2>
          <p className="cr-exercise-description">
            {selectedExercise.description}
          </p>
          <p className="cr-exercise-small-type">
            {isWeighted ? "Ejercicio con peso" : "Ejercicio de peso corporal"}
          </p>
        </div>
        <div className="cr-series-info">
          <span>Series completadas: </span>
          <strong>{seriesCount}</strong>
        </div>
      </div>

      {/* Peso (si aplica) */}
      {isWeighted && (
        <div className="cr-weight-row">
          <span>Peso utilizado (kg)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={weightKg}
            onChange={(e) => onChangeWeight(e.target.value)}
            className="cr-target-input"
            placeholder="Ej. 60"
          />
        </div>
      )}

      {/* NÚMERO CENTRAL */}
      <div className="cr-counter-center">
        <div
          className="cr-counter-circle"
          style={{
            borderColor: selectedExercise.color,
          }}
        >
          <span className="cr-reps-number">{currentReps}</span>
          <span className="cr-reps-label">repeticiones</span>
          <span className="cr-reps-target">
            objetivo: {targetReps}
          </span>
        </div>
      </div>

      {/* BOTONES PRINCIPALES */}
      <div className="cr-counter-buttons">
        <button
          type="button"
          onClick={onDecrement}
          className="cr-btn cr-btn-secondary"
        >
          –1
        </button>
        <button
          type="button"
          onClick={onIncrement}
          className="cr-btn cr-btn-primary"
          style={{
            backgroundColor: selectedExercise.color,
          }}
        >
          +1
        </button>
        <button
          type="button"
          onClick={onResetReps}
          className="cr-btn cr-btn-secondary"
        >
          Reset
        </button>
        {/* Botón para abrir TabataTrainer (si se proporciona handler) */}
        {onOpenTabata && (
          <button
            type="button"
            onClick={onOpenTabata}
            className="cr-btn cr-btn-secondary"
            title="Abrir Tabata"
            style={{ marginLeft: 6 }}
          >
            Tabata
          </button>
        )}
      </div>

      {/* Añadir N repeticiones a la vez */}
      <div className="cr-add-multiple-row">
        <input
          type="number"
          min={1}
          defaultValue={1}
          className="cr-add-input"
          aria-label="Añadir repeticiones"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = Number(e.currentTarget.value) || 0;
              if (val > 0 && onAddMultiple) onAddMultiple(val);
            }
          }}
        />
        <button
          type="button"
          className="cr-btn cr-btn-primary"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling;
            const val = Number(input?.value) || 0;
            if (val > 0 && onAddMultiple) onAddMultiple(val);
          }}
          style={{ backgroundColor: selectedExercise.color }}
        >
          + Añadir
        </button>
      </div>

      {/* FINALIZAR SERIE */}
      <button
        type="button"
        onClick={onFinishSeries}
        className="cr-btn cr-btn-full"
        style={{
          borderColor: selectedExercise.color,
        }}
      >
        ✔ Finalizar serie
      </button>

      {/* OBJETIVO DE REPS */}
      <div className="cr-target-row">
        <span>Objetivo de repeticiones por serie</span>
        <input
          type="number"
          min={1}
          value={targetReps}
          onChange={(e) =>
            onChangeTargetReps(
              Number(e.target.value) > 0 ? Number(e.target.value) : 1
            )
          }
          className="cr-target-input"
        />
      </div>
    </section>
  );
}
