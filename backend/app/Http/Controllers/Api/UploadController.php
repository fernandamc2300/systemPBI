<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class UploadController extends Controller
{
    /**
     * PASO 1 — preview
     * Devuelve hasta 30 filas crudas para que el usuario elija el encabezado.
     */
    public function preview(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['status' => 'error', 'msg' => 'No se envió archivo'], 400);
        }

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getPathname());

            // Nombres de todas las hojas
            $sheetNames = [];
            foreach ($spreadsheet->getSheetNames() as $i => $name) {
                $sheetNames[] = ['index' => $i, 'name' => $name];
            }

            $sheetIndex = (int) $request->input('sheet_index', 0);
            $sheet      = $spreadsheet->getSheet($sheetIndex);
            $rows       = $sheet->toArray(null, true, true, false);
            $preview    = array_slice($rows, 0, 30);
            $sugerida   = $this->detectarFilaEncabezado($rows);

            return response()->json([
                'status'           => 'ok',
                'sheets'           => $sheetNames,
                'active_sheet'     => $sheetIndex,
                'rows'             => $preview,
                'total_rows'       => count($rows),
                'suggested_header' => $sugerida,
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'msg' => $e->getMessage()], 500);
        }
    }

    /**
     * PASO 2 — parse
     * El usuario confirmó la fila de encabezado.
     * Devuelve el dataset limpio con los headers reales del Excel.
     */
    public function parse(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['status' => 'error', 'msg' => 'No se envió archivo'], 400);
        }

        $headerRow  = (int) $request->input('header_row', 0);
        $sheetIndex = (int) $request->input('sheet_index', 0);

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getPathname());
            $rows        = $spreadsheet->getSheet($sheetIndex)
                                       ->toArray(null, true, true, false);

            $rawHeader = $rows[$headerRow] ?? [];

            // Mapa índice => nombre de columna (ignorar vacíos)
            $colMap = [];
            foreach ($rawHeader as $i => $nombre) {
                $nombre = trim((string) $nombre);
                if ($nombre !== '') {
                    $colMap[$i] = $nombre;
                }
            }

            $headers = array_values($colMap);
            $data    = [];

            foreach ($rows as $i => $row) {
                if ($i <= $headerRow) continue;

                $registro   = [];
                $tieneValor = false;

                foreach ($colMap as $idx => $nombreCol) {
                    $val   = isset($row[$idx]) ? trim((string) $row[$idx]) : null;
                    $lower = strtolower($nombreCol);

                    // Fecha numérica de Excel
                    if ($val !== null && $val !== '' && is_numeric($val) && (float) $val > 1000) {
                        if (str_contains($lower, 'fecha') || str_contains($lower, 'date')) {
                            try {
                                $val = ExcelDate::excelToDateTimeObject((float) $val)->format('d/m/Y');
                            } catch (\Exception $e) {
                                // dejar el valor como está si falla
                            }
                        }
                    }

                    // Hora HH:MM o HH:MM:SS → decimal
                    if ($val && preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $val)) {
                        $parts = explode(':', $val);
                        $val   = round((int) $parts[0] + ((int) ($parts[1] ?? 0) / 60), 2);
                    }

                    if ($val !== null && $val !== '') $tieneValor = true;
                    $registro[$nombreCol] = $val;
                }

                if ($tieneValor) {
                    $data[] = $registro;
                }
            }

            return response()->json([
                'status'  => 'ok',
                'headers' => $headers,
                'total'   => count($data),
                'data'    => $data,
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'msg' => $e->getMessage()], 500);
        }
    }

    private function detectarFilaEncabezado(array $rows): int
    {
        $keywords = ['NOMBRE','DNI','FECHA','HORA','PLANTA','ORGANISMO','AREA',
                     'CARGO','RUC','EMPRESA','TRABAJADOR','ID','CODIGO',
                     'DESCRIPCION','TOTAL','CANTIDAD','PRECIO','INGRESO','SALIDA'];

        $bestRow = 0; $bestScore = 0;

        foreach ($rows as $i => $row) {
            if ($i > 20) break;
            $texto = strtoupper(implode(' ', array_map('strval', $row)));
            $score = 0;
            foreach ($keywords as $kw) {
                if (str_contains($texto, $kw)) $score++;
            }
            $celdas = count(array_filter($row, fn($v) => $v !== null && $v !== ''));
            $total  = $score + ($celdas > 2 ? 1 : 0);
            if ($total > $bestScore) {
                $bestScore = $total;
                $bestRow   = $i;
            }
        }

        return $bestRow;
    }
}