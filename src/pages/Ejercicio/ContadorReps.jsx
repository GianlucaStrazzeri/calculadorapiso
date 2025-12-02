// ContadorReps.jsx - Contador de repeticiones con peso y calendario de volumen
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
import { AddClientModal } from "../Client/AddClientModal";
import { AssignExercisePanel } from "../Client/AssignExercisePanel";
import { ClientSelector } from "../Client/ClientSelector";

const STORAGE_KEY = "cr_state_v1";
const CUSTOM_EXERCISES_KEY = "cr_custom_exercises_v1";
const DEFAULT_SECONDS = 30 * 60; // 30 minutos


export default function ContadorReps() {
  const [customExercises, setCustomExercises] = useState([]);
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
  const allExercises = React.useMemo(
    () => [...BASE_EXERCISES, ...customExercises].filter((e) => !!e.videoUrl),
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
            <h1 className="cr-title">Contador de Repeticiones</h1>
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
                />
                {selectedClientId && (
                  <button
                    type="button"
                    className="cr-btn"
                    onClick={() => setShowAssignModal(true)}
                    style={{ borderRadius: 999, padding: "6px 8px", fontSize: "0.95rem" }}
                    title="Asignar ejercicio al cliente"
                  >
                    ➕
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* LAYOUT PRINCIPAL */}
        <div className="cr-layout">
          {/* COLUMNA IZQUIERDA */}
          <div className="cr-left-column">
            {/* Calendario de volumen movido arriba */}
            <div style={{ marginBottom: 12 }}>
              {/* If viewing a public patient, show only that patient's history in the calendar */}
              {isPatientPublicView ? (
                <VolumeCalendar sessionHistory={sessionHistory.filter((h) => h.clientId === selectedClientId)} />
              ) : (
                <VolumeCalendar sessionHistory={sessionHistory} />
              )}

            </div>

            <ExerciseSelector
              exercises={allExercises}
              selectedExercise={selectedExercise}
              onChange={handleExerciseChange}
              onOpenAddExercise={() => setShowAddExerciseModal(true)}
              disableAdd={isPatientPublicView}
            />

            

            <CounterPanel
              selectedExercise={selectedExercise}
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
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
