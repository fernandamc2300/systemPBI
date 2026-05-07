const BASE = "http://127.0.0.1:8000";

// PASO 1: devuelve las filas crudas para previsualizar
export const previewExcel = async (file, sheetIndex = 0) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sheet_index", sheetIndex); // 🔥 ESTE ES EL FIX

  const res = await fetch(`${BASE}/api/preview`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

export const parseExcel = async (file, headerRow, sheetIndex = 0) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("header_row", headerRow);
  formData.append("sheet_index", sheetIndex);  // ← esto faltaba

  const res = await fetch(`${BASE}/api/parse`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

