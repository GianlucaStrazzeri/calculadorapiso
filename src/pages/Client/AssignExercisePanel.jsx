// AssignExercisePanel.jsx
import React, { useMemo, useState } from "react";
import "./AssignExercisePanel.css";
import VideoPreview from "../Ejercicio/VideoPreview";

export function AssignExercisePanel({
  selectedClientId,
  clients,
  exercises,
  exerciseAssignments,
  onCreateAssignment,
  onToggleActive,
  onSelectForSession,
}) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [targetSeries, setTargetSeries] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [nota, setNota] = useState("");

  const client = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const clientAssignments = useMemo(
    () =>
      exerciseAssignments.filter(
        (a) => a.clientId === selectedClientId
      ),
    [exerciseAssignments, selectedClientId]
  );

  if (!selectedClientId || !client) {
    return (
      <div className="cr-assign-panel">
        <h3>Asignación de ejercicios</h3>
        <p className="cr-muted">
          Selecciona un cliente para asignarle ejercicios específicos.
        </p>
      </div>
    );
  }

  const handleCreate = (e) => {
    e.preventDefault();
    if (!selectedExerciseId) return;

    const id = `asig_${Date.now()}`;

    onCreateAssignment({
      id,
      clientId: client.id,
      exerciseId: selectedExerciseId,
      targetReps: targetReps ? Number(targetReps) : null,
      targetSeries: targetSeries ? Number(targetSeries) : null,
      targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
      nota: nota.trim() || "",
      activo: true,
      createdAt: new Date().toISOString(),
    });

    setSelectedExerciseId("");
    setTargetReps("");
    setTargetSeries("");
    setTargetWeightKg("");
    setNota("");
  };

  const getExercise = (id) => exercises.find((e) => e.id === id);

  return (
    <div className="cr-assign-panel">
      <h3>Asignación de ejercicios a {client.nombre}</h3>

      <form className="cr-assign-form" onSubmit={handleCreate}>
        <label className="cr-field">
          <span>Ejercicio</span>
          <select
            className="cr-select"
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
          >
            <option value="">Selecciona un ejercicio</option>
            {exercises
              .filter((ex) => ex.videoUrl)
              .map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.label}
                </option>
              ))}
          </select>
        </label>

        <div className="cr-assign-row">
          <label className="cr-field">
            <span>Reps objetivo</span>
            <input
              type="number"
              min="1"
              className="cr-input"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="Ej. 8"
            />
          </label>

          <label className="cr-field">
            <span>Series objetivo</span>
            <input
              type="number"
              min="1"
              className="cr-input"
              value={targetSeries}
              onChange={(e) => setTargetSeries(e.target.value)}
              placeholder="Ej. 4"
            />
          </label>

          <label className="cr-field">
            <span>Peso (kg, opcional)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              className="cr-input"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
              placeholder="Ej. 60"
            />
          </label>
        </div>

        <label className="cr-field">
          <span>Nota (opcional)</span>
          <textarea
            className="cr-textarea"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Instrucciones específicas, tempo, dolor permitido, etc."
            rows={2}
          />
        </label>

        <div className="cr-assign-actions">
          <button type="submit" className="cr-btn cr-btn-primary">
            Asignar ejercicio
          </button>
        </div>
      </form>

      <div className="cr-assign-list">
        <h4>Ejercicios asignados</h4>
        {clientAssignments.length === 0 ? (
          <p className="cr-muted">
            Todavía no has asignado ejercicios a este cliente.
          </p>
        ) : (
          <ul>
            {clientAssignments.map((a) => {
              const ex = getExercise(a.exerciseId);
              return (
                <li key={a.id} className="cr-assign-item">
                  <div className="cr-assign-main">
                    <div className="cr-assign-title">
                      <strong>
                        {ex ? (
                          <VideoPreview exercise={ex} size={"small"} />
                        ) : (
                          ex?.emoji ? `${ex.emoji} ` : ""
                        )}
                        {ex?.label || a.exerciseId}
                      </strong>
                      {!a.activo && (
                        <span className="cr-badge cr-badge-muted">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="cr-assign-meta">
                      {a.targetSeries && (
                        <span>{a.targetSeries} series</span>
                      )}
                      {a.targetReps && (
                        <span>{a.targetReps} reps</span>
                      )}
                      {a.targetWeightKg != null && (
                        <span>{a.targetWeightKg} kg</span>
                      )}
                      {a.nota && <span>· {a.nota}</span>}
                    </div>
                  </div>
                  <div className="cr-assign-buttons">
                    <button
                      type="button"
                      className="cr-btn cr-btn-ghost"
                      onClick={() => onToggleActive(a.id)}
                    >
                      {a.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      className="cr-btn cr-btn-secondary"
                      onClick={() =>
                        onSelectForSession(a.exerciseId, {
                          targetReps: a.targetReps,
                          targetWeightKg: a.targetWeightKg,
                        })
                      }
                    >
                      Usar en sesión
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
