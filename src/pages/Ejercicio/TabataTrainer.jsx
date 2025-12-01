// TabataTrainer.jsx
// Página tipo "Tabata Timer" para configurar intervalos

import React, { useMemo, useState } from "react";
import "./TabataTrainer.css";

export default function TabataTrainer({ onStart }) {
  const [prepareSec, setPrepareSec] = useState(10);
  const [workSec, setWorkSec] = useState(45);
  const [restSec, setRestSec] = useState(25);
  const [cycles, setCycles] = useState(6);
  const [sets, setSets] = useState(4);
  const [restBetweenSetsSec, setRestBetweenSetsSec] = useState(130);

  const [workDesc, setWorkDesc] = useState("");
  const [restDesc, setRestDesc] = useState("");

  const totalSeconds = useMemo(() => {
    if (cycles <= 0 || sets <= 0) return prepareSec;

    const intervalPerCycle = workSec + restSec;
    const perSet = cycles * intervalPerCycle;
    const totalSets = sets * perSet;
    const totalRestBetweenSets =
      sets > 1 ? (sets - 1) * restBetweenSetsSec : 0;

    return prepareSec + totalSets + totalRestBetweenSets;
  }, [prepareSec, workSec, restSec, cycles, sets, restBetweenSetsSec]);

  const totalIntervals = useMemo(
    () => Math.max(0, cycles * sets),
    [cycles, sets]
  );

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleStart = () => {
    const config = {
      prepareSec,
      workSec,
      restSec,
      cycles,
      sets,
      restBetweenSetsSec,
      workDesc,
      restDesc,
      totalSeconds,
      totalIntervals,
    };

    if (onStart) {
      onStart(config);
    } else {
      console.log("Tabata config:", config);
    }
  };

  const clampNumber = (value, min = 0) =>
    Number.isNaN(Number(value)) ? min : Math.max(min, Number(value));

  return (
    <div className="tt-wrapper">
      <div className="tt-card">
        {/* BARRA SUPERIOR */}
        <div className="tt-topbar">
          <span className="tt-topbar-title">Timer</span>
          <div className="tt-topbar-icons">
            <span>⏱️</span>
            <span>🔔</span>
            <span>⚙️</span>
          </div>
        </div>

        {/* CABECERA RESUMEN */}
        <div className="tt-summary">
          <span className="tt-summary-time">
            {formatTime(totalSeconds)}
          </span>
          <span className="tt-summary-dot">•</span>
          <span>{totalIntervals} intervals</span>
          <span className="tt-summary-dot">•</span>
          <span>{sets} sets</span>
        </div>

        <div className="tt-content">
          {/* PREPARE */}
          <RowNumber
            icon="🚶"
            label="Prepare"
            value={prepareSec}
            onChange={(v) => setPrepareSec(clampNumber(v, 0))}
          />

          {/* WORK */}
          <RowNumber
            icon="🏋️"
            label="Work"
            value={workSec}
            onChange={(v) => setWorkSec(clampNumber(v, 1))}
            description={
              <DescriptionField
                placeholder="Add description"
                value={workDesc}
                onChange={setWorkDesc}
              />
            }
          />

          {/* REST */}
          <RowNumber
            icon="🧍"
            label="Rest"
            value={restSec}
            onChange={(v) => setRestSec(clampNumber(v, 0))}
            description={
              <DescriptionField
                placeholder="Add description"
                value={restDesc}
                onChange={setRestDesc}
              />
            }
          />

          {/* CYCLES */}
          <RowNumber
            icon="🔁"
            label="Cycles"
            value={cycles}
            onChange={(v) => setCycles(clampNumber(v, 1))}
          />

          {/* SETS */}
          <RowNumber
            icon="📦"
            label="Sets"
            value={sets}
            onChange={(v) => setSets(clampNumber(v, 1))}
          />

          {/* REST BETWEEN SETS */}
          <RowNumber
            icon="🪑"
            label="Rest between sets"
            value={restBetweenSetsSec}
            onChange={(v) => setRestBetweenSetsSec(clampNumber(v, 0))}
          />
        </div>

        {/* BARRA INFERIOR */}
        <div className="tt-bottom">
          <button type="button" className="tt-bottom-btn tt-bottom-list">
            ☰
          </button>

          <button
            type="button"
            className="tt-bottom-btn tt-bottom-start"
            onClick={handleStart}
          >
            START
          </button>

          <button type="button" className="tt-bottom-btn tt-bottom-plus">
            ＋
          </button>
        </div>
      </div>
    </div>
  );
}

/* Subcomponente: fila con icono, título y +/- */
function RowNumber({ icon, label, value, onChange, description }) {
  const handleMinus = () => onChange(Number(value || 0) - 1);
  const handlePlus = () => onChange(Number(value || 0) + 1);

  return (
    <div className="tt-row">
      <div className="tt-row-icon">{icon}</div>

      <div className="tt-row-main">
        <div className="tt-row-label">{label}</div>
        {description && (
          <div className="tt-row-description">{description}</div>
        )}
      </div>

      <div className="tt-row-controls">
        <button
          type="button"
          className="tt-circle-btn"
          onClick={handleMinus}
        >
          −
        </button>
        <span className="tt-row-value">{value}</span>
        <button
          type="button"
          className="tt-circle-btn"
          onClick={handlePlus}
        >
          ＋
        </button>
      </div>
    </div>
  );
}

/* Subcomponente: descripción editable muy simple */
function DescriptionField({ placeholder, value, onChange }) {
  return (
    <input
      className="tt-description-input"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
