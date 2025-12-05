import React, { useMemo, useState } from 'react';
import './EvolucionDelPrecio.css';

function generateSeries() {
  const startYear = 2025;
  const years = Array.from({ length: 6 }, (_, i) => startYear + i);
  const baseStart = 2400;

  const base = years.map((y, i) => +(baseStart * Math.pow(1 + 0.04, i)).toFixed(0));
  const optimista = years.map((y, i) => +(baseStart * Math.pow(1 + 0.07, i)).toFixed(0));
  const prudente = years.map((y, i) => {
    if (i === 0 || i === 1) return baseStart;
    let val = baseStart * Math.pow(1 + 0.02, i - 1); // from 2027 (i=2) apply +2% from previous year
    return +val.toFixed(0);
  });

  return { years, base, optimista, prudente };
}

function pathFrom(series, w, h, padding) {
  const max = Math.max(...series.flat());
  const min = Math.min(...series.flat());
  const vals = series;
  const xStep = (w - padding * 2) / (vals[0].length - 1);
  const yScale = (v) => {
    if (max === min) return h / 2;
    const ratio = (v - min) / (max - min);
    return h - padding - ratio * (h - padding * 2);
  };
  const points = vals[0].map((_, i) => {
    const x = padding + i * xStep;
    return x;
  });
  const toPath = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${points[i]} ${yScale(v)}`).join(' ');
  return { toPath, max, min };
}

export default function EvolucionDelPrecio() {
  const { years, base, optimista, prudente } = useMemo(generateSeries, []);
  const [showInfo, setShowInfo] = useState(false);

  const w = 760;
  const h = 300;
  const padding = 36;

  const max = Math.max(...base, ...optimista, ...prudente);
  const min = Math.min(...base, ...optimista, ...prudente);

  const xStep = (w - padding * 2) / (years.length - 1);
  const yScale = (v) => {
    if (max === min) return h / 2;
    const ratio = (v - min) / (max - min);
    return h - padding - ratio * (h - padding * 2);
  };

  const makePath = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * xStep} ${yScale(v)}`).join(' ');

  return (
    <div className="evolucion-precio">
      <div className="chart-header">
        <h3>Escenarios ilustrativos de precio vivienda en Alicante (€/m²)</h3>
        <button className="info-btn" onClick={() => setShowInfo(!showInfo)}>?</button>
      </div>

      <div className="chart-wrap">
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
          {/* grid horizontal lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding + i * ((h - padding * 2) / 4);
            return <line key={i} x1={padding} x2={w - padding} y1={y} y2={y} stroke="#e6eef8" strokeDasharray="4 4" />;
          })}

          {/* lines */}
          <path d={makePath(base)} fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={makePath(optimista)} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={makePath(prudente)} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* markers */}
          {years.map((y, i) => (
            <g key={y}>
              <text x={padding + i * xStep} y={h - 6} fontSize="10" textAnchor="middle" fill="#374151">{y}</text>
            </g>
          ))}

          {/* legend top-left */}
          <g transform={`translate(${padding}, ${padding - 10})`}>
            <g>
              <rect x="0" y="0" width="10" height="6" fill="#D97706" />
              <text x="16" y="6" fontSize="11" fill="#111827">Escenario base (+4% anual)</text>
            </g>
            <g transform="translate(0,16)">
              <rect x="0" y="0" width="10" height="6" fill="#2563EB" />
              <text x="16" y="6" fontSize="11" fill="#111827">Escenario optimista (+7% anual)</text>
            </g>
            <g transform="translate(0,32)">
              <rect x="0" y="0" width="10" height="6" fill="#059669" />
              <text x="16" y="6" fontSize="11" fill="#111827">Escenario prudente (0% luego +2%)</text>
            </g>
          </g>
        </svg>
      </div>

      {showInfo && (
        <div className="info-modal">
          <h4>Escenarios de proyección 2025–2030 (ilustrativos)</h4>
          <p><strong>Gráfico 3:</strong> “Escenarios ilustrativos de precio vivienda en Alicante (€/m²)”</p>
          <p>Aquí no uso datos exactos de ningún informe, sino proyecciones construidas a partir de lo que dicen los informes nacionales (BBVA, INE, etc.).</p>
          <ul>
            <li>He tomado como punto de partida un valor medio de <strong>2.400 €/m²</strong> en 2025.</li>
            <li>Escenario base: <strong>+4 % anual</strong>.</li>
            <li>Escenario optimista: <strong>+7 % anual</strong>.</li>
            <li>Escenario prudente: <strong>0 % en 2026</strong> y <strong>+2 %</strong> a partir de 2027.</li>
          </ul>
          <p>Esto permite estimar posibles precios futuros por m² bajo distintas hipótesis.</p>
          <button onClick={() => setShowInfo(false)} className="close-btn">Cerrar</button>
        </div>
      )}
    </div>
  );
}
