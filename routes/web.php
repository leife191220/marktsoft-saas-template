<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\DailyClosureController;
use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MeasureUnitController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\TableController;
use App\Http\Controllers\PurchaseController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Ruta pública para mantener el servidor de Render despierto
Route::get('/ping', function () {
    return response('pong', 200);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    // 1. Catálogo e Inventario
    Route::resource('products', ProductController::class);
    Route::resource('ingredients', IngredientController::class);
    Route::post('/ingredients/{ingredient}/add-stock', [IngredientController::class, 'addStock'])->name('ingredients.add-stock');
    Route::post('/ingredients/import', [IngredientController::class, 'import'])->name('ingredients.import');
    Route::post('/products/{product}/recipe', [ProductController::class, 'updateRecipe'])->name('products.recipe.update');

    // 2. Servicio y Mesas
    Route::resource('orders', OrderController::class)->only(['index', 'store','show']);
    Route::post('/orders/{order}/add-item', [OrderController::class, 'addItem'])->name('orders.add-item');
    Route::resource('tables', TableController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::delete('/orders/{order}/remove-item/{orderDetail}', [OrderController::class, 'removeItem'])->name('orders.remove-item');
    Route::delete('/orders/{order}', [OrderController::class, 'destroyOrder'])->name('orders.destroy-order');

    // 3. Facturación
    Route::post('/orders/{order}/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    // 4. Finanzas
    Route::resource('expenses', ExpenseController::class)->except(['show']);
    Route::resource('closures', DailyClosureController::class)->only(['index', 'store']);

    // 5. Operativo
    Route::resource('checklists', ChecklistController::class)->only(['index', 'store']);

    // 6. Configuraciones
    // Configuraciones del Sistema (Salarios, etc.)
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

    // 7. Configuraciones maestras (Categorías y Unidades)
    Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
    Route::resource('measure-units', MeasureUnitController::class)->except(['create', 'edit', 'show']);

    // 8. Ventas
    Route::get('/pos', [SaleController::class, 'create'])->name('pos.index');
    Route::post('/pos/charge', [SaleController::class, 'store'])->name('pos.store');

    // 9. Módulo de Proveedores
    Route::resource('suppliers', SupplierController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);

    // 10. Módulo de ventas
    Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt'])->name('sales.receipt');

   // 11. Módulo de compras
    // Rutas del Módulo de Compras / Ingreso de Mercancía
    Route::get('/purchases', [PurchaseController::class, 'index'])->name('purchases.index');
    Route::get('/purchases/create', [PurchaseController::class, 'create'])->name('purchases.create');
    Route::post('/purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::post('/purchases/scan-invoice', [PurchaseController::class, 'scanInvoice'])->name('purchases.scan');

    // 👇 ESTAS SON LAS DOS RUTAS NUEVAS FALTANTES 👇
    Route::get('/purchases/{purchase}/edit', [PurchaseController::class, 'edit'])->name('purchases.edit');
    Route::put('/purchases/{purchase}', [PurchaseController::class, 'update'])->name('purchases.update');
    // 👆 ========================================= 👆

    Route::delete('/purchases/{id}', [PurchaseController::class, 'destroy'])->name('purchases.destroy');


    // Módulo de Reportes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/movements', [ReportController::class, 'movements'])->name('reports.movements');
    Route::get('/reports/z-closure', [ReportController::class, 'zClosure'])->name('reports.z_closure');
    Route::post('/reports/analyze-historical', [App\Http\Controllers\ReportController::class, 'analyzeHistorical'])->name('reports.analyze-historical');
    Route::post('/reports/import-historical', [App\Http\Controllers\ReportController::class, 'importHistorical'])->name('reports.import-historical');
});

// 1. La ruta oficial que recibe los mensajes de Telegram
Route::post('/telegram/webhook', [TelegramController::class, 'handleWebhook']);

// 2. La ruta configuradora
Route::get('/set-telegram-webhook', function () {
    $token = env('TELEGRAM_BOT_TOKEN');

    // Concatenamos la URL de Ngrok con la ruta exacta de arriba
    $webhookUrl = env('TELEGRAM_WEBHOOK_URL') . '/telegram/webhook';

    $response = Http::get("https://api.telegram.org/bot{$token}/setWebhook?url={$webhookUrl}");

    return $response->json();
});

require __DIR__.'/auth.php';

Route::get('/factory-reset-db', function () {
    // TRUNCATE vacía las tablas.
    // RESTART IDENTITY vuelve los IDs a 1.
    // CASCADE fuerza el borrado de cualquier tabla hija que dependa de estas.
    \Illuminate\Support\Facades\DB::statement('
        TRUNCATE TABLE
            inventory_transactions,
            order_details,
            purchase_items,
            recipes,
            sales,
            orders,
            purchases,
            expenses,
            daily_closures,
            products,
            ingredients
        RESTART IDENTITY CASCADE;
    ');

    return "¡Limpieza profunda completada! El sistema está en cero. Se conservaron Usuarios, Categorías, Unidades, Proveedores y Mesas.";
});
