import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { format, parseISO } from 'date-fns';

// Helper: aggregate sessions into daily volumes per muscle group and a fatigue score
// sessions: [{ date: '2025-12-01', exercises: [{ name, muscleGroup, sets, reps, load, rpe? }] }, ...]
export function aggregateTrainingData(sessions = []) {
  // Map date -> muscle -> { volume, fatigue }
  const map = new Map();

  sessions.forEach((s) => {
    const day = format(parseISO(s.date), 'yyyy-MM-dd');
    if (!map.has(day)) map.set(day, new Map());
    const muscles = map.get(day);

    (s.exercises || []).forEach((ex) => {
      const m = ex.muscleGroup || 'Other';
      const sets = Number(ex.sets || 0);
      const reps = Number(ex.reps || 0);
      const load = Number(ex.load || 0);
      const rpe = Number(ex.rpe || 7);
      const volume = sets * reps * load; // simple volume metric
      // Simple fatigue model: volume scaled by (rpe / 8) and sets factor
      const fatigue = volume * (rpe / 8) * Math.log(1 + sets);

      if (!muscles.has(m)) muscles.set(m, { volume: 0, fatigue: 0 });
      const cur = muscles.get(m);
      cur.volume += volume;
      cur.fatigue += fatigue;
    });
  });

  // Convert to array sorted by day
  const days = Array.from(map.keys()).sort();
  const muscleSet = new Set();
  const seriesByMuscle = {};

  days.forEach((d) => {
    const muscles = map.get(d);
    for (const [m, v] of muscles.entries()) muscleSet.add(m);
  });

  const muscles = Array.from(muscleSet).sort();
  muscles.forEach((m) => (seriesByMuscle[m] = []));

  days.forEach((d) => {
    const musclesMap = map.get(d);
    muscles.forEach((m) => {
      const val = musclesMap && musclesMap.has(m) ? musclesMap.get(m).volume : 0;
      seriesByMuscle[m].push(val);
    });
  });

  // fatigue heatmap matrix: muscles x days
  const fatigueMatrix = muscles.map((m) =>
    days.map((d) => {
      const mm = map.get(d);
      return mm && mm.has(m) ? Math.round(mm.get(m).fatigue) : 0;
    })
  );

  return { days, muscles, seriesByMuscle, fatigueMatrix };
}

export default function TrainingCharts({ sessions = [] }) {
  const { days, muscles, seriesByMuscle, fatigueMatrix } = useMemo(
    () => aggregateTrainingData(sessions),
    [sessions]
  );

  // Stacked area: volumes per muscle
  const stackedSeries = muscles.map((m) => ({
    name: m,
    type: 'line',
    stack: 'total',
    areaStyle: {},
    emphasis: { focus: 'series' },
    data: seriesByMuscle[m] || [],
  }));

  const areaOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: muscles },
    toolbox: { feature: { saveAsImage: {} } },
    xAxis: { type: 'category', boundaryGap: false, data: days },
    yAxis: { type: 'value', name: 'Volume (kg·reps)' },
    series: stackedSeries,
  };

  // Heatmap option for fatigue (muscles vs days)
  const heatData = [];
  fatigueMatrix.forEach((row, i) => row.forEach((val, j) => heatData.push([j, i, val])));

  const heatOption = {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        return `${params.seriesName}<br/>${days[params.value[0]]} - ${muscles[params.value[1]]}: ${params.value[2]}`;
      },
    },
    grid: { height: '60%', top: '10%' },
    xAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: muscles,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: Math.max(1, ...heatData.map((d) => d[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
    },
    series: [
      {
        name: 'Fatiga estimada',
        type: 'heatmap',
        data: heatData,
        label: { show: false },
        emphasis: { itemStyle: { borderColor: '#333', borderWidth: 1 } },
      },
    ],
  };

  // If no data, show example placeholder
  if (!sessions || sessions.length === 0) {
    return (
      <div style={{ padding: 12 }}>
        <p>No hay sesiones aun. Pasa tus `sessions` al componente con este formato:</p>
        <pre style={{ fontSize: 12 }}>
{`[
  { date: '2025-12-01', exercises: [{ name: 'Press banca', muscleGroup: 'Pectoral', sets: 4, reps: 6, load: 70, rpe: 8 }] },
  { date: '2025-12-02', exercises: [{ name: 'Sentadilla', muscleGroup: 'Cuádriceps', sets: 5, reps: 5, load: 100, rpe: 8 }] }
]`}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
      <div style={{ height: 360 }}>
        <h3 style={{ margin: '6px 0' }}>Volumen acumulado por grupo muscular (stacked)</h3>
        <ReactECharts option={areaOption} style={{ height: 320 }} />
      </div>

      <div style={{ height: 400 }}>
        <h3 style={{ margin: '6px 0' }}>Mapa de fatiga por día / grupo muscular</h3>
        <ReactECharts option={heatOption} style={{ height: 340 }} />
      </div>
    </div>
  );
}
