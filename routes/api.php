<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelegramController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Ruta que escuchará a Telegram
Route::post('/telegram/webhook', [TelegramController::class, 'handleWebhook']);