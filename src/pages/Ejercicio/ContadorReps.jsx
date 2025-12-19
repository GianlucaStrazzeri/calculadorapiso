// ContadorReps.jsx
//
// Página principal del contador / planificador de entrenamiento.
// - Propósito: gestionar sesiones de repeticiones por ejercicio y mostrar
//   herramientas auxiliares (selector de ejercicios, temporizador, historial,
//   calendario de volumen, asignaciones a clientes, etc.).
// - Comportamiento clave:
//    * Permite seleccionar ejercicios (base + personalizados) y contar repeticiones.
//    * Mantiene un historial de series completadas (`sessionHistory`).
//    * Soporta asignaciones por cliente (localStorage key `cr_assignments_v1`) y
//      un selector de clientes (`cr_clients_v1`). Las asignaciones pueden marcarse
//      como completadas desde la UI y se registran en el historial.
//    * Incluye utilidades: modal para añadir ejercicios, Tabata, vista de historial
//      y un calendario de volumen.
// - Persistencia/localStorage:
//    `cr_state_v1`         : estado principal (usado por la app)
//    `cr_custom_exercises_v1`: ejercicios personalizados
//    `cr_clients_v1`        : lista de clientes
//    `cr_assignments_v1`    : asignaciones de ejercicios a clientes
// - Componentes relevantes usados aquí:
//    `ExerciseSelector`, `CounterPanel`, `TimerPanel`, `HistoryPanel`,
//    `VolumeCalendar`, `AddExerciseModal`, `AssignExercisePanel`, `ClientSelector`, `VideoPreview`.
//
// Notas:
// - La vista puede renderizarse en modo público para un `clientId` específico
//   cuando la ruta incluye `/contadorreps/:clientId`.
// - Para evitar problemas de parsing en JSX, la lógica compleja se calcula
//   fuera del return.

import React, { useState, useEffect, useRef } from "react";
import trainingStorage from './trainingStorage';
import { useParams, Link } from "react-router-dom";
import "./ContadorReps.css";
import { EXERCISES as BASE_EXERCISES } from "./exercisesConfig";
import ExerciseSelector from "./ExerciseSelector";
import TimerPanel from "./TimerPanel";
import CounterPanel from "./CounterPanel";
import HistoryPanel from "./HistoryPanel";
import VolumeCalendar from "./VolumeCalendar";
import AddExerciseModal from "./AddExerciseModal";
import TabataTrainer from "./TabataTrainer";
import TabataOverlay from "./TabataOverlay";
import VideoPreview from "./VideoPreview";
import { AddClientModal } from "./Client/AddClientModal";
import { AssignExercisePanel } from "./Client/AssignExercisePanel";
import { ClientSelector } from "./Client/ClientSelector";
import FeedbackForm from "./FeedbackForm";

const STORAGE_KEY = "cr_state_v1";
const CUSTOM_EXERCISES_KEY = "cr_custom_exercises_v1";
const DEFAULT_SECONDS = 30 * 60; // 30 minutos


