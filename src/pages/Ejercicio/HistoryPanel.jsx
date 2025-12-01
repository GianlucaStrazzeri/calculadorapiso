// HistoryPanel.jsx
import React from "react";
import VolumeCalendar from "./VolumeCalendar";
import "./ContadorReps.css";
import VideoPreview from "./VideoPreview";

export default function HistoryPanel({
  sessionHistory,
  totalsByExercise,
  exercises,
}) {
  const formattedTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formattedDate = (date) =>
    date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <aside className="cr-history-panel">
      <h2 className="cr-section-label">Historial rápido</h2>
      <p className="cr-history-description">
        Guarda cada serie que completes para llevar un control sencillo de
        la sesión y del volumen levantado.
      </p>

      {/* Totales por ejercicio */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {totalsByExercise.map((t) => (
            <div
              key={t.id}
              style={{
                minWidth: 160,
                padding: 8,
                borderRadius: 8,
                border: "1px solid #eef2ff",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: t.color,
                    }}
                  />
                  <strong style={{ fontSize: 13 }}>{t.label}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 700 }}
                  >
                    {t.reps} reps
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {t.series} series
                  </div>
                  {t.totalVolume > 0 && (
                    <div
                      style={{ fontSize: 12, color: "#475569" }}
                    >
                      {t.totalVolume.toFixed(0)} kg
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendario de volumen */}
      <VolumeCalendar sessionHistory={sessionHistory} />

      {/* Historial de series */}
      <div className="cr-history-scroll">
        {sessionHistory.length === 0 ? (
          <p className="cr-history-empty">
            Aún no has registrado ninguna serie.
          </p>
        ) : (
          <ul className="cr-history-list">
            {sessionHistory.map((entry) => {
              const exData = exercises.find(
                (ex) => ex.id === entry.exerciseId
              );
              const date =
                entry.date instanceof Date
                  ? entry.date
                  : new Date(entry.date);
              const hasWeight = Number(entry.weightKg) > 0;
              const volume =
                Number(entry.volume) ||
                Number(entry.weightKg || 0) *
                  Number(entry.reps || 0);

              return (
                <li key={entry.id} className="cr-history-item">
                  <div className="cr-history-left">
                    <span className="cr-history-emoji">
                      {/* video preview or emoji */}
                      {exData ? (
                        <VideoPreview exercise={exData} size={"small"} />
                      ) : (
                        exData?.emoji || "🏋️"
                      )}
                    </span>
                    <div>
                      <div className="cr-history-title">
                        {entry.exerciseLabel} · {entry.reps} reps
                        {hasWeight && ` · ${entry.weightKg} kg`}
                        {volume > 0 && ` · ${volume.toFixed(0)} kg`}
                      </div>
                      <div className="cr-history-meta">
                        {formattedDate(date)} · {formattedTime(date)}
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
  );
}
