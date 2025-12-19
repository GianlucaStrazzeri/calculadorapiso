import React, { useState, useEffect } from 'react';
import trainingStorage, { createSessionDraft } from './trainingStorage';
import { EXERCISES as BASE_EXERCISES } from './exercisesConfig';
import './SessionForm.css';

export default function SessionForm({ initial = null, onClose = () => {}, onSave = () => {} }) {
  const draft = initial || createSessionDraft();
  const [session, setSession] = useState(draft);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientsMap, setClientsMap] = useState({});
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cr_clients_v1');
      if (raw) {
        const arr = JSON.parse(raw);
        const map = (arr || []).reduce((acc, c) => { acc[c.id] = c.nombre || c.name || ''; return acc; }, {});
        setClientsMap(map);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="sf-container">
      <h3 className="sf-title">{initial ? 'Editar sesión' : 'Crear sesión planificada'}</h3>

      {session.clientId && (
        <div className="sf-field sf-client-info">
          <label className="sf-label">Paciente asignado</label>
          <div className="sf-client-name">{clientsMap[session.clientId] || session.clientId}</div>
        </div>
      )}

      <div className="sf-field">
        <label className="sf-label">Fecha</label>
        <input className="sf-input" type="date" value={session.date} onChange={(e) => update('date', e.target.value)} />
      </div>

          <div className="sf-field">
            <label className="sf-label">Repetición (cada N días, 0 = no repetir)</label>
            <input className="sf-input" type="number" min={0} value={session.repeatEveryDays || 0} onChange={(e) => update('repeatEveryDays', Number(e.target.value) || 0)} />
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
              <div style={{ background: 'var(--surface)', border: '1px solid var(--card-border)', maxHeight: 260, overflow: 'auto', marginTop: 6, borderRadius: 6 }}>
                {filteredTemplates.slice(0, 50).map((t, idx) => (
                  <div key={t.id} style={{ padding: 8, borderBottom: idx < filteredTemplates.length - 1 ? '1px solid var(--card-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{t.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.description}</div>
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