export default function ContadorReps() {
  const [customExercises, setCustomExercises] = useState([]);
  const [assignedOpen, setAssignedOpen] = useState(true);
  const [showAssignmentDebug, setShowAssignmentDebug] = useState(false);
  const [showAssignmentsTable, setShowAssignmentsTable] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(
    BASE_EXERCISES.find((e) => e.videoUrl) || BASE_EXERCISES[0]
  );
  const [currentReps, setCurrentReps] = useState(0);
  const [targetReps, setTargetReps] = useState(10);
  const [weightKg, setWeightKg] = useState("");
  const [seriesCount, setSeriesCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Clientes y asignaciones (persistidas en localStorage)
  const CLIENTS_KEY = "cr_clients_v1";
  const ASSIGNMENTS_KEY = "cr_assignments_v1";
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [exerciseAssignments, setExerciseAssignments] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPublicFeedback, setShowPublicFeedback] = useState(false);

  // TIMER
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Modal
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTabataModal, setShowTabataModal] = useState(false);
  const [activeTabataConfig, setActiveTabataConfig] = useState(null);

  // Lista total de ejercicios (base + personalizados)
  // Mostrar todos los ejercicios; `VideoPreview` renderiza miniatura
  // solo cuando `videoUrl` (o `mediaUrl`) está presente.
  const allExercises = React.useMemo(
    () => [...BASE_EXERCISES, ...customExercises],
    [customExercises]
  );

  // =======================
  // Carga ejercicios personalizados
  // =======================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCustomExercises(parsed);
      }
    } catch (e) {
      console.warn("No se pudieron cargar ejercicios personalizados", e);
    }
  }, []);

  // Guardar ejercicios personalizados
  useEffect(() => {
    try {
      localStorage.setItem(
        CUSTOM_EXERCISES_KEY,
        JSON.stringify(customExercises)
      );
    } catch (e) {
      console.warn("No se pudieron guardar ejercicios personalizados", e);
    }
  }, [customExercises]);

  // Cargar clientes y asignaciones desde localStorage
  useEffect(() => {
    try {
      const rawClients = localStorage.getItem(CLIENTS_KEY);
      if (rawClients) {
        const parsed = JSON.parse(rawClients);
        if (Array.isArray(parsed)) setClients(parsed);
      }
    } catch (e) {
      console.warn("No se pudieron cargar clientes desde localStorage", e);
    }

    try {
      const rawAssign = localStorage.getItem(ASSIGNMENTS_KEY);
      if (rawAssign) {
        const parsed = JSON.parse(rawAssign);
        if (Array.isArray(parsed)) setExerciseAssignments(parsed);
      }
    } catch (e) {
      console.warn("No se pudieron cargar asignaciones desde localStorage", e);
    }
  }, []);

  // Persistir clientes
  useEffect(() => {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.warn("No se pudieron guardar clients", e);
    }
  }, [clients]);

  // Persistir asignaciones
  useEffect(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(exerciseAssignments));
    } catch (e) {
      console.warn("No se pudieron guardar asignaciones", e);
    }
  }, [exerciseAssignments]);

  // =======================
  // Carga del resto de estado desde localStorage
  // (espera a haber cargado customExercises)
  // =======================
  const hasLoadedStateRef = useRef(false);

  useEffect(() => {
    if (hasLoadedStateRef.current) return;
    hasLoadedStateRef.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      const all = [...BASE_EXERCISES, ...customExercises];

      if (parsed.selectedExerciseId) {
        const found = all.find(
          (e) => e.id === parsed.selectedExerciseId
        );
        if (found) setSelectedExercise(found);
      }

      if (typeof parsed.targetReps === "number")
        setTargetReps(parsed.targetReps);
      if (typeof parsed.seriesCount === "number")
        setSeriesCount(parsed.seriesCount);
      if (typeof parsed.timeLeft === "number")
        setTimeLeft(parsed.timeLeft);
      if (
        typeof parsed.weightKg === "number" ||
        typeof parsed.weightKg === "string"
      ) {
        setWeightKg(parsed.weightKg);
      }
      if (Array.isArray(parsed.sessionHistory)) {
        const hist = parsed.sessionHistory
          .map((h) => {
            const date = h.date ? new Date(h.date) : new Date();
            const reps = Number(h.reps) || 0;
            const weight = Number(h.weightKg) || 0;
            const volume =
              Number(h.volume) || weight * reps;
            return {
              ...h,
              date,
              reps,
              weightKg: weight,
              volume,
            };
          })
          .slice(0, 100);
        setSessionHistory(hist);
      }
    } catch (e) {
      console.warn("No se pudo cargar estado desde localStorage", e);
    }
  }, [customExercises]);

  // Guardar estado de sesión (historial, temporizador, etc.)
  useEffect(() => {
    try {
      const payload = {
        selectedExerciseId: selectedExercise?.id,
        targetReps,
        seriesCount,
        timeLeft,
        weightKg,
        sessionHistory: sessionHistory.map((h) => ({
          ...h,
          date:
            h.date instanceof Date
              ? h.date.toISOString()
              : String(h.date),
          reps: Number(h.reps) || 0,
          weightKg: Number(h.weightKg) || 0,
          volume:
            Number(h.volume) ||
            (Number(h.weightKg) || 0) *
              (Number(h.reps) || 0),
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("No se pudo guardar estado en localStorage", e);
    }
  }, [
    selectedExercise,
    targetReps,
    seriesCount,
    timeLeft,
    weightKg,
    sessionHistory,
  ]);

  // =======================
  // Lógica de contador
  // =======================

  const handleExerciseChange = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentReps(0);
    setSeriesCount(0);
    setWeightKg("");
  };

  // Añadir múltiples repeticiones a la vez
  const addMultipleReps = (n) => {
    const num = Number(n) || 0;
    if (num <= 0) return;
    setCurrentReps((prev) => prev + num);
  };

  const increment = () => setCurrentReps((prev) => prev + 1);
  const decrement = () =>
    setCurrentReps((prev) => (prev > 0 ? prev - 1 : 0));
  const resetReps = () => setCurrentReps(0);

  const handleFinishSeries = () => {
    if (currentReps === 0) return;

    const isWeighted = selectedExercise.type === "weighted";
    const numericWeight = isWeighted ? Number(weightKg) || 0 : 0;
    const volume = numericWeight * currentReps;

    const newEntry = {
      id: Date.now(),
      exerciseId: selectedExercise.id,
      exerciseLabel: selectedExercise.label,
      reps: currentReps,
      weightKg: numericWeight,
      volume,
      // Attach clientId if one is selected so we can compute per-patient volumes
      clientId: selectedClientId || null,
      date: new Date(),
    };

    setSessionHistory((prev) => [newEntry, ...prev].slice(0, 100));
    setSeriesCount((prev) => prev + 1);
    setCurrentReps(0);
  };

  // =======================
  // Temporizador
  // =======================
  useEffect(() => {
    if (timerRunning && timerRef.current == null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setTimerRunning(false);
            playBeep();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning]);

  function startTimer() {
    if (timeLeft <= 0) setTimeLeft(DEFAULT_SECONDS);
    setTimerRunning(true);
  }

  function pauseTimer() {
    setTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetTimer() {
    pauseTimer();
    setTimeLeft(DEFAULT_SECONDS);
  }

  function playBeep() {
    try {
      if (!audioCtxRef.current) {
        const AudioContext =
          window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      o.stop(now + 1.05);
    } catch (e) {
      console.warn("No se pudo reproducir beep via WebAudio", e);
    }
  }

  // =======================
  // Totales por ejercicio
  // =======================

  // Read route params (declared once)
  const params = useParams();

  useEffect(() => {
    if (params && params.clientId) {
      try {
        const id = decodeURIComponent(params.clientId);
        setSelectedClientId(id);
      } catch (e) {
        setSelectedClientId(params.clientId);
      }
    }
  }, [params]);

  const isPatientPublicView = Boolean(params && params.clientId);

  // Precompute client assignments for the selected client (avoid IIFE in JSX)
  const clientAssignmentsForSelected = React.useMemo(() => {
    if (!selectedClientId) return [];
    return exerciseAssignments.filter((a) => a.clientId === selectedClientId);
  }, [exerciseAssignments, selectedClientId]);

  // Sessions planned for this client (from Training Planner)
  const clientPlannedSessions = React.useMemo(() => {
    if (!selectedClientId) return [];
    try {
      return trainingStorage.listSessions().filter((s) => String(s.clientId) === String(selectedClientId));
    } catch (e) {
      return [];
    }
  }, [selectedClientId]);

  // Determine which exercise should be shown in the CounterPanel when in public patient view.
  // Prefer the first active assigned exercise, otherwise fallback to the first assignment.
  const assignedExerciseForCounter = React.useMemo(() => {
    if (!isPatientPublicView) return selectedExercise;
    if (!clientAssignmentsForSelected || clientAssignmentsForSelected.length === 0) return selectedExercise;
    const pick = clientAssignmentsForSelected.find((a) => a.activo) || clientAssignmentsForSelected[0];
    const ex = [...BASE_EXERCISES, ...customExercises].find((e) => e.id === pick.exerciseId);
    return ex || selectedExercise;
  }, [isPatientPublicView, clientAssignmentsForSelected, BASE_EXERCISES, customExercises, selectedExercise]);

  // When viewing a specific client, compute totals only for that client's history
  const totalsByExercise = React.useMemo(() => {
    const map = {};
    allExercises.forEach((ex) => {
      map[ex.id] = {
        id: ex.id,
        label: ex.label,
        color: ex.color,
        reps: 0,
        series: 0,
        totalVolume: 0,
      };
    });

    const viewingClientId = params?.clientId || selectedClientId;
    const filtered = viewingClientId
      ? sessionHistory.filter((h) => h.clientId === viewingClientId)
      : sessionHistory;

    filtered.forEach((h) => {
      const key = h.exerciseId;
      if (!map[key]) return;
      const reps = Number(h.reps) || 0;
      const volume = Number(h.volume) || (Number(h.weightKg) || 0) * reps;
      map[key].reps += reps;
      map[key].series += 1;
      map[key].totalVolume += volume;
    });
    return Object.values(map);
  }, [sessionHistory, allExercises, params, selectedClientId]);

  // =======================
  // Ejercicios personalizados: añadir desde modal
  // =======================
  function handleAddCustomExercise(newExercise) {
    setCustomExercises((prev) => {
      const exists = prev.some((e) => e.id === newExercise.id);
      const updated = exists
        ? prev.map((e) =>
            e.id === newExercise.id ? newExercise : e
          )
        : [...prev, newExercise];
      return updated;
    });
    setSelectedExercise(newExercise);
    setShowAddExerciseModal(false);
  }

  function clearLocalData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("No se pudo borrar localStorage", e);
    }
    setSessionHistory([]);
    setSeriesCount(0);
    setTargetReps(10);
    setSelectedExercise(BASE_EXERCISES[0]);
    setWeightKg("");
    resetTimer();
  }

  return (
    <>
      <div className="cr-container">
        {/* HEADER: ocultar si es vista pública del paciente */}
        {!isPatientPublicView && (
          <header className="cr-header">
            <h1 className="cr-title">Planificador de entrenamiento</h1>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button
                type="button"
                onClick={clearLocalData}
                style={{
                  padding: "2px 2px",
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#374151",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Borrar datos locales
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClientSelector
                  clients={clients}
                    selectedClientId={selectedClientId}
                    onChangeClient={(id) => {
                      if (isPatientPublicView) return; // prevent changes in public patient view
                      setSelectedClientId(id);
                    }}
                    onOpenAddClient={() => {
                      if (isPatientPublicView) return;
                      setShowAddClientModal(true);
                    }}
                    disableAdd={isPatientPublicView}
                    fixedClientId={isPatientPublicView ? selectedClientId : null}
                    onOpenAssign={() => setShowAssignModal(true)}
                />
                  {isPatientPublicView && selectedClientId && (
                    <button
                      type="button"
                      onClick={() => setShowAssignmentsTable(true)}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Ver asignaciones
                    </button>
                  )}
                {selectedClientId && (
                  <Link
                    to={`/training-planner?clientId=${encodeURIComponent(selectedClientId)}`}
                    className="cr-btn"
                    style={{ borderRadius: 999, padding: "6px 10px", fontSize: "0.95rem", textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                    title="Abrir planificador para este cliente"
                  >
                    📅 Planificador
                  </Link>
                )}
                {selectedClientId && (
                  <Link
                    to={`/training-planner?clientId=${encodeURIComponent(selectedClientId)}&openSummary=1`}
                    className="cr-btn"
                    style={{ borderRadius: 999, padding: "6px 10px", fontSize: "0.85rem", textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginLeft: 8 }}
                    title="Resumen del planificador para este cliente"
                  >
                    Resumen
                  </Link>
                )}
              </div>
            </div>
          </header>
        )}
        {/* Public feedback modal (opened from the assigned work header) */}
        {showPublicFeedback && (
          <div className="cr-modal-backdrop" onClick={() => setShowPublicFeedback(false)}>
            <div className="cr-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
              <div className="cr-modal-header">
                <h3>Feedback</h3>
                <button type="button" className="cr-modal-close" onClick={() => setShowPublicFeedback(false)}>✕</button>
              </div>
              <div className="cr-modal-body">
                <FeedbackForm sessionId={null} onClose={() => setShowPublicFeedback(false)} onSaved={() => { /* no-op */ }} />
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT PRINCIPAL */}
        <div className="cr-layout">
          {/* COLUMNA IZQUIERDA */}
          <div className="cr-left-column">
            {/* Calendario de volumen movido arriba */}
            {/* In public patient view we hide the full exercise grid and calendar
                to expose only the assigned work and counter panel. */}
            {!isPatientPublicView && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <VolumeCalendar sessionHistory={sessionHistory} />
                </div>

                <ExerciseSelector
                  exercises={allExercises}
                  selectedExercise={selectedExercise}
                  onChange={handleExerciseChange}
                  onOpenAddExercise={() => setShowAddExerciseModal(true)}
                  disableAdd={isPatientPublicView}
                />
              </>
            )}

            {/* Show assignments for the selected client when viewing their page */}
            {isPatientPublicView && selectedClientId && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>Trabajo asignado</h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="cr-btn" onClick={() => setShowPublicFeedback(true)}>Feedback</button>
                    <button className="cr-btn" onClick={() => setAssignedOpen((s) => !s)}>{assignedOpen ? 'Ocultar' : 'Mostrar'}</button>
                  </div>
                </div>
                {assignedOpen && (
                  <div style={{ padding: 12, background: '#fff', border: '1px solid #e6eef8', borderRadius: 8 }}>
                    {clientAssignmentsForSelected.length === 0 ? (
                      <div style={{ color: '#6b7280' }}>No hay asignaciones para este cliente.</div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {clientAssignmentsForSelected.map((a) => {
                          const ex = [...BASE_EXERCISES, ...customExercises].find((e) => e.id === a.exerciseId) || null;
                          return (
                            <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {ex ? <VideoPreview exercise={ex} size={'small'} asButton={false} /> : null}
                                <div>
                                  <div style={{ fontWeight: 700 }}>{ex?.label || a.exerciseId}</div>
                                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                                    {a.targetSeries ? `${a.targetSeries} series · ` : ''}{a.targetReps ? `${a.targetReps} reps · ` : ''}{a.targetWeightKg ? ` ${a.targetWeightKg} kg` : ''}
                                    {a.nota ? ` · ${a.nota}` : ''}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="cr-btn" onClick={() => {
                                  if (!ex) return;
                                  setSelectedExercise(ex);
                                  if (a.targetReps != null) setTargetReps(a.targetReps);
                                  if (a.targetWeightKg != null) setWeightKg(a.targetWeightKg);
                                }}>Usar</button>
                                <button className="cr-btn" onClick={() => {
                                  // marcar completada: mimic AssignExercisePanel behaviour
                                  const assignmentId = a.id;
                                  const clientIdForEntry = a.clientId || selectedClientId || null;
                                  const reps = a.targetReps || 0;
                                  const series = a.targetSeries || 1;
                                  const weight = a.targetWeightKg != null ? Number(a.targetWeightKg) : 0;
                                  const newEntries = Array.from({ length: Math.max(1, series) }).map(() => ({
                                    id: Date.now() + Math.floor(Math.random() * 1000),
                                    exerciseId: a.exerciseId,
                                    exerciseLabel: (allExercises.find((e) => e.id === a.exerciseId) || {}).label || a.exerciseId,
                                    reps,
                                    weightKg: weight,
                                    volume: (weight || 0) * reps,
                                    clientId: clientIdForEntry,
                                    date: new Date(),
                                  }));
                                  setSessionHistory((prev) => [...newEntries, ...prev].slice(0, 100));
                                  setSeriesCount((prev) => prev + Math.max(1, series));
                                  setExerciseAssignments((prev) => {
                                    const updated = prev.map((x) => (x.id === assignmentId ? { ...x, activo: false } : x));
                                    try { localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(updated)); } catch (e) { console.warn('No se pudo guardar asignaciones', e); }
                                    return updated;
                                  });
                                }}>Marcar completada</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {/* Debug: raw assignments JSON for the selected client */}
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <button className="cr-btn" onClick={() => setShowAssignmentDebug((s) => !s)}>{showAssignmentDebug ? 'Ocultar debug' : 'Mostrar debug asignaciones'}</button>
                  {showAssignmentDebug && (
                    <pre style={{ marginTop: 8, padding: 8, background: '#0f1724', color: '#e6eef8', borderRadius: 6, maxHeight: 240, overflow: 'auto' }}>
                      {JSON.stringify(clientAssignmentsForSelected, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
            {/* Mostrar sesiones planificadas del cliente (Training Planner) */}
            {isPatientPublicView && selectedClientId && (
              <div style={{ marginTop: 12 }}>
                <h4 style={{ marginTop: 0 }}>Sesiones planificadas</h4>
                {clientPlannedSessions.length === 0 ? (
                  <div style={{ color: '#6b7280' }}>No hay sesiones planificadas para este cliente.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {clientPlannedSessions.map((s) => (
                      <div key={s.id} style={{ padding: 10, background: '#fff', border: '1px solid #f3f4f6', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{s.date}</strong>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{s.objectives}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="cr-btn" onClick={() => {
                              // importar ejercicios de la sesión al historial (no persiste en planner)
                              if (!s.exercises || s.exercises.length === 0) return;
                              const entries = s.exercises.map((ex) => ({
                                id: Date.now() + Math.floor(Math.random()*1000),
                                exerciseId: ex.exerciseId || ex.name || 'custom',
                                exerciseLabel: ex.name || (([...BASE_EXERCISES, ...customExercises].find(e=>e.id===ex.exerciseId)||{}).label) || ex.exerciseId || ex.name,
                                reps: ex.reps || ex.sets || 0,
                                weightKg: ex.load || 0,
                                volume: (ex.load || 0) * (ex.reps || ex.sets || 0),
                                clientId: selectedClientId,
                                date: new Date(),
                              }));
                              setSessionHistory((prev) => [...entries, ...prev].slice(0,100));
                            }}>Importar ejercicios</button>
                          </div>
                        </div>
                        {s.exercises && s.exercises.length > 0 ? (
                          <ul style={{ marginTop: 8 }}>
                                {s.exercises.map((ex, i) => {
                                  const exData = ([...BASE_EXERCISES, ...customExercises].find(e => e.id === ex.exerciseId) || null);
                                  return (
                                    <li key={i} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                      {exData ? (
                                        <VideoPreview exercise={exData} size={'small'} asButton={true} />
                                      ) : (
                                        <div style={{ width: 64, height: 40, background: '#f3f4f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ex.name || '—'}</div>
                                      )}
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>{exData?.label || ex.name || ex.exerciseId}</div>
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{ex.sets ? `${ex.sets} sets · ` : ''}{ex.reps ? `${ex.reps} reps · ` : ''}{ex.load != null ? ex.load + ' kg' : ''}</div>
                                      </div>
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="cr-btn" onClick={() => {
                                          if (!exData) return;
                                          setSelectedExercise(exData);
                                          if (ex.reps != null && ex.reps > 0) setTargetReps(ex.reps);
                                          if (ex.load != null) setWeightKg(ex.load);
                                        }}>Usar</button>
                                      </div>
                                    </li>
                                  );
                                })}
                          </ul>
                        ) : (
                          <div style={{ marginTop: 8, color: '#9ca3af' }}>Sin ejercicios en esta sesión.</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        {showAssignmentsTable && (
          <div className="cr-modal-backdrop" onClick={() => setShowAssignmentsTable(false)}>
            <div className="cr-modal" style={{ maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
              <div className="cr-modal-header">
                <h3>Asignaciones y realizaciones de {(() => {
                  const c = clients.find((x) => x.id === selectedClientId);
                  return c ? c.nombre : selectedClientId;
                })()}</h3>
                <button type="button" className="cr-modal-close" onClick={() => setShowAssignmentsTable(false)}>✕</button>
              </div>
              <div className="cr-modal-body">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: 8 }}>Ejercicio</th>
                      <th style={{ padding: 8 }}>Asignación (series × reps × kg)</th>
                      <th style={{ padding: 8 }}>Estado</th>
                      <th style={{ padding: 8 }}>Realizaciones (fecha / hora)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exerciseAssignments.filter((a) => a.clientId === selectedClientId).map((a) => {
                      const ex = [...BASE_EXERCISES, ...customExercises].find((e) => e.id === a.exerciseId) || { label: a.exerciseId };
                      const completions = sessionHistory.filter((h) => (h.clientId || null) === selectedClientId && h.exerciseId === a.exerciseId);
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: 8, verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 700 }}>{ex.label}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{a.nota}</div>
                          </td>
                          <td style={{ padding: 8, verticalAlign: 'top' }}>{(a.targetSeries || '-') + ' × ' + (a.targetReps || '-') + ' × ' + (a.targetWeightKg != null ? a.targetWeightKg + 'kg' : '-')}</td>
                          <td style={{ padding: 8, verticalAlign: 'top' }}>{a.activo ? 'Activo' : 'Completada / Inactiva'}</td>
                          <td style={{ padding: 8, verticalAlign: 'top' }}>
                            {completions.length === 0 ? (
                              <span style={{ color: '#9ca3af' }}>Sin registros</span>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: 14 }}>
                                {completions.map((c) => (
                                  <li key={c.id} style={{ marginBottom: 4 }}>{(c.date instanceof Date) ? c.date.toLocaleString() : new Date(c.date).toLocaleString()}</li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

            

            {isPatientPublicView && (
              <CounterPanel
                selectedExercise={assignedExerciseForCounter}
                currentReps={currentReps}
                targetReps={targetReps}
                weightKg={weightKg}
                seriesCount={seriesCount}
                onIncrement={increment}
                onDecrement={decrement}
                onResetReps={resetReps}
                onChangeTargetReps={setTargetReps}
                onChangeWeight={setWeightKg}
                onFinishSeries={handleFinishSeries}
                onAddMultiple={addMultipleReps}
                onOpenTabata={() => setShowTabataModal(true)}
              />
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div style={{ width: showHistory ? 360 : 260 }}>
            {/* Contador de series a la derecha (también) */}
            <div style={{ marginBottom: 10 }}>
              <div className="cr-series-card">
                <div className="cr-series-card-label">Series completadas</div>
                <div className="cr-series-card-value">{seriesCount}</div>
              </div>
            </div>

            {/* Temporizador colocado a la derecha */}
            <div style={{ marginBottom: 10 }}>
              <TimerPanel
                timeLeft={timeLeft}
                timerRunning={timerRunning}
                onStart={startTimer}
                onPause={pauseTimer}
                onReset={resetTimer}
              />
            </div>

            {showHistory ? (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button
                    type="button"
                    className="cr-btn"
                    onClick={() => setShowHistory(false)}
                    style={{ borderRadius: 999, padding: "6px 10px", fontSize: "0.85rem", background: "#fff", border: "1px solid #e5e7eb" }}
                  >
                    Ocultar historial
                  </button>
                </div>
                <HistoryPanel
                  sessionHistory={sessionHistory}
                  totalsByExercise={totalsByExercise}
                  exercises={allExercises}
                />
              </div>
            ) : (
              <aside className="cr-history-panel cr-history-compact">
                <h2 className="cr-section-label">Historial</h2>
                <p className="cr-history-description">
                  Pulsa el botón "Historial volúmenes" para abrirlo.
                </p>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="cr-btn"
                    onClick={() => setShowHistory(true)}
                    style={{ borderRadius: 999, padding: "6px 10px", fontSize: "0.85rem", background: "#fff", border: "1px solid #e5e7eb" }}
                  >
                    Historial volúmenes
                  </button>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PARA AÑADIR EJERCICIOS */}
      {/* Modal para Tabata Trainer */}
      {showTabataModal && (
        <div className="cr-modal-backdrop">
          <div className="cr-modal" style={{ maxWidth: 820 }}>
            <div className="cr-modal-header">
              <h3>Tabata Trainer</h3>
              <button type="button" className="cr-modal-close" onClick={() => setShowTabataModal(false)}>✕</button>
            </div>
            <div className="cr-modal-body">
              <TabataTrainer
                onStart={(config) => {
                  // start an active tabata session overlay
                  setActiveTabataConfig(config);
                  setShowTabataModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Overlay running Tabata */}
      {activeTabataConfig && (
        <TabataOverlay
          config={activeTabataConfig}
          onCancel={() => setActiveTabataConfig(null)}
          onFinish={() => setActiveTabataConfig(null)}
        />
      )}

      <AddExerciseModal
        isOpen={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onAddExercise={handleAddCustomExercise}
      />

      {/* Modal para añadir clientes */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onAddClient={(newClient) => {
          setClients((prev) => {
            const updated = [...prev, newClient];
            try {
              localStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
            } catch (e) {
              console.warn("No se pudo guardar cliente", e);
            }
            return updated;
          });
          setSelectedClientId(newClient.id);
          setShowAddClientModal(false);
        }}
      />

      {/* Modal para asignar ejercicios a cliente */}
      {showAssignModal && (
        <div className="cr-modal-backdrop">
          <div className="cr-modal" style={{ maxWidth: 760 }}>
            <div className="cr-modal-header">
              <h3>Asignar ejercicio</h3>
              <button type="button" className="cr-modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>
            <div className="cr-modal-body">
              <AssignExercisePanel
                selectedClientId={selectedClientId}
                clients={clients}
                exercises={allExercises}
                exerciseAssignments={exerciseAssignments}
                onCreateAssignment={(assignment) => {
                  setExerciseAssignments((prev) => {
                    const updated = [...prev, assignment];
                    try {
                      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(updated));
                    } catch (e) {
                      console.warn("No se pudo guardar asignación", e);
                    }
                    return updated;
                  });
                  setShowAssignModal(false);
                }}
                onToggleActive={(assignmentId) => {
                  setExerciseAssignments((prev) => {
                    const updated = prev.map((a) =>
                      a.id === assignmentId ? { ...a, activo: !a.activo } : a
                    );
                    try {
                      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(updated));
                    } catch (e) {
                      console.warn("No se pudo guardar asignaciones", e);
                    }
                    return updated;
                  });
                }}
                onSelectForSession={(exerciseId, opts = {}) => {
                  const exercise = allExercises.find((e) => e.id === exerciseId);
                  if (!exercise) return;
                  setSelectedExercise(exercise);
                  if (opts.targetReps != null) setTargetReps(opts.targetReps);
                  if (opts.targetWeightKg != null) setWeightKg(opts.targetWeightKg);
                  setShowAssignModal(false);
                }}
                onCompleteAssignment={(assignmentId) => {
                  const a = exerciseAssignments.find((x) => x.id === assignmentId);
                  if (!a) return;
                  // determine client for the assignment
                  const clientIdForEntry = a.clientId || selectedClientId || null;
                  const reps = a.targetReps || 0;
                  const series = a.targetSeries || 1;
                  const weight = a.targetWeightKg != null ? Number(a.targetWeightKg) : 0;

                  // create one entry per series (mirror handleFinishSeries behavior)
                  const newEntries = Array.from({ length: Math.max(1, series) }).map(() => ({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    exerciseId: a.exerciseId,
                    exerciseLabel: (allExercises.find((e) => e.id === a.exerciseId) || {}).label || a.exerciseId,
                    reps,
                    weightKg: weight,
                    volume: (weight || 0) * reps,
                    clientId: clientIdForEntry,
                    date: new Date(),
                  }));

                  setSessionHistory((prev) => {
                    const updated = [...newEntries, ...prev].slice(0, 100);
                    return updated;
                  });

                  // increment seriesCount by the number of series
                  setSeriesCount((prev) => prev + Math.max(1, series));

                  // mark assignment inactive and persist
                  setExerciseAssignments((prev) => {
                    const updated = prev.map((x) => (x.id === assignmentId ? { ...x, activo: false } : x));
                    try {
                      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(updated));
                    } catch (e) {
                      console.warn("No se pudo guardar asignaciones", e);
                    }
                    return updated;
                  });

                  setShowAssignModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
