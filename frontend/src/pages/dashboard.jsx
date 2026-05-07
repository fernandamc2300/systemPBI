import bgImage from "../assets/fotoparalogindecor.jpg";
import icExcel from "../assets/ic_excel.png";
import icbarras from "../assets/ic_graficobarras.png";
import icimportar from "../assets/ic_importar.png";
import ichome from "../assets/ic_home.png";
import icflechas from "../assets/ic_flechas.png";
import Graphics from "../pages/graphics";
import { previewExcel, parseExcel } from "../services/api";
import { v4 as uuidv4 } from "uuid";
import { useRef, useState } from "react";
import React from "react";
import iclineal from "../assets/ic_lineal.png";
import iccircular from "../assets/ic_circular.png";
import icdispersion from "../assets/ic_dispersion.png";
import icradar from "../assets/ic_radar.png";
import ictabla1 from "../assets/ic_tabla1.png";
import iccolumna from "../assets/ic_columna.png";
import icbarras1 from "../assets/ic_barras1.png";
import icareas from "../assets/ic_area.png";
import icdataset from "../assets/ic_DATASET.png";
import iceliminar from "../assets/ic_eliminar.png";
import iceditar1 from "../assets/ic_editar1.png";
import icguardar from "../assets/ic_guardar.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import icbanner from "../assets/BANNER.jpg"
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, rectSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ─── SortableChart ──────────────────────────────────────── */
const SortableChart = React.memo(function SortableChart({ chart, onDelete, onResize, onRenameChart, deleteMode }) {

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chart.id });

  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle]     = useState(chart.title ?? '');

  return (
    <div
      ref={setNodeRef}
      onClick={() => { if (deleteMode) onDelete(chart.id); }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        touchAction: "none",
        gridColumn: chart.size === "large" ? "span 2" : "span 1",
        position: "relative",
        cursor: deleteMode ? "inherit" : "grab",
      }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{ position: "absolute", top: 5, right: 5, cursor: "grab", zIndex: 10, fontSize: "14px", color: "#fff", opacity: 0.6 }}
      >
        ⠿
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onResize(chart.id); }}
        style={{ position: "absolute", top: 5, left: 5, zIndex: 20, background: "rgba(0,198,255,0.9)", border: "none", borderRadius: "50%", color: "#fff", cursor: "pointer", width: "24px", height: "24px" }}
      >
        ⛶
      </button>
      {editingTitle ? (
        <input
          autoFocus
          value={localTitle}
          onChange={e => setLocalTitle(e.target.value)}
          onBlur={() => {
            setEditingTitle(false);
            onRenameChart(chart.id, localTitle);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') e.target.blur();
            if (e.key === 'Escape') { setLocalTitle(chart.title); setEditingTitle(false); }
          }}
          style={{
            position: "absolute", top: 6, left: 36, right: 36, zIndex: 30,
            fontSize: "12px", fontWeight: 600, textAlign: "center",
            background: "rgba(0,0,0,0.4)", border: "1px solid #00c6ff",
            borderRadius: "6px", color: "#fff", padding: "2px 6px", outline: "none",
          }}
        />
      ) : (
        <p
          onDoubleClick={() => setEditingTitle(true)}
          title="Doble clic para editar"
          style={{
            position: "absolute", top: 8, left: 36, right: 36, zIndex: 30,
            fontSize: "12px", fontWeight: 600, margin: 0,
            color: "rgba(255,255,255,0.75)", textAlign: "center",
            cursor: "text", textOverflow: "ellipsis",
            overflow: "hidden", whiteSpace: "nowrap",
          }}
        >
          {localTitle || 'Sin título'}
        </p>
      )}
      <Graphics data={chart.data} xAxis={chart.xAxis} yAxis={chart.yAxis} type={chart.chartType} />
    </div>
  );
});


