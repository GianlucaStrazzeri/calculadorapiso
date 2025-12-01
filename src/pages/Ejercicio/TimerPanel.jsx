// TimerPanel.jsx
import React from "react";
import "./ContadorReps.css";

function formatSeconds(s) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function TimerPanel({
  timeLeft,
  timerRunning,
  onStart,
  onPause,
  onReset,
}) {
  return (
    <section className="cr-timer-section">
      <h2 className="cr-section-label">Temporizador 30 min</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          {formatSeconds(timeLeft)}
        </div>
        {timerRunning && (
          <div className="cr-timer-badge">
            {formatSeconds(timeLeft)} restantes
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {!timerRunning ? (
            <button className="cr-btn cr-btn-primary" onClick={onStart}>
              Iniciar
            </button>
          ) : (
            <button className="cr-btn cr-btn-secondary" onClick={onPause}>
              Pausar
            </button>
          )}
          <button className="cr-btn" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
