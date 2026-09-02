<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Esto le dice a Laravel que confíe en el balanceador de Railway
        // para reconocer que la conexión es segura (HTTPS)
        $middleware->trustProxies(at: '*');

        // 1. Middleware de tu frontend (React/Inertia)
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // 2. Excepción de seguridad CSRF para Telegram
        $middleware->validateCsrfTokens(except: [
            'telegram/webhook'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();