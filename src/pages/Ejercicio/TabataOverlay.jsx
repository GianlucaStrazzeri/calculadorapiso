import React, { useEffect, useState, useRef } from "react";
import "./TabataTrainer.css";

// TabataOverlay: recibe la config generada por TabataTrainer y la ejecuta
export default function TabataOverlay({ config, onFinish, onCancel }) {
  const [intervals, setIntervals] = useState([]);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const tickRef = useRef(null);

  // Genera la secuencia de intervalos a partir de la config y añade metadatos
  useEffect(() => {
    if (!config) return;

    const items = [];
    // prepare
    if (config.prepareSec && config.prepareSec > 0) {
      items.push({ label: "Prepare", type: "prepare", duration: Number(config.prepareSec), set: 0, cycle: 0 });
    }

    for (let s = 1; s <= Number(config.sets || 1); s++) {
      for (let c = 1; c <= Number(config.cycles || 1); c++) {
        items.push({ label: `Work`, type: "work", duration: Number(config.workSec || 0), set: s, cycle: c });
        // add rest after work
        items.push({ label: `Rest`, type: "rest", duration: Number(config.restSec || 0), set: s, cycle: c });
      }
      // rest between sets (only if more than one set)
      if (s < Number(config.sets || 1) && Number(config.restBetweenSetsSec || 0) > 0) {
        items.push({ label: `Rest`, type: "between-sets", duration: Number(config.restBetweenSetsSec || 0), set: s, cycle: 0 });
      }
    }

    // remove potential trailing zero-duration intervals
    const cleaned = items.filter((it) => Number(it.duration) > 0);

    setIntervals(cleaned);
    setIndex(0);
    setSecondsLeft(cleaned.length ? cleaned[0].duration : 0);
  }, [config]);

  // Tick control: start/stop based on isRunning
  const startTick = () => {
    if (!intervals || intervals.length === 0) return;
    if (tickRef.current) return; // already running
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // advance
          setIndex((i) => {
            const next = i + 1;
            if (next >= intervals.length) {
              // finished
              if (tickRef.current) {
                clearInterval(tickRef.current);
                tickRef.current = null;
              }
              setIsRunning(false);
              if (onFinish) onFinish();
              return i; // keep index
            }
            setSecondsLeft(intervals[next].duration);
            return next;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stopTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => {
    if (!intervals || intervals.length === 0) return;
    if (isRunning) startTick();
    else stopTick();

    return () => stopTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervals, isRunning]);

  if (!config || intervals.length === 0) return null;

  const current = intervals[index] || { label: "", type: "rest", duration: 0 };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  // choose color: work -> red, rest -> blue, prepare -> gray
  const bgColor =
    current.type === "work"
      ? "#cf3a25" // red
      : current.type === "rest" || current.type === "between-sets"
      ? "#2176bd" // blue
      : "#444b54"; // prepare / default
  return (
    <div className="tt-wrapper" style={{ position: "fixed", inset: 0, zIndex: 1200, background: bgColor }}>
      <div className="tt-card" style={{ maxWidth: "100%", width: "100%", borderRadius: 0, boxShadow: "none", background: "transparent" }}>
        <div style={{ padding: "18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current=null; } if (onCancel) onCancel(); }} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 22 }}>✕</button>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{current.label}</div>
          <div />
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#fff" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 160, fontWeight: 700, lineHeight: 1 }}>{mm}:{ss}</div>
            <div style={{ marginTop: 12, fontSize: 20, opacity: 0.95 }}>{index + 1} / {intervals.length}</div>
            <div style={{ marginTop: 10, fontSize: 14, opacity: 0.95 }}>
              {/* Mostrar sets restantes */}
              {(() => {
                const currentSet = current.set || 0;
                const totalSets = Number(config.sets || 1);
                const setsRemaining = currentSet === 0 ? totalSets : Math.max(0, totalSets - currentSet + (current.type === 'between-sets' ? 0 : 0));
                return `Sets restantes: ${setsRemaining}`;
              })()}
            </div>
          </div>
        </div>

        <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 10, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 18 }}>{config.sets} sets • {config.cycles} cycles</div>
            <div style={{ fontSize: 14 }}>
              {/* Mostrar totales trabajo/descanso */}
              {(() => {
                const sets = Number(config.sets || 1);
                const cycles = Number(config.cycles || 1);
                const workSec = Number(config.workSec || 0);
                const restSec = Number(config.restSec || 0);
                const restBetween = Number(config.restBetweenSetsSec || 0);
                const totalWork = sets * cycles * workSec;
                const totalRest = sets * cycles * restSec + Math.max(0, sets - 1) * restBetween;
                const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
                return `Work ${fmt(totalWork)} • Rest ${fmt(totalRest)}`;
              })()}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => {
                  // go to previous interval
                  if (index <= 0) return;
                  const prev = Math.max(0, index - 1);
                  setIndex(prev);
                  setSecondsLeft(intervals[prev].duration);
                }}
                className="tt-bottom-btn"
                title="Anterior"
              >◀</button>

              <button
                onClick={() => setIsRunning((r) => !r)}
                className="tt-bottom-btn"
                title={isRunning ? "Pausar" : "Reanudar"}
              >{isRunning ? "❚❚" : "▶"}</button>

              <button
                onClick={() => {
                  // skip to next interval
                  const next = index + 1;
                  if (next >= intervals.length) {
                    // finish
                    stopTick();
                    setIsRunning(false);
                    if (onFinish) onFinish();
                    return;
                  }
                  setIndex(next);
                  setSecondsLeft(intervals[next].duration);
                }}
                className="tt-bottom-btn"
                title="Siguiente"
              >▶</button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { stopTick(); setIsRunning(false); if (onCancel) onCancel(); }} className="tt-bottom-btn">Stop</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
