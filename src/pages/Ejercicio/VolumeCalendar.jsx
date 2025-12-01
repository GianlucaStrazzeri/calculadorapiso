// VolumeCalendar.jsx
import React, { useState, useMemo } from "react";
import "./ContadorReps.css";

function getDateKey(date) {
  if (!(date instanceof Date)) return "";
  // Use local date components to avoid timezone shifts when comparing days
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function VolumeCalendar({ sessionHistory }) {
  const today = new Date();
  // endDate represents the last day shown in the calendar (inclusive)
  const [endDate, setEndDate] = useState(today);

  // normalize endDate (strip time)
  const normalizedEnd = useMemo(() => {
    const d = new Date(endDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [endDate]);
  // Agrupar volumen por día
  const volumeByDay = sessionHistory.reduce((acc, entry) => {
    const d =
      entry.date instanceof Date ? entry.date : new Date(entry.date);
    const key = getDateKey(d);
    const vol = Number(entry.volume) || 0;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + vol;
    return acc;
  }, {});

  // Crear ventana de 14 días terminando en "normalizedEnd"
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(normalizedEnd);
    d.setDate(normalizedEnd.getDate() - i);
    const key = getDateKey(d);
    days.push({ key, date: d, volume: volumeByDay[key] || 0 });
  }

  const maxVolume =
    days.reduce((max, d) => (d.volume > max ? d.volume : max), 0) || 1;

  return (
    <div className="cr-volume-calendar">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="cr-volume-title">Volumen levantado</h3>
        <div className="cr-calendar-nav">
          <button
            type="button"
            aria-label="Días anteriores"
            onClick={() => {
              const n = new Date(normalizedEnd);
              n.setDate(n.getDate() - 14);
              setEndDate(n);
            }}
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Días siguientes"
            onClick={() => {
              const n = new Date(normalizedEnd);
              n.setDate(n.getDate() + 14);
              // no permitir ir más allá de hoy
              const cap = new Date();
              cap.setHours(0, 0, 0, 0);
              if (n > cap) n.setTime(cap.getTime());
              setEndDate(n);
            }}
            disabled={normalizedEnd >= new Date(new Date().setHours(0,0,0,0))}
          >
            ▶
          </button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
        {`${days[0].date.toLocaleDateString()} — ${days[days.length - 1].date.toLocaleDateString()}`}
      </div>
      <div className="cr-volume-grid">
        {days.map((d) => {
          const intensity = d.volume > 0 ? d.volume / maxVolume : 0;
          const bgAlpha = 0.15 + intensity * 0.7;
          const bgColor =
            d.volume > 0
              ? `rgba(37, 99, 235, ${bgAlpha})`
              : "rgba(148, 163, 184, 0.15)";

          return (
            <div
              key={d.key}
              className="cr-volume-day"
              style={{ backgroundColor: bgColor }}
              title={`${d.key} · Volumen: ${d.volume.toFixed(0)} kg`}
            >
              <span className="cr-volume-day-number">
                {d.date.getDate()}
              </span>
              <span className="cr-volume-day-volume">
                {d.volume > 0 ? d.volume.toFixed(0) + " kg" : "-"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
