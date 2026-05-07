import { useEffect, useRef, useMemo } from "react";
import iclineal from "../assets/ic_lineal.png";
import iccircular from "../assets/ic_circular.png";
import icdispersion from "../assets/ic_dispersion.png";
import icradar from "../assets/ic_radar.png";
import ictabla from "../assets/ic_tala.png";
import iccolumna from "../assets/ic_columna.png";
import icbarras from "../assets/ic_graficobarras.png";
import icareas from "../assets/ic_area.png";

import {
  Chart,
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, PieController, ArcElement,
  RadarController, RadialLinearScale,
  ScatterController,
  CategoryScale, LinearScale,
  Filler, Tooltip, Legend,
} from "chart.js";

Chart.register(
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, PieController, ArcElement,
  RadarController, RadialLinearScale,
  ScatterController,
  CategoryScale, LinearScale,
  Filler, Tooltip, Legend
);

/* ─── colores por serie ───────────────────────────────────── */
const COLORS = [
  "#3B8BD4", "#1D9E75", "#F59E0B", "#EF4444",
  "#8B5CF6", "#06B6D4", "#10B981", "#4F46E5",
  "#EC4899", "#F97316", "#14B8A6", "#6366F1",
];

const chartIcons = {
  line: iclineal, pie: iccircular, scatter: icdispersion,
  radar: icradar, table: ictabla, column: iccolumna,
  bar: icbarras, area: icareas,
};

const backgroundPlugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "rgba(20, 25, 35, 0.9)";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

/* ─── hook chart.js ───────────────────────────────────────── */
function useChart(canvasRef, config) {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!chartRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        ...config,
        plugins: [backgroundPlugin],
        options: { ...config.options, responsive: true, maintainAspectRatio: false },
      });
      return;
    }
    chartRef.current.data = config.data;
    chartRef.current.options = { ...config.options, responsive: true, maintainAspectRatio: false };
    chartRef.current.update();
  }, [JSON.stringify(config.data)]);

  useEffect(() => () => { chartRef.current?.destroy(); chartRef.current = null; }, []);
}

/* ─── helpers ─────────────────────────────────────────────── */
// Normaliza siempre a array
const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// Labels del eje X: si hay múltiples xAxis, concatena sus valores
function buildLabels(data, xCols) {
  if (!xCols.length) return data.map((_, i) => `Fila ${i + 1}`);
  return data.map((r) => xCols.map((c) => r[c] ?? "").join(" · "));
}

// Un dataset por cada columna Y
function buildDatasets(data, yCols, type = "bar") {
  return yCols.map((col, i) => {
    const color = COLORS[i % COLORS.length];
    const values = data.map((r) => parseFloat(r[col]) || 0);
    const base = { label: col, data: values, backgroundColor: color };

    if (type === "line" || type === "area") {
      return {
        ...base,
        borderColor: color,
        backgroundColor: type === "area" ? color + "33" : color + "22",
        tension: 0.4,
        fill: type === "area",
        pointRadius: 3,
      };
    }
    if (type === "bar" || type === "column") {
      return { ...base, borderRadius: 6 };
    }
    return base;
  });
}

/* ─── componentes ─────────────────────────────────────────── */

function ChartColumn({ data, xCols, yCols }) {
  const ref = useRef(null);
  useChart(ref, {
    type: "bar",
    data: { labels: buildLabels(data, xCols), datasets: buildDatasets(data, yCols, "column") },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } } } },
      scales: { x: { grid: { display: false }, ticks: { color: "rgba(255,255,255,0.5)" } }, y: { beginAtZero: true, ticks: { color: "rgba(255,255,255,0.5)" } } },
    },
  });
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

function ChartBar({ data, xCols, yCols }) {
  const ref = useRef(null);
  useChart(ref, {
    type: "bar",
    data: { labels: buildLabels(data, xCols), datasets: buildDatasets(data, yCols, "bar") },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: { legend: { labels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } } } },
      scales: { x: { beginAtZero: true, ticks: { color: "rgba(255,255,255,0.5)" } }, y: { ticks: { color: "rgba(255,255,255,0.5)" } } },
    },
  });
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

function ChartLine({ data, xCols, yCols }) {
  const ref = useRef(null);
  useChart(ref, {
    type: "line",
    data: { labels: buildLabels(data, xCols), datasets: buildDatasets(data, yCols, "line") },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } } } },
      scales: { x: { grid: { display: false }, ticks: { color: "rgba(255,255,255,0.5)" } }, y: { beginAtZero: true, ticks: { color: "rgba(255,255,255,0.5)" } } },
    },
  });
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

function ChartArea({ data, xCols, yCols }) {
  const ref = useRef(null);
  useChart(ref, {
    type: "line",
    data: { labels: buildLabels(data, xCols), datasets: buildDatasets(data, yCols, "area") },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } } } },
      scales: { x: { grid: { display: false }, ticks: { color: "rgba(255,255,255,0.5)" } }, y: { beginAtZero: true, ticks: { color: "rgba(255,255,255,0.5)" } } },
    },
  });
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

