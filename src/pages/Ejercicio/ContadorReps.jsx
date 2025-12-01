// ContadorReps.jsx - Componente para contar repeticiones de ejercicios (flexiones, fondos y dominadas)

import React, { useState, useEffect, useRef } from "react";
import "./ContadorReps.css";

const EXERCISES = [
  {
    id: "flexiones",
    label: "Flexiones",
    emoji: "🤸",
    color: "#2563eb", // azul
  },
  {
    id: "fondos",
    label: "Fondos",
    emoji: "📥",
    color: "#f97316", // naranja
  },
  {
    id: "dominadas",
    label: "Dominadas",
    emoji: "🪜",
    color: "#22c55e", // verde
  },
];

export default function ContadorReps() {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [currentReps, setCurrentReps] = useState(0);
  const [targetReps, setTargetReps] = useState(10);
  const [seriesCount, setSeriesCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);

  const handleExerciseChange = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentReps(0);
    setSeriesCount(0);
  };

  const increment = () => setCurrentReps((prev) => prev + 1);
  const decrement = () =>
    setCurrentReps((prev) => (prev > 0 ? prev - 1 : 0));
  const resetReps = () => setCurrentReps(0);

  const handleFinishSeries = () => {
    if (currentReps === 0) return;

    const newEntry = {
      id: Date.now(),
      exerciseId: selectedExercise.id,
      exerciseLabel: selectedExercise.label,
      reps: currentReps,
      date: new Date(),
    };

    setSessionHistory((prev) => [newEntry, ...prev].slice(0, 15));
    setSeriesCount((prev) => prev + 1);
    setCurrentReps(0);
  };

  const formattedTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formattedDate = (date) =>
    date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
    });

  // --- TIMER: 30 minutos con alarma sonora ---
  const DEFAULT_SECONDS = 30 * 60; // 30 minutes
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (timerRunning && timerRef.current == null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setTimerRunning(false);
            // play beep
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880; // A5
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      o.stop(now + 1.05);
    } catch (e) {
      // Fallback: try HTML5 audio (if any)
      console.warn("No se pudo reproducir beep via WebAudio", e);
    }
  }

  const formattedTimer = (s) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Totales por tipo de ejercicio (suma de reps y series registradas)
  const totalsByExercise = React.useMemo(() => {
    const map = {};
    EXERCISES.forEach((ex) => {
      map[ex.id] = { id: ex.id, label: ex.label, color: ex.color, reps: 0, series: 0 };
    });
    sessionHistory.forEach((h) => {
      if (!map[h.exerciseId]) return;
      map[h.exerciseId].reps += Number(h.reps) || 0;
      map[h.exerciseId].series += 1;
    });
    return Object.values(map);
  }, [sessionHistory]);

  // --- PERSISTENCIA EN localStorage ---
  const STORAGE_KEY = "cr_state_v1";

  // carga inicial desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.selectedExerciseId) {
        const found = EXERCISES.find((e) => e.id === parsed.selectedExerciseId);
        if (found) setSelectedExercise(found);
      }
      if (typeof parsed.targetReps === "number") setTargetReps(parsed.targetReps);
      if (typeof parsed.seriesCount === "number") setSeriesCount(parsed.seriesCount);
      if (typeof parsed.timeLeft === "number") setTimeLeft(parsed.timeLeft);
      if (Array.isArray(parsed.sessionHistory)) {
        const hist = parsed.sessionHistory
          .map((h) => ({ ...h, date: h.date ? new Date(h.date) : new Date() }))
          .slice(0, 100);
        setSessionHistory(hist);
      }
    } catch (e) {
      console.warn("No se pudo cargar estado desde localStorage", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // guardar automáticamente cuando cambian datos importantes
  useEffect(() => {
    try {
      const payload = {
        selectedExerciseId: selectedExercise?.id,
        targetReps,
        seriesCount,
        timeLeft,
        sessionHistory: sessionHistory.map((h) => ({
          ...h,
          date: h.date instanceof Date ? h.date.toISOString() : String(h.date),
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("No se pudo guardar estado en localStorage", e);
    }
  }, [selectedExercise, targetReps, seriesCount, timeLeft, sessionHistory]);

  function clearLocalData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("No se pudo borrar localStorage", e);
    }
    // reset local states
    setSessionHistory([]);
    setSeriesCount(0);
    setTargetReps(10);
    setSelectedExercise(EXERCISES[0]);
    resetTimer();
  }

  return (
    <div className="cr-container">
      {/* HEADER */}
      <header className="cr-header">
        <h1 className="cr-title">Contador de Repeticiones</h1>
        <p className="cr-subtitle">
          Elige el ejercicio, pulsa para sumar y registra tus series.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={clearLocalData}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Borrar datos locales
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="cr-layout">
        {/* COLUMNA IZQUIERDA: EJERCICIO + CONTADOR */}
        <div className="cr-left-column">
          {/* Selector de ejercicios */}
          <section>
            <h2 className="cr-section-label">Ejercicio</h2>
            <div className="cr-exercise-grid">
              {EXERCISES.map((ex) => {
                const isActive = ex.id === selectedExercise.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => handleExerciseChange(ex)}
                    className={
                      "cr-exercise-card" +
                      (isActive ? " cr-exercise-card--active" : "")
                    }
                    style={
                      isActive
                        ? {
                            borderColor: ex.color,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="cr-exercise-emoji"
                      style={isActive ? {} : { filter: "grayscale(0.2)" }}
                    >
                      {ex.emoji}
                    </span>
                    <div className="cr-exercise-text">
                      <span className="cr-exercise-name">{ex.label}</span>
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
          </section>

          {/* TIMER SECTION */}
          <section className="cr-timer-section">
            <h2 className="cr-section-label">Temporizador 30 min</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{formattedTimer(timeLeft)}</div>
              {timerRunning && (
                <div className="cr-timer-badge">{formattedTimer(timeLeft)} restantes</div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {!timerRunning ? (
                  <button className="cr-btn cr-btn-primary" onClick={startTimer}>Iniciar</button>
                ) : (
                  <button className="cr-btn cr-btn-secondary" onClick={pauseTimer}>Pausar</button>
                )}
                <button className="cr-btn" onClick={resetTimer}>Reset</button>
              </div>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: 8 }}>
              Al terminar sonará una alarma breve.
            </div>
          </section>

          {/* PANEL DE CONTADOR */}
          <section className="cr-counter-panel">
            <div className="cr-counter-header">
              <div>
                <p className="cr-chip-label">Serie actual</p>
                <h2 className="cr-counter-exercise">
                  {selectedExercise.emoji} {selectedExercise.label}
                </h2>
              </div>
              <div className="cr-series-info">
                <span>Series completadas: </span>
                <strong>{seriesCount}</strong>
              </div>
            </div>

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
                onClick={decrement}
                className="cr-btn cr-btn-secondary"
              >
                –1
              </button>
              <button
                type="button"
                onClick={increment}
                className="cr-btn cr-btn-primary"
                style={{
                  backgroundColor: selectedExercise.color,
                }}
              >
                +1
              </button>
              <button
                type="button"
                onClick={resetReps}
                className="cr-btn cr-btn-secondary"
              >
                Reset
              </button>
            </div>

            {/* FINALIZAR SERIE */}
            <button
              type="button"
              onClick={handleFinishSeries}
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
                  setTargetReps(
                    Number(e.target.value) > 0 ? Number(e.target.value) : 1
                  )
                }
                className="cr-target-input"
              />
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL SIMPLE */}
        <aside className="cr-history-panel">
          <h2 className="cr-section-label">Historial rápido</h2>
          <p className="cr-history-description">
            Guarda cada serie que completes para llevar un control sencillo de
            la sesión.
          </p>

          {/* Totales por ejercicio */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {totalsByExercise.map((t) => (
                <div key={t.id} style={{ minWidth: 140, padding: 8, borderRadius: 8, border: "1px solid #eef2ff", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 999, background: t.color }} />
                      <strong style={{ fontSize: 13 }}>{t.label}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{t.reps} reps</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{t.series} series</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cr-history-scroll">
            {sessionHistory.length === 0 ? (
              <p className="cr-history-empty">
                Aún no has registrado ninguna serie.
              </p>
            ) : (
              <ul className="cr-history-list">
                {sessionHistory.map((entry) => {
                  const exData = EXERCISES.find(
                    (ex) => ex.id === entry.exerciseId
                  );
                  return (
                    <li key={entry.id} className="cr-history-item">
                      <div className="cr-history-left">
                        <span className="cr-history-emoji">
                          {exData?.emoji || "🏋️"}
                        </span>
                        <div>
                          <div className="cr-history-title">
                            {entry.exerciseLabel} · {entry.reps} reps
                          </div>
                          <div className="cr-history-meta">
                            {formattedDate(entry.date)} ·{" "}
                            {formattedTime(entry.date)}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
