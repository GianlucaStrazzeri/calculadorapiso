// FeedbackForm.jsx
//
// Componente: FeedbackForm
// - Propósito: recoger feedback post-entrenamiento para una sesión concreta.
// - Props:
//    `sessionId` (string): id de la sesión a la que se asocia el feedback.
//    `onClose` (fn): callback al cancelar o cerrar el formulario.
//    `onSaved` (fn): callback que recibe el objeto de feedback tras guardarlo.
// - Comportamiento:
//    * Guarda el feedback en el almacenamiento del planner mediante
//      `trainingStorage.addFeedback(sessionId, feedback)`.
//    * Campos incluidos: dificultad percibida, RPE medio, carga estimada,
//      síntomas y notas libres.
// - Persistencia: `trainingStorage` administra la persistencia (localStorage).

import React, { useState } from 'react';
import trainingStorage from './trainingStorage';
import './FeedbackForm.css';

export default function FeedbackForm({ sessionId = null, onClose = () => {}, onSaved = () => {} }) {
  const [perceivedDifficulty, setPerceivedDifficulty] = useState(6);
  const [rpe, setRpe] = useState(7);
  const [actualLoad, setActualLoad] = useState(0);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  function save() {
    const fb = { perceivedDifficulty, rpe, actualLoad, symptoms, notes };
    if (sessionId) {
      trainingStorage.addFeedback(sessionId, fb);
    } else {
      // If no sessionId provided, don't persist to trainingStorage — just notify via onSaved.
      console.debug('Feedback (not persisted, no sessionId):', fb);
    }
    onSaved(fb);
    onClose();
  }

  return (
    <div className="ff-container">
      <h3 className="ff-title">Feedback post-entrenamiento</h3>

      <label className="ff-label">
        <span className="ff-label-text">¿Qué tal fue? (1-10)</span>
        <input className="ff-input" type="number" min={1} max={10} value={perceivedDifficulty} onChange={(e) => setPerceivedDifficulty(Number(e.target.value))} />
      </label>

      <label className="ff-label">
        <span className="ff-label-text">RPE medio</span>
        <input className="ff-input" type="number" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} />
      </label>

      <label className="ff-label">
        <span className="ff-label-text">Carga real total (estimada)</span>
        <input className="ff-input" type="number" value={actualLoad} onChange={(e) => setActualLoad(Number(e.target.value))} />
      </label>

      <label className="ff-label">
        <span className="ff-label-text">Síntomas / notas breves</span>
        <textarea className="ff-textarea" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} />
      </label>

      <label className="ff-label">
        <span className="ff-label-text">Notas adicionales</span>
        <textarea className="ff-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>

      <div className="ff-actions">
        <button className="ff-btn ff-btn-primary" onClick={save}>Guardar feedback</button>
        <button className="ff-btn" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
