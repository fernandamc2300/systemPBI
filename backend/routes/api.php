<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UploadController;


Route::get('/test', function () {
    return response()->json([
        "mensaje" => "Laravel 12 conectado 🚀"
    ]);
});

//LOGIN

Route::post('/login', [AuthController::class, 'login']);

//Subir excel
Route::post('/upload', [UploadController::class, 'upload']);
// PASO 1: previsualizar las filas crudas del Excel
Route::post('/preview', [UploadController::class, 'preview']);
 
// PASO 2: parsear con la fila de encabezado que eligió el usuario
Route::post('/parse',   [UploadController::class, 'parse']);
 


Route::post('/upload-test', function() {
    return response()->json(['status' => 'ok', 'msg' => 'ruta viva']);

 
});