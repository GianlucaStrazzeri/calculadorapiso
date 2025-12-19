import React, { useEffect, useState } from 'react';
import trainingStorage, { createSessionDraft } from './trainingStorage';
import { useLocation } from 'react-router-dom';
import SessionForm from './SessionForm';
import FeedbackForm from './FeedbackForm';
import TrainingCharts from '../../components/TrainingCharts';
import './TrainingPlanner.css';

export default function TrainingPlanner() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const clientFromQuery = search.get('clientId');
  const openSummaryParam = search.get('openSummary');
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showFeedbackFor, setShowFeedbackFor] = useState(null);
  const [showSummary, setShowSummary] = useState(Boolean(openSummaryParam));

  useEffect(() => {
    setSessions(trainingStorage.listSessions().sort((a,b)=>a.date.localeCompare(b.date)));
  }, []);

  function refresh() {
    setSessions(trainingStorage.listSessions().sort((a,b)=>a.date.localeCompare(b.date)));
  }

  function openNew() {
    const draft = clientFromQuery ? createSessionDraft({ clientId: clientFromQuery }) : createSessionDraft();
    setEditing(draft);
    setShowForm(true);
  }

  function openEdit(s) {
    setEditing(s);
    setShowForm(true);
  }

  function onSaved() {
    refresh();
  }

  function remove(id) {
    if (confirm('Eliminar sesión?')) {
      trainingStorage.removeSession(id);
      refresh();
    }
  }

  const upcoming = sessions.filter((s) => s.date >= new Date().toISOString().slice(0,10)).slice(0,60);

  return (
    <div className="tp-container" style={{ padding: 12 }}>
      <h2 className="tp-title">Planificador de entrenamientos</h2>
      <div className="tp-actions" style={{ marginBottom: 12 }}>
        <button className="tp-btn primary" onClick={openNew}>Crear sesión planificada</button>
        <button className="tp-btn" onClick={() => setShowSummary(true)} style={{ marginLeft: 8 }}>Resumen</button>
      </div>

      <div className="tp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        <div>
          <h3>Próximas sesiones</h3>
          {upcoming.length === 0 && <div className="tp-empty">No hay sesiones planificadas.</div>}
          {upcoming.map((s) => (
            <div key={s.id} className="tp-session-card">
              <div className="tp-session-top">
                <div>
                  <strong>{s.date}</strong>
                  <div className="tp-muted">{s.objectives}</div>
                </div>
                <div className="tp-controls">
                  <button className="tp-btn" onClick={() => openEdit(s)}>Editar</button>
                  <button className="tp-btn" onClick={() => setShowFeedbackFor(s.id)}>Feedback</button>
                    <button className="tp-btn" onClick={() => { const url = `${window.location.origin}/contadorreps/${encodeURIComponent(s.clientId)}?s=${encodeURIComponent(s.id)}`; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).catch(()=>{ alert('No se pudo copiar al portapapeles'); }); } else { const ta=document.createElement('textarea'); ta.value=url; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e){ } document.body.removeChild(ta); } alert('Enlace de sesión copiado'); }}>Copiar enlace</button>
                    <button className="tp-btn danger" onClick={() => remove(s.id)}>Eliminar</button>
                </div>
              </div>
              <div className="tp-session-meta">
                <div>Ejercicios: {(s.exercises || []).length}</div>
                <div>Carga esperada: {s.expectedLoad}</div>
                <div>Feedbacks: {(s.feedback || []).length}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary is now available via modal to keep the main view focused on sessions */}
      </div>

      {showForm && (
        <div className="tp-modal-overlay" onClick={(e)=>{ if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className="tp-modal-content">
            <SessionForm initial={editing} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); refresh(); }} />
          </div>
        </div>
      )}

      {showFeedbackFor && (
        <div className="tp-modal-overlay" onClick={(e)=>{ if(e.target===e.currentTarget) setShowFeedbackFor(null); }}>
          <div className="tp-modal-content small">
            <FeedbackForm sessionId={showFeedbackFor} onClose={() => setShowFeedbackFor(null)} onSaved={() => { refresh(); }} />
          </div>
        </div>
      )}

      {showSummary && (
        <div className="tp-modal-overlay" onClick={(e)=>{ if(e.target===e.currentTarget) setShowSummary(false); }}>
          <div className="tp-modal-content">
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Resumen</h3>
                <button className="tp-btn" onClick={() => setShowSummary(false)}>Cerrar</button>
              </div>
              <div className="tp-summary" style={{ marginTop: 8 }}>
                <div className="tp-stat">Sesiones guardadas: {sessions.length}</div>
                <div className="tp-stat">Sesiones próximas: {upcoming.length}</div>
              </div>
              <div className="tp-charts" style={{ marginTop: 12 }}>
                <h4>Visor rápido</h4>
                <TrainingCharts sessions={sessions} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