/* ─── ExcelPreviewer ─────────────────────────────────────── */
function ExcelPreviewer({ rows, suggestedHeader, sheets, activeSheet, onSheetChange, onConfirm, onCancel }) {
  const [selectedRow, setSelectedRow] = useState(suggestedHeader ?? 0);

  React.useEffect(() => {
    setSelectedRow(suggestedHeader ?? 0);
  }, [suggestedHeader, activeSheet]);

  const maxCols = rows.length ? Math.max(...rows.map((r) => r.length)) : 0;
  const colNums = Array.from({ length: maxCols }, (_, i) => i);

  return (
    <div style={previewStyles.overlay}>
      <div style={previewStyles.modal}>

        <div style={previewStyles.modalHeader}>
          <div>
            <p style={previewStyles.modalTitle}>Selecciona la fila de encabezado</p>
            <p style={previewStyles.modalSub}>Haz clic en la fila que contiene los nombres de columnas</p>
          </div>
          <button onClick={onCancel} style={previewStyles.cancelBtn}>✕ Cancelar</button>
        </div>

        {sheets.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>HOJA:</span>
            {sheets.map((s) => (
              <button
                key={s.index}
                onClick={() => onSheetChange(s.index)}
                style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "11px", cursor: "pointer",
                  background: activeSheet === s.index ? "#e0f2fe" : "#f3f4f6",
                  border: activeSheet === s.index ? "1px solid #2563eb" : "1px solid #e5e7eb",
                  color: activeSheet === s.index ? "#1d4ed8" : "#374151",
                  transition: "0.15s",
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        <div style={previewStyles.legend}>
          <span style={{ ...previewStyles.badge, background: "rgba(0,198,255,0.15)", border: "1px solid rgba(0,198,255,0.4)", color: "#00c6ff" }}>
            Fila seleccionada como encabezado
          </span>
          <span style={{ ...previewStyles.badge, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
            Filas de datos
          </span>
        </div>

        <div style={previewStyles.tableWrap}>
          <table key={activeSheet} style={previewStyles.table}>
            <thead>
              <tr>
                <th style={previewStyles.thNum}>#</th>
                {colNums.map((c) => (
                  <th key={c} style={previewStyles.th}>col {c + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isHeader = i === selectedRow;
                const isAbove  = i < selectedRow;
                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedRow(i)}
                    style={{
                      cursor: "pointer",
                      background: isHeader ? "rgba(0,198,255,0.12)" : isAbove ? "rgba(255,255,255,0.02)" : "transparent",
                      borderLeft: isHeader ? "3px solid #00c6ff" : "3px solid transparent",
                      opacity: isAbove ? 0.45 : 1,
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={previewStyles.tdNum}>{i}</td>
                    {colNums.map((c) => (
                      <td
                        key={c}
                        style={{
                          ...previewStyles.td,
                          fontWeight: isHeader ? 600 : 400,
                          color: isHeader ? "#0369a1" : "#111827",
                        }}
                      >
                        {row[c] ?? ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button onClick={() => onConfirm(selectedRow)} style={previewStyles.confirmBtn}>
          Cargar datos →
        </button>
      </div>
    </div>
  );
}

const previewStyles = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
  },
  modal: {
    width: "92vw", maxWidth: "1000px", maxHeight: "88vh",
    background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px",
    padding: "22px", display: "flex", flexDirection: "column", gap: "14px",
    overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { color: "#111827", fontSize: "16px", fontWeight: 600, margin: 0 },
  modalSub: { color: "#6b7280", fontSize: "12px", margin: "4px 0 0 0" },
  cancelBtn: {
    background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151",
    borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "12px",
  },
  legend: { display: "flex", gap: "10px", flexWrap: "wrap" },
  badge: { fontSize: "11px", padding: "4px 10px", borderRadius: "20px" },
  tableWrap: { overflow: "auto", flex: 1, minHeight: 0, border: "1px solid #e5e7eb", borderRadius: "10px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "12px" },
  thNum: {
    position: "sticky", top: 0, left: 0, padding: "8px",
    background: "#f9fafb", color: "#6b7280", borderBottom: "1px solid #e5e7eb", textAlign: "center",
  },
  th: {
    position: "sticky", top: 0, padding: "8px",
    background: "#f9fafb", color: "#6b7280", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
  },
  tdNum: {
    padding: "6px", textAlign: "center", color: "#9ca3af", fontSize: "11px",
    borderBottom: "1px solid #f1f5f9", background: "#f9fafb", position: "sticky", left: 0,
  },
  td: { padding: "6px 10px", borderBottom: "1px solid #f1f5f9", color: "#111827", whiteSpace: "nowrap" },
  colPill: {
    padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
    background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0369a1",
  },
  confirmBtn: {
    padding: "12px", borderRadius: "10px", background: "#2563eb",
    border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer",
  },
};
/* ─── Dashboard principal ────────────────────────────────── */
export default function Dashboard() {
  const [hovered, setHovered]                     = useState(null);
  const [excelFile, setExcelFile]                 = useState(null);
  const fileInputRef                               = useRef(null);
  const [menuOpen, setMenuOpen]                   = useState(true);
  const [loading, setLoading]                     = useState(false);
  const [data, setData]                           = useState([]);
  const [charts, setCharts]                       = useState([]);
  const [xAxis, setXAxis]                         = useState([]);
  const [yAxis, setYAxis]                         = useState([]);
const [selectedChartType, setSelectedChartType] = useState(null);
  const [columns, setColumns]                     = useState([]);
  const [editMode, setEditMode]                   = useState(false);
  const [deleteMode, setDeleteMode]               = useState(false);
  const dashboardRef = useRef(null);


const exportDashboardPDF = async () => {
  if (!dashboardRef.current) return;

  if (charts.length === 0) {
    alert("No hay gráficos para exportar");
    return;
  }

  try {
    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: "#0f172a",
      logging: false,
      allowTaint: false,
    });

    const dashboardImg = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 🔥 Banner superior más pequeño
    pdf.addImage(icbanner, "JPEG", 0, 0, pageWidth, 55);

    // 🔥 Línea
    pdf.setDrawColor(220, 220, 220);
    pdf.line(0, 55, pageWidth, 55);

    // 🔥 Tamaño más grande del dashboard
    const canvasRatio = canvas.width / canvas.height;

    // MÁS espacio disponible
    const availableWidth = pageWidth - 10;
    const availableHeight = pageHeight - 80;

    let imgWidth = availableWidth;
    let imgHeight = imgWidth / canvasRatio;

    // Ajustar si supera altura
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * canvasRatio;
    }

    // 🔥 Centrado
    const x = (pageWidth - imgWidth) / 2;
    const y = 65;

    // 🔥 Dashboard GRANDE
    pdf.addImage(
      dashboardImg,
      "PNG",
      x,
      y,
      imgWidth,
      imgHeight
    );

    // 🔥 Footer pequeño
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text(
      `Generado: ${new Date().toLocaleString()}`,
      10,
      pageHeight - 8
    );

    pdf.save(`dashboard_${new Date().toISOString().slice(0,19)}.pdf`);

  } catch (error) {
    console.error("Error exportando PDF:", error);
  }
};

  // FIX 1: showChartAlert faltaba completamente en Dashboard
  const [showChartAlert, setShowChartAlert]       = useState(false);

  const [previewing, setPreviewing]               = useState(false);
  const [previewRows, setPreviewRows]             = useState([]);
  const [suggestedHeader, setSuggestedHeader]     = useState(0);
  const [pendingFile, setPendingFile]             = useState(null);

  const [sheets, setSheets]                       = useState([]);
  const [activeSheet, setActiveSheet]             = useState(0);
  const [showDataset, setShowDataset]             = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  

  const chartOptions = [
    { id: "bar",     name: "Barras",     icon: icbarras1 },
    { id: "line",    name: "Línea",      icon: iclineal },
    { id: "pie",     name: "Pie",        icon: iccircular },
    { id: "area",    name: "Área",       icon: icareas },
    { id: "scatter", name: "Dispersión", icon: icdispersion },
    { id: "radar",   name: "Radar",      icon: icradar },
    { id: "column",  name: "Columnas",   icon: iccolumna },
    { id: "table",   name: "Tabla",      icon: ictabla1 },
  ];

  /* ── PASO 1: cargar preview ── */
  const handleImport = async () => {
    if (!excelFile) return;
    try {
      setLoading(true);
      const res = await previewExcel(excelFile, 0);
      if (res.status !== "ok") { console.error(res.msg); return; }

      setPendingFile(excelFile);
      setPreviewRows(res.rows);
      setSuggestedHeader(res.suggested_header ?? 0);
      setSheets(res.sheets ?? []);
      setActiveSheet(0);
      setPreviewing(true);

      setExcelFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error preview:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Cambio de hoja en el modal ── */
  const handleSheetChange = async (sheetIndex) => {
    setLoading(true);
    try {
      const res = await previewExcel(pendingFile, sheetIndex);
      if (res.status !== "ok") return;
      setActiveSheet(sheetIndex);
      setPreviewRows(res.rows);
      setSuggestedHeader(res.suggested_header ?? 0);
    } catch (err) {
      console.error("Error cambio hoja:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── PASO 2: confirmar encabezado y parsear ── */
  const handleConfirmHeader = async (headerRow) => {
    setPreviewing(false);
    try {
      setLoading(true);
      const res = await parseExcel(pendingFile, headerRow, activeSheet);
      if (res.status !== "ok") { console.error(res.msg); return; }

      setCharts([]);
      setXAxis([]);
      setYAxis([]);
      setSelectedChartType([]);

      setData(res.data);
      setColumns(res.headers?.filter(Boolean) ?? Object.keys(res.data?.[0] || {}));
    } catch (err) {
      console.error("Error parse:", err);
    } finally {
      setLoading(false);
      setPendingFile(null);
    }
  };

  /* ── Agregar gráfico ── */
  const addChart = () => {
    if (!xAxis.length || !yAxis.length || !selectedChartType.length) {
      setShowChartAlert(true);
      return;
    }

    const tipos = selectedChartType.includes("all")
      ? chartOptions.map((c) => c.id)
      : selectedChartType;

    const nuevos = tipos.map((tipo) => ({
      id: uuidv4(),
      xAxis: [...xAxis],
      yAxis: [...yAxis],
      chartType: tipo,
      data,
      size: "normal",
    }));

    setCharts((prev) => {
      const exists = (a, b) =>
        JSON.stringify(a.xAxis) === JSON.stringify(b.xAxis) &&
        JSON.stringify(a.yAxis) === JSON.stringify(b.yAxis) &&
        a.chartType === b.chartType;
      return [...prev, ...nuevos.filter((n) => !prev.some((p) => exists(p, n)))];
    });

    setSelectedChartType([]);
    setXAxis([]);
    setYAxis([]);
  };

  const removeChart = (id) => setCharts((prev) => prev.filter((c) => c.id !== id));
  const toggleSize  = (id) => setCharts((prev) =>
    prev.map((c) => c.id === id ? { ...c, size: c.size === "large" ? "normal" : "large" } : c)
  );

  const renameChart = (id, newTitle) =>
    setCharts(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));

  /* ── Toggle editMode ── */
  const handleToggleEditMode = () => {
    if (charts.length === 0) return;
    const next = !editMode;
    setEditMode(next);
    if (!next) setDeleteMode(false);
  };

  /* ── Cursor global con icono eliminar cuando deleteMode está activo ── */
  React.useEffect(() => {
    if (deleteMode) {
      document.body.style.cursor = `url(${iceliminar}) 12 12, crosshair`;
    } else {
      document.body.style.cursor = "default";
    }
    return () => { document.body.style.cursor = "default"; };
  }, [deleteMode]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>

      {/* ── MODAL PREVISUALIZADOR ── */}
      {previewing && (
        <ExcelPreviewer
          key={activeSheet}
          rows={previewRows}
          suggestedHeader={suggestedHeader}
          sheets={sheets}
          activeSheet={activeSheet}
          onSheetChange={handleSheetChange}
          onConfirm={handleConfirmHeader}
          onCancel={() => { setPreviewing(false); setPendingFile(null); }}
        />
      )}

      {/* FIX 2: Modal de alerta movido aquí (nivel raíz), no dentro de leftPanel */}
      {showChartAlert && (
        <div style={styles.modalOverlay} onClick={() => setShowChartAlert(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}>⚠️</div>
            <h3 style={styles.modalTitle}>Configuración incompleta</h3>
            <p style={styles.modalText}>
              Selecciona al menos <b>1 columna en X</b>, <b>1 en Y</b> y el tipo de gráfico.
            </p>
            <button style={styles.modalButton} onClick={() => setShowChartAlert(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ── DRAWER DATASET ── */}
      {showDataset && data.length > 0 && (
        <div
          onClick={() => setShowDataset(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 900,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "flex-start",
            paddingTop: "100px", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "80%", maxWidth: "1100px", maxHeight: "80vh",
              background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px",
              padding: "20px", display: "flex", flexDirection: "column", gap: "12px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)", position: "relative", margin: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#46d0d4", fontWeight: 600, fontSize: "14px" }}>Dataset cargado</span>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                  background: "rgba(11,204,108,0.15)", border: "1px solid rgba(11,204,108,0.3)", color: "#0bcc6c",
                }}>
                  {data.length} filas · {columns.length} cols
                </span>
                {sheets.length > 0 && (
                  <span style={{
                    fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                    background: "rgba(0,0,0,0.1)", border: "1px solid rgba(2,19,24,0.25)", color: "#00c6ff",
                  }}>
                    Hoja: {sheets.find((s) => s.index === activeSheet)?.name ?? activeSheet}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowDataset(false)}
                style={{ background: "none", border: "none", color: "rgba(0,0,0,0.4)", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowX: "auto", overflowY: "auto", flex: 1, borderRadius: "10px", border: "1px solid #e5e7eb" }}>
              <table style={previewStyles.table}>
                <thead>
                  <tr>
                    <th style={previewStyles.thNum}>#</th>
                    {columns.map((c) => (
                      <th key={c} style={previewStyles.th}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 200).map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                      <td style={previewStyles.tdNum}>{i + 1}</td>
                      {columns.map((c) => (
                        <td key={c} style={previewStyles.td}>{row[c] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 200 && (
                <p style={{ color: "rgba(0,0,0,0.3)", fontSize: "11px", textAlign: "center", padding: "10px" }}>
                  Mostrando 200 de {data.length} filas
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>

        {/* ── SIDEBAR ── */}
        <aside style={{ ...styles.sidebar, width: menuOpen ? "240px" : "70px", alignItems: "center", transition: "0.3s ease", overflow: "visible" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ ...styles.ichomeBtn, width: "40px", height: "40px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img src={ichome} alt="Home" style={{ width: "40px", height: "35px", filter: "brightness(0) invert(1)" }} />
          </button>

          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.icflechasBtn}>
            <img src={icflechas} alt="flechas" style={styles.icflechasImg} />
          </button>

          {menuOpen && (
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", alignItems: "flex-start" }}>
              {[
                { key: "dash",   label: "Dashboard" },
                { key: "rep",    label: "Reportes" },
                { key: "ind",    label: "Indicadores" },
                { key: "users",  label: "Usuarios" },
                { key: "config", label: "Configuración" },
              ].map((item, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHovered(item.key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ ...styles.menuItem, width: "100%", justifyContent: "flex-start", ...(hovered === item.key ? styles.menuItemHover : {}) }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* ── MAIN ── */}
        <main style={styles.main}>
          <header style={styles.topbar}>
            <div>
              <h2 style={styles.pageTitle}>Panel de Control BI</h2>
              <p style={styles.subtitle}>Sistema de análisis y visualización</p>
            </div>
            <button
              onMouseEnter={() => setHovered("logout")}
              onMouseLeave={() => setHovered(null)}
              style={{ ...styles.logout, ...(hovered === "logout" ? styles.logoutHover : {}) }}
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </header>

          <section style={styles.dashboardSection}>
            <div style={styles.dashboardRow}>

              {/* ── PANEL IZQUIERDO ── */}
              <div style={styles.leftPanel}>

                {/* Cards 2×2 */}
                <div style={styles.cardGrid}>

                  {/* Card 1: Importar Excel */}
                  <div style={styles.importCard}>
                    <button style={styles.icExcelBtn} onClick={() => fileInputRef.current.click()}>
                      <img src={icExcel} style={styles.icExcelImg} alt="Excel" />
                    </button>
                    <p style={styles.cardTitle}>Importar Excel</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={(e) => setExcelFile(e.target.files[0])}
                    />
                    {excelFile && (
                      <div style={styles.fileRow}>
                        <div style={styles.fileBox}>📄 {excelFile.name}</div>
                        <button style={styles.icimportarBtn} onClick={handleImport}>
                          <img src={icimportar} style={styles.icimportarIconImg} alt="Importar" />
                        </button>
                      </div>
                    )}
                    {loading && (
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginTop: "4px" }}>
                        ⏳ Procesando...
                      </p>
                    )}
                  </div>

                  {/* Card 2: Ver dataset */}
                  <div
                    onClick={() => data.length > 0 && setShowDataset(true)}
                    style={{
                      ...styles.toolCard,
                      cursor: data.length > 0 ? "pointer" : "default",
                      opacity: data.length > 0 ? 1 : 0.5,
                      border: data.length > 0
                        ? "1px solid rgba(11,204,108,0.3)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <img
                      src={icdataset}
                      alt="dataset"
                      style={{ width: "34px", height: "34px", objectFit: "contain", opacity: data.length > 0 ? 1 : 0.4 }}
                    />
                    <p style={styles.cardTitle}>Ver dataset</p>
                    <p style={{ fontSize: "10px", margin: 0, color: data.length > 0 ? "#0bcc6c" : "rgba(255,255,255,0.3)" }}>
                      {data.length > 0 ? `${data.length} filas cargadas` : "Sin datos"}
                    </p>
                  </div>

                  {/* Card 3: Editar */}
                  <div
                    onClick={handleToggleEditMode}
                    style={{
                      ...styles.toolCard,
                      cursor: charts.length === 0 ? "not-allowed" : "pointer",
                      opacity: charts.length === 0 ? 0.4 : 1,
                      border: editMode
                        ? "1px solid #00c6ff"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <img
                      src={iceditar1}
                      alt="editar"
                      style={{ width: "34px", height: "34px", objectFit: "contain", opacity: data.length > 0 ? 1 : 0.4 }}
                    />
                    <p style={styles.cardTitle}>Editar</p>
                  </div>

                  {/* Card 4: Próximamente */}
                 {/* Card 4: Guardar PDF */}
                    <div
                      onClick={exportDashboardPDF}
                      style={{
                        ...styles.toolCard,
                        cursor: charts.length > 0 ? "pointer" : "not-allowed",
                        opacity: charts.length > 0 ? 1 : 0.5,
                        border: "1px solid rgba(255,255,255,0.1)"
                      }}
                    >
                      <img
                      src={icguardar}
                      alt="dataset"
                      style={{ width: "34px", height: "34px", objectFit: "contain", opacity: data.length > 0 ? 1 : 0.4 }}
                    />

                      <p style={styles.cardTitle}>Guardar PDF</p>

                      <p
                        style={{
                          fontSize: "10px",
                          margin: 0,
                          color: "rgba(255,255,255,0.4)"
                        }}
                      >
                        Exportar dashboard
                      </p>
                    </div>

                </div>

                {/* Panel editar */}
                {editMode && (
                  <div style={{
                    marginTop: "10px", padding: "10px", borderRadius: "10px",
                    background: "#ffffff", border: "1px solid #e5e7eb",
                    display: "flex", gap: "8px", alignItems: "center",
                    width: "100%", boxSizing: "border-box",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  }}>
                    <button
                      onClick={() => setDeleteMode(!deleteMode)}
                      style={{
                        padding: "6px 10px", borderRadius: "6px", border: "none",
                        cursor: "pointer", fontSize: "11px",
                        background: deleteMode ? "#ff4d4f" : "#f3f4f6",
                        color: deleteMode ? "#fff" : "#111",
                      }}
                    >
                      🗑 Eliminar
                    </button>
                    <button
                      style={{
                        padding: "3px 5px", borderRadius: "6px",
                        border: "1px solid #e5e7eb", background: "#fff",
                        cursor: "pointer", fontSize: "11px",
                      }}
                    >
                      🎨 Estilos
                    </button>
                  </div>
                )}

              </div>
              {/* ── FIN PANEL IZQUIERDO ── */}

              {/* ── PANEL DERECHO: BUILDER ── */}
              <div style={styles.rightPanel}>
                <div style={styles.chartContainerCard}>

                  {data.length === 0 && (
                    <div style={styles.emptyState}>
                      <img src={icbarras} style={{ width: 40, height: 40, opacity: 0.35, objectFit: "contain" }} alt="" />
                      <p style={styles.emptyTitle}>Sin datos aún</p>
                      <p style={styles.emptySubtitle}>
                        Importa un Excel — verás las hojas y filas para elegir el encabezado correcto
                      </p>
                    </div>
                  )}

                  {data.length > 0 && (
                    <>
                      <div style={styles.statusCard}>
                        <span style={styles.statusDot}></span>
                        <span style={{ color: "#fff", fontSize: "13px" }}>
                          {data.length} filas · {columns.length} columnas detectadas
                        </span>
                      </div>

                      <div style={styles.builderRow}>

                        {/* TIPOS DE GRÁFICO */}
                        <div style={styles.chartGrid}>
                          <span style={{ gridColumn: "1 / -1", color: "rgba(255,255,255,0.45)", fontSize: "11px", letterSpacing: "0.05em" }}>
                            SELECCIONE GRÁFICO
                          </span>
                          <div
                            onClick={() => setSelectedChartType(selectedChartType.includes("all") ? [] : ["all"])}
                            style={{
                              ...styles.chartCardAll,
                              background: selectedChartType.includes("all") ? "rgba(0,198,255,0.18)" : "rgba(255,255,255,0.04)",
                              border: selectedChartType.includes("all") ? "1px solid #f4f3f8" : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <p style={{ fontSize: "11px", color: "#fff", margin: 0 }}>Todos</p>
                          </div>
                          {chartOptions.map((item) => {
                            const isSelected = selectedChartType.includes("all") || selectedChartType.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (selectedChartType.includes("all")) return;
                                  setSelectedChartType((prev) =>
                                    prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                                  );
                                }}
                                style={{
                                  ...styles.chartCardSmall,
                                  background: isSelected ? "rgba(0,198,255,0.18)" : "rgba(255,255,255,0.04)",
                                  border: isSelected ? "1px solid #ececec" : "1px solid rgba(255,255,255,0.08)",
                                  opacity: selectedChartType.includes("all") ? 0.5 : 1,
                                }}
                              >
                                <img src={item.icon} style={{ width: "22px" }} alt={item.name} />
                                <p style={{ fontSize: "10px", marginTop: "4px", color: "rgba(255,255,255,0.7)" }}>{item.name}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* EJE X / EJE Y */}
                        <div style={styles.configBox}>
                          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", margin: "0 0 4px 0" }}>CONFIGURAR GRÁFICO</p>

                          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>
                            EJE X{xAxis.length > 0 && <span style={{ color: "#00c6ff", marginLeft: "6px" }}>({xAxis.length} sel.)</span>}
                          </p>
                          <div style={styles.columnGrid}>
                            {columns.map((col) => (
                              <div
                                key={col}
                                onClick={() => setXAxis((prev) => prev.includes(col) ? prev.filter((x) => x !== col) : [...prev, col])}
                                style={{
                                  ...styles.columnChip,
                                  background: xAxis.includes(col) ? "rgba(0,198,255,0.25)" : "rgba(255,255,255,0.05)",
                                  border: xAxis.includes(col) ? "1px solid rgba(0,198,255,0.6)" : "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                {col}
                              </div>
                            ))}
                          </div>

                          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", marginTop: "8px" }}>
                            EJE Y{yAxis.length > 0 && <span style={{ color: "rgba(180,100,255,0.9)", marginLeft: "6px" }}>({yAxis.length} sel.)</span>}
                          </p>
                          <div style={styles.columnGrid}>
                            {columns.map((col) => (
                              <div
                                key={col}
                                onClick={() => setYAxis((prev) => prev.includes(col) ? prev.filter((y) => y !== col) : [...prev, col])}
                                style={{
                                  ...styles.columnChip,
                                  background: yAxis.includes(col) ? "rgba(180,100,255,0.25)" : "rgba(255,255,255,0.05)",
                                  border: yAxis.includes(col) ? "1px solid rgba(180,100,255,0.6)" : "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                {col}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={addChart}
                            style={{ marginTop: "12px", padding: "10px", borderRadius: "10px", background: "#00c6ff", border: "none", color: "#fff", fontSize: "12px", cursor: "pointer", width: "100%" }}
                          >
                            + Generar gráfico
                          </button>

                          {(xAxis.length > 0 || yAxis.length > 0) && (
                            <button
                              onClick={() => { setXAxis([]); setYAxis([]); }}
                              style={{ marginTop: "4px", padding: "6px", borderRadius: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontSize: "11px", cursor: "pointer", width: "100%" }}
                            >
                              Limpiar selección
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── SECCIÓN GRÁFICOS ── */}
          <section style={styles.biContainer} ref={dashboardRef}>
            <h3 style={styles.sectionTitle}>Dashboards</h3>
            <div style={styles.biPlaceholder}>
              {charts.length === 0 && (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "40px", fontSize: "13px" }}>
                  Los gráficos generados aparecerán aquí
                </p>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (!over || active.id === over.id) return;
                  setCharts((prev) => {
                    const oi = prev.findIndex((c) => c.id === active.id);
                    const ni = prev.findIndex((c) => c.id === over.id);
                    if (oi === -1 || ni === -1) return prev;
                    return arrayMove(prev, oi, ni);
                  });
                }}
              >
                <SortableContext items={charts.map((c) => c.id)} strategy={rectSortingStrategy}>
                  <div style={styles.biPlaceholderGrid}>
                    {charts.map((chart) => (
                      <SortableChart
                        key={chart.id}
                        chart={chart}
                        onDelete={removeChart}
                        onResize={toggleSize}
                        onRenameChart={renameChart}
                        deleteMode={deleteMode}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


/* ─── Styles ─────────────────────────────────────────────── */
const styles = {
  wrapper: { position: "relative", height: "100vh", overflow: "hidden", fontFamily: "sans-serif" },
  background: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: `url(${bgImage}) center/cover no-repeat`, filter: "blur(18px) brightness(0.7)", transform: "scale(1.1)", zIndex: -2 },
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(10,15,25,0.65), rgba(255,255,255,0.08))", zIndex: -1 },
  container: { display: "flex", height: "100vh" },
  sidebar: { width: "240px", padding: "20px", background: "rgba(20,25,35,0.55)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" },
  menuItem: { background: "transparent", border: "none", color: "rgba(255,255,255,0.65)", textAlign: "left", padding: "10px", borderRadius: "10px", cursor: "pointer", transition: "0.25s" },
  menuItemHover: { background: "rgba(255,255,255,0.08)", color: "#fff", transform: "translateX(5px)" },
  logout: { padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer" },
  logoutHover: { background: "rgba(255,70,70,0.15)", color: "#ff5c5c" },
  main: { flex: 1, padding: "5px 20px", overflowY: "auto", minHeight: 0 },
  topbar: { display: "flex", justifyContent: "space-between", marginBottom: "25px" },
  // FIX 3: renombrado de "title" a "pageTitle" para evitar colisión con modalTitle del objeto styles
  pageTitle: { color: "#fff", margin: 0 },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: "12px" },
  dashboardSection: { width: "100%", display: "flex", flexDirection: "column", gap: "20px" },
  dashboardRow: { display: "flex", gap: "20px", alignItems: "stretch", width: "80%" },
  leftPanel: { width: "280px", minWidth: "280px", maxWidth: "280px", flex: "0 0 280px", display: "flex", flexDirection: "column" },
  rightPanel: { flex: 1, maxHeight: "40vh", minWidth: 0, display: "flex", flexDirection: "column", paddingLeft: "20px", borderLeft: "1px solid rgba(255,255,255,0.12)", overflowY: "auto" },
  cardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%", alignContent: "start" },
  importCard: { borderRadius: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "5px", padding: "14px", minHeight: "105px" },
  toolCard: { borderRadius: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", padding: "12px", minHeight: "105px", transition: "border-color 0.2s, background 0.2s" },
  chartContainerCard: { padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", overflow: "hidden" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 20px", gap: "10px" },
  emptyTitle: { color: "rgba(255,255,255,0.55)", fontSize: "14px", margin: 0 },
  emptySubtitle: { color: "rgba(255,255,255,0.3)", fontSize: "12px", textAlign: "center", maxWidth: "280px", margin: 0 },
  statusCard: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "10px 14px", borderRadius: "10px", background: "rgba(56,238,56,0.08)", border: "1px solid rgba(56,238,56,0.15)" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#0bcc6c", display: "inline-block" },
  builderRow: { display: "flex", alignItems: "stretch", gap: "15px", marginTop: "10px", minWidth: 0 },
  chartGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(70px, 1fr))", maxWidth: "290px" },
  chartCardAll: { gridColumn: "span 4", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s ease" },
  chartCardSmall: { height: "54px", width: "66px", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s ease" },
  configBox: { display: "flex", flexDirection: "column", gap: "8px", minWidth: "190px" },
  biContainer: { marginTop: "20px" },
  sectionTitle: { color: "rgba(255,255,255,0.7)", fontSize: "12px", marginBottom: "10px" },
  biPlaceholder: { borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.4)", padding: "16px" },
  biPlaceholderGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 500px))", gap: "14px", gridAutoRows: "minmax(150px, auto)" },
  cardTitle: { color: "rgba(255,255,255,0.6)", fontSize: "12px", margin: 0 },
  fileRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  fileBox: { padding: "6px 10px", borderRadius: "18px", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "10px", maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  icExcelBtn: { display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px", transition: "0.25s ease" },
  icExcelImg: { width: "40px", height: "40px", objectFit: "contain" },
  icimportarBtn: { width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(46,204,113,0.25)", backdropFilter: "blur(14px)", cursor: "pointer", boxShadow: "0 6px 15px rgba(0,0,0,0.25)", transition: "0.25s ease" },
  icimportarIconImg: { width: "22px", height: "22px", objectFit: "contain" },
  ichomeBtn: { background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  icflechasBtn: { position: "absolute", top: "50%", left: "94%", transform: "translate(-30%, -30%)", width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 15px rgba(0,0,0,0.25)" },
  icflechasImg: { width: "20px", height: "20px", objectFit: "contain", filter: "brightness(0) invert(1)" },
  columnGrid: { display: "flex", flexWrap: "wrap", gap: "5px", maxWidth: "100%", maxHeight: "120px", overflowY: "auto" },
  columnChip: { padding: "4px 9px", borderRadius: "20px", fontSize: "10px", cursor: "pointer", transition: "0.2s", userSelect: "none", color: "#fff" },

  // FIX 4: claves del modal renombradas para no pisar "title", "text", "button" genéricos
  modalOverlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.35)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 9999,
  },
  modalBox: {
    width: "380px", background: "#fff", borderRadius: "16px",
    padding: "24px", textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalIcon: {
    width: "70px", height: "70px", margin: "0 auto 15px",
    borderRadius: "50%", backgroundColor: "rgba(255,193,7,0.15)",
    display: "flex", justifyContent: "center", alignItems: "center",
    fontSize: "28px", color: "#ffc107",
  },
  modalTitle: {
    fontSize: "18px", fontWeight: "600", marginBottom: "8px",
  },
  modalText: {
    fontSize: "14px", color: "#6c757d",
  },
  modalButton: {
    marginTop: "18px", padding: "8px 16px", border: "none",
    borderRadius: "8px", backgroundColor: "#0d6efd",
    color: "#fff", cursor: "pointer",
  },
};