function ChartPie({ data, xCols, yCols }) {
  const ref = useRef(null);
  // Para pie: agrupa por xCols, suma la primera yCol
  const yCol = yCols[0] ?? null;
  const grouped = useMemo(() => {
    const counts = {};
    data.forEach((r) => {
      const key = xCols.map((c) => r[c] ?? "").join(" · ") || "Sin dato";
      counts[key] = (counts[key] || 0) + (parseFloat(r[yCol]) || 1);
    });
    return counts;
  }, [data, xCols.join(), yCols.join()]);

  useChart(ref, {
    type: "pie",
    data: {
      labels: Object.keys(grouped),
      datasets: [{ data: Object.values(grouped), backgroundColor: COLORS, borderColor: "rgba(20,25,35,0.8)", borderWidth: 2, hoverOffset: 10 }],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom", labels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } } } },
    },
  });
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

function ChartRadar({ data, xCols, yCols }) {
  const ref = useRef(null);
  const slice = data.slice(0, 12);
  useChart(ref, {
    type: "radar",
    data: {
      labels: buildLabels(slice, xCols),
      datasets: buildDatasets(slice, yCols, "radar").map((ds, i) => ({
        ...ds,
        backgroundColor: COLORS[i % COLORS.length] + "33",
        borderColor: COLORS[i % COLORS.length],
        pointBackgroundColor: COLORS[i % COLORS.length],
      })),
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } } } },
      scales: { r: { ticks: { color: "rgba(255,255,255,0.4)", backdropColor: "transparent" }, grid: { color: "rgba(255,255,255,0.1)" }, pointLabels: { color: "rgba(255,255,255,0.6)", font: { size: 10 } } } },
    },
  });
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

function ChartScatter({ data, xCols, yCols }) {
  const ref = useRef(null);
  // scatter: un dataset por cada combinación xCol+yCol
  const datasets = yCols.flatMap((yCol, yi) =>
    xCols.map((xCol, xi) => ({
      label: `${xCol} vs ${yCol}`,
      data: data.map((r) => ({ x: parseFloat(r[xCol]) || 0, y: parseFloat(r[yCol]) || 0 })),
      backgroundColor: COLORS[(yi * xCols.length + xi) % COLORS.length] + "99",
      pointRadius: 5,
    }))
  );
  useChart(ref, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "rgba(255,255,255,0.6)", font: { size: 11 } } } },
      scales: { x: { ticks: { color: "rgba(255,255,255,0.5)" }, grid: { color: "rgba(255,255,255,0.05)" } }, y: { beginAtZero: true, ticks: { color: "rgba(255,255,255,0.5)" }, grid: { color: "rgba(255,255,255,0.05)" } } },
    },
  });
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}

function ChartTable({ data, xCols, yCols }) {
  const cols = useMemo(() => {
    const all = [...xCols, ...yCols];
    return all.length ? all : Object.keys(data[0] || {});
  }, [xCols.join(), yCols.join(), data]);

  return (
    <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "350px" }}>
      <table style={styles.table}>
        <thead>
          <tr>{cols.map((k) => <th key={k} style={styles.th}>{k}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>{cols.map((col) => <td key={col} style={styles.td}>{r[col] ?? ""}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── mapa tipo → componente ──────────────────────────────── */
const CHART_MAP = {
  bar:     { Component: ChartBar,     title: "Gráfico de barras",   height: 320 },
  column:  { Component: ChartColumn,  title: "Gráfico de columnas", height: 320 },
  line:    { Component: ChartLine,    title: "Gráfico de línea",    height: 320 },
  area:    { Component: ChartArea,    title: "Gráfico de área",     height: 320 },
  pie:     { Component: ChartPie,     title: "Gráfico de torta",    height: 360 },
  radar:   { Component: ChartRadar,   title: "Gráfico radar",       height: 360 },
  scatter: { Component: ChartScatter, title: "Dispersión",          height: 320 },
  table:   { Component: ChartTable,   title: "Tabla de datos",      height: 420, fullWidth: true },
};

/* ─── EXPORT PRINCIPAL ────────────────────────────────────── */
export default function Graphics({ data = [], xAxis, yAxis, type }) {
  // Siempre arrays
  const xCols = toArr(xAxis);
  const yCols = toArr(yAxis);

  if (!data.length) return null;

  const entry = CHART_MAP[type];
  if (!entry) return (
    <div style={styles.chartCard}>
      <p style={styles.chartTitle}>Tipo "{type}" no reconocido</p>
    </div>
  );

  const { Component, title, height, fullWidth } = entry;
  const subtitle = [
    xCols.length ? `X: ${xCols.join(", ")}` : "",
    yCols.length ? `Y: ${yCols.join(", ")}` : "",
  ].filter(Boolean).join("  ·  ");

  return (
    <div style={{ ...styles.chartCard, ...(fullWidth ? { gridColumn: "1 / -1" } : {}) }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <img src={chartIcons[type]} alt={type} style={{ width: "18px", height: "18px" }} />
        <p style={styles.chartTitle}>{title}</p>
      </div>
      <p style={styles.chartSub}>{subtitle}</p>
      <div style={height ? { height: `${height}px` } : {}}>
        <Component data={data} xCols={xCols} yCols={yCols} />
      </div>
    </div>
  );
}

const styles = {
  chartCard: {
    background: "rgba(20, 25, 35, 0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: 14, padding: 14,
    width: "100%", display: "block",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  },
  chartTitle: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 2, fontWeight: 500 },
  chartSub:   { fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 10 },
  table: { width: "100%", borderCollapse: "collapse", color: "#111", fontSize: 13, background: "#fff" },
  th: { textAlign: "left", fontSize: 12, padding: 10, borderBottom: "1px solid #ddd", color: "#111", background: "#f3f3f3" },
  td: { fontSize: 12, padding: 10, borderBottom: "1px solid #eee", color: "#222" },
};