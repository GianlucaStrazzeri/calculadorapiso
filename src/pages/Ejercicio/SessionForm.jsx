import React, { useState } from 'react';
import trainingStorage, { createSessionDraft } from './trainingStorage';
import { EXERCISES as BASE_EXERCISES } from './exercisesConfig';
import './SessionForm.css';

export default function SessionForm({ initial = null, onClose = () => {}, onSave = () => {} }) {
  const draft = initial || createSessionDraft();
  const [session, setSession] = useState(draft);
  const [searchTerm, setSearchTerm] = useState('');
  const term = String(searchTerm || '').trim().toLowerCase();
  const filteredTemplates = term
    ? BASE_EXERCISES.filter((e) => {
        return (e.label || e.id || '').toLowerCase().includes(term) || (e.description || '').toLowerCase().includes(term);
      })
    : BASE_EXERCISES.slice();

  function update(field, val) {
    setSession((s) => ({ ...s, [field]: val }));
  }

  function save() {
    trainingStorage.saveSession(session);
    onSave(session);
    onClose();
  }

  function addExercise() {
    const ex = { name: '', muscleGroup: '', sets: 3, reps: 8, load: 0 };
    setSession((s) => ({ ...s, exercises: [...(s.exercises || []), ex] }));
  }

  function addExerciseFromTemplate(template) {
    if (!template) return;
    const ex = {
      exerciseId: template.id,
      name: template.label || template.id,
      muscleGroup: template.area || (template.goal && template.goal[0]) || '',
      sets: 3,
      reps: template.type === 'bodyweight' ? 12 : 8,
      load: template.type === 'weighted' ? 20 : 0,
    };
    setSession((s) => ({ ...s, exercises: [...(s.exercises || []), ex] }));
  }

  function updateExercise(i, field, value) {
    setSession((s) => {
      const exs = (s.exercises || []).slice();
      exs[i] = { ...exs[i], [field]: value };
      return { ...s, exercises: exs };
    });
  }

  function removeExercise(i) {
    setSession((s) => ({ ...s, exercises: (s.exercises || []).filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="sf-container">
      <h3 className="sf-title">{initial ? 'Editar sesión' : 'Crear sesión planificada'}</h3>

      <div className="sf-field">
        <label className="sf-label">Fecha</label>
        <input className="sf-input" type="date" value={session.date} onChange={(e) => update('date', e.target.value)} />
      </div>

      <div className="sf-field">
        <label className="sf-label">Objetivos (texto libre)</label>
        <textarea className="sf-textarea" value={session.objectives} onChange={(e) => update('objectives', e.target.value)} rows={3} />
      </div>

      <div className="sf-field">
        <label className="sf-label">Carga esperada (volume estimate)</label>
        <input className="sf-input" type="number" value={session.expectedLoad} onChange={(e) => update('expectedLoad', Number(e.target.value))} />
      </div>

      <div className="sf-exercises">
        <strong>Ejercicios</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: 180 }}>
            <input
              placeholder="Buscar ejercicio por nombre..."
              className="sf-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredTemplates.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #eee', maxHeight: 260, overflow: 'auto', marginTop: 6, borderRadius: 6 }}>
                {filteredTemplates.slice(0, 50).map((t) => (
                  <div key={t.id} style={{ padding: 8, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{t.description}</div>
                    </div>
                    <div>
                      <button className="sf-btn" onClick={() => { addExerciseFromTemplate(t); setSearchTerm(''); }}>Agregar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="sf-btn" onClick={addExercise}>Agregar vacío</button>
        </div>
        {(session.exercises || []).map((ex, i) => (
          <div key={i} className="sf-exercise-card">
            <input className="sf-input" placeholder="Nombre" value={ex.name} onChange={(e) => updateExercise(i, 'name', e.target.value)} />
            <input className="sf-input" placeholder="Músculo" value={ex.muscleGroup} onChange={(e) => updateExercise(i, 'muscleGroup', e.target.value)} />
            <input className="sf-input small" type="number" placeholder="sets" value={ex.sets} onChange={(e) => updateExercise(i, 'sets', Number(e.target.value))} />
            <input className="sf-input small" type="number" placeholder="reps" value={ex.reps} onChange={(e) => updateExercise(i, 'reps', Number(e.target.value))} />
            <input className="sf-input small" type="number" placeholder="load" value={ex.load} onChange={(e) => updateExercise(i, 'load', Number(e.target.value))} />
            <button className="sf-btn danger" onClick={() => removeExercise(i)}>Eliminar</button>
          </div>
        ))}
      </div>

      <div className="sf-field">
        <label className="sf-label">Notas</label>
        <textarea className="sf-textarea" value={session.notes} onChange={(e) => update('notes', e.target.value)} rows={2} />
      </div>

      <div className="sf-actions">
        <button className="sf-btn primary" onClick={save}>Guardar</button>
        <button className="sf-btn" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
