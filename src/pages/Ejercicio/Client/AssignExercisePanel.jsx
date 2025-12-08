// AssignExercisePanel.jsx
import React, { useMemo, useState } from "react";
import "./AssignExercisePanel.css";
import VideoPreview from "../VideoPreview";
import FeedbackForm from "../FeedbackForm";

export function AssignExercisePanel({
  selectedClientId,
  clients,
  exercises,
  exerciseAssignments,
  onCreateAssignment,
  onToggleActive,
  onSelectForSession,
  onCompleteAssignment,
}) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [targetSeries, setTargetSeries] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [nota, setNota] = useState("");
  // batch (temp) to collect multiple assignments before persisting
  const [batch, setBatch] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

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

  const handleAddToBatch = (e) => {
    e.preventDefault();
    if (!selectedExerciseId) return;
    const item = {
      id: `batch_${Date.now()}_${Math.floor(Math.random()*999)}`,
      exerciseId: selectedExerciseId,
      targetReps: targetReps ? Number(targetReps) : null,
      targetSeries: targetSeries ? Number(targetSeries) : null,
      targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
      nota: nota.trim() || "",
    };
    setBatch((prev) => [...prev, item]);
    setSelectedExerciseId("");
    setTargetReps("");
    setTargetSeries("");
    setTargetWeightKg("");
    setNota("");
  };

  const handleAssignBatch = () => {
    if (!batch || batch.length === 0) return;
    batch.forEach((b) => {
      const id = `asig_${Date.now()}_${Math.floor(Math.random()*999)}`;
      onCreateAssignment({
        id,
        clientId: client.id,
        exerciseId: b.exerciseId,
        targetReps: b.targetReps,
        targetSeries: b.targetSeries,
        targetWeightKg: b.targetWeightKg,
        nota: b.nota,
        activo: true,
        createdAt: new Date().toISOString(),
      });
    });
    setBatch([]);
  };

  const handleRemoveBatch = (batchId) => {
    setBatch((prev) => prev.filter((b) => b.id !== batchId));
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

        <div className="cr-assign-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="cr-btn cr-btn-primary">
            Asignar ejercicio
          </button>
          <button type="button" className="cr-btn" onClick={handleAddToBatch}>
            ➕ Añadir a lote
          </button>
          <button type="button" className="cr-btn cr-btn-secondary" onClick={() => setShowFeedback(true)}>
            Feedback
          </button>
          {batch.length > 0 && (
            <button type="button" className="cr-btn cr-btn-primary" onClick={handleAssignBatch} style={{ marginLeft: 'auto' }}>
              Asignar lote ({batch.length})
            </button>
          )}
        </div>
      </form>

      <div className="cr-assign-list">
        <h4>Ejercicios asignados</h4>
        {/* Batch preview */}
        {batch.length > 0 && (
          <div className="cr-batch-list">
            <h5>Por asignar ({batch.length})</h5>
            <ul>
              {batch.map((b) => {
                const ex = getExercise(b.exerciseId) || { label: b.exerciseId };
                return (
                  <li key={b.id} className="cr-batch-item">
                    <div>
                      <strong>{ex.label}</strong>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {(b.targetSeries ? b.targetSeries + ' series · ' : '') + (b.targetReps ? b.targetReps + ' reps · ' : '') + (b.targetWeightKg != null ? b.targetWeightKg + ' kg' : '')}
                        {b.nota ? ` · ${b.nota}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="cr-btn cr-btn-ghost" onClick={() => handleRemoveBatch(b.id)}>Eliminar</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
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
                      onClick={() => onCompleteAssignment && onCompleteAssignment(a.id)}
                    >
                      Marcar completada
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
        {/* Feedback modal (opened from the Assign panel) */}
        {showFeedback && (
          <div className="cr-modal-backdrop" onClick={() => setShowFeedback(false)}>
            <div className="cr-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
              <div className="cr-modal-header">
                <h3>Feedback</h3>
                <button type="button" className="cr-modal-close" onClick={() => setShowFeedback(false)}>✕</button>
              </div>
              <div className="cr-modal-body">
                <FeedbackForm sessionId={null} onClose={() => setShowFeedback(false)} onSaved={() => { /* no-op for now */ }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
