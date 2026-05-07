<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credenciales = $request->only('email', 'password');

        if (Auth::attempt($credenciales)) {
            return response()->json([
                "mensaje" => "Login correcto",
                "user" => Auth::user()
            ]);
        }

        return response()->json([
            "mensaje" => "Credenciales incorrectas"
        ], 401);
    }
}