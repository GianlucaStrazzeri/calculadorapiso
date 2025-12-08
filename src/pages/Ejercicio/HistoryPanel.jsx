// HistoryPanel.jsx
//
// Componente: HistoryPanel
// - Propósito: mostrar un resumen rápido del historial de la sesión y del
//   volumen por ejercicio. Incluye totales por ejercicio, un calendario de
//   volumen y la lista de series registradas (con hora/fecha y volumen).
// - Props:
//    `sessionHistory` (Array): lista de entradas de series realizadas.
//    `totalsByExercise` (Array): agregados por ejercicio (reps, series, volume).
//    `exercises` (Array): catálogo de ejercicios para enriquecer las entradas.
// - Comportamiento:
//    * Formatea fechas y horas para mostrar cuándo se completó cada serie.
//    * Muestra una vista previa de vídeo o emoji del ejercicio cuando está disponible.
//    * Está pensado como un panel lateral (aside) para seguimiento rápido.
//
import React from "react";
import VolumeCalendar from "./VolumeCalendar";
import "./ContadorReps.css";
import "./HistoryPanel.css";
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
      <div className="cr-totals-wrap">
        <div className="cr-totals-row">
          {totalsByExercise.map((t) => (
            <div key={t.id} className="cr-total-card">
              <div className="cr-total-card-row">
                <div className="cr-total-left">
                  <span className="cr-total-dot" style={{ background: t.color }} />
                  <strong className="cr-total-label">{t.label}</strong>
                </div>
                <div className="cr-total-right">
                  <div className="cr-total-reps">{t.reps} reps</div>
                  <div className="cr-total-series">{t.series} series</div>
                  {t.totalVolume > 0 && (
                    <div className="cr-total-volume">{t.totalVolume.toFixed(0)} kg</div>
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
