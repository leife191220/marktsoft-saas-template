<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\TelegramBotService;
use Illuminate\Support\Facades\Log;

class TelegramController extends Controller
{
    public function __construct(
        protected TelegramBotService $telegramService
    ) {}

    public function handleWebhook(Request $request): JsonResponse
    {
        Log::info('Telegram Update Recibido:', $request->all());

        try {
            $this->telegramService->handleUpdate($request->all());
        } catch (\Throwable $e) {
            Log::error('Error procesando webhook de Telegram: ' . $e->getMessage());
        }

        // Siempre se debe responder 200 a Telegram para evitar retries infinitos
        return response()->json(['status' => 'ok']);
    }
}
