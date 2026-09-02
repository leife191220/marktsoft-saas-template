<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\User;
use App\Models\Sale;
use App\Models\Table;

class TelegramBotService
{
    public function __construct(
        protected InventoryDeductionService $deductionService
    ) {}

    public function handleUpdate(array $update): void
    {
        if (isset($update['message'])) {
            $this->processMessage($update['message']);
        } elseif (isset($update['callback_query'])) {
            $this->processCallback($update['callback_query']);
        }
    }

    private function processMessage(array $message): void
    {
        $text = $message['text'] ?? '';
        $chatId = $message['chat']['id'];
        $firstName = $message['from']['first_name'] ?? 'Mesero';

        if (in_array($text, ['/start', '/pedido'])) {
            $this->showAvailableTables($chatId, $firstName);
        }
    }

    private function processCallback(array $callbackQuery): void
    {
        $chatId = $callbackQuery['message']['chat']['id'];
        $data = $callbackQuery['data'];
        $messageId = $callbackQuery['message']['message_id'];
        $callbackId = $callbackQuery['id'];

        $parts = explode('_', $data);
        $action = $parts[0];

        // Patrón Router (Switch/Match) en lugar de IFs anidados
        match ($action) {
            'mesa' => $this->openTable($parts[1], $chatId, $messageId, $callbackId),
            'add' => $this->addItemToOrder($parts[1], $parts[2], $callbackId),
            'view' => $this->viewOrder($parts[1], $chatId, $messageId, $callbackId),
            'checkout' => $this->showCheckoutOptions($parts[1], $chatId, $messageId, $callbackId),
            'pay' => $this->processPayment($parts[1], $parts[2], $chatId, $messageId, $callbackId),
            'remove' => $this->removeItem($parts[1], $parts[2], $chatId, $messageId, $callbackId),
            'cancel' => $this->cancelOrder($parts[1], $chatId, $messageId, $callbackId),
            default => $this->answerCallbackQuery($callbackId, "Acción desconocida"),
        };
    }

    // --- LÓGICA DE NEGOCIO AISLADA ---
    // (Aquí debes pegar el contenido interno de cada bloque IF que tenías,
    // pero encapsulado en estos métodos privados como openTable, viewOrder, etc.)
    // Ejemplo de uno refactorizado:

    private function openTable(int $tableId, int $chatId, int $messageId, string $callbackId): void
    {
        $user = User::first();
        $order = Order::firstOrCreate(
            ['table_id' => $tableId, 'status' => 'open'],
            ['user_id' => $user->id, 'total' => 0]
        );

        Table::where('id', $tableId)->update(['status' => 'occupied']);

        $productos = Product::where('is_active', true)->get();
        $keyboard = ['inline_keyboard' => []];

        foreach ($productos as $producto) {
            $keyboard['inline_keyboard'][] = [
                ['text' => "➕ {$producto->name} ($ " . number_format($producto->sale_price, 0) . ")", 'callback_data' => "add_{$producto->id}_{$order->id}"]
            ];
        }

        $keyboard['inline_keyboard'][] = [['text' => '🛒 Ver Pedido Actual', 'callback_data' => "view_{$order->id}"]];

        $this->editMessageText($chatId, $messageId, "✅ *Mesa {$tableId} (Orden #{$order->id}) abierta.*\nToca los productos:", $keyboard);
        $this->answerCallbackQuery($callbackId);
    }

    // --- MÉTODOS HTTP HACIA TELEGRAM (DRY) ---
    private function sendApiRequest(string $endpoint, array $payload): void
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::withoutVerifying()->post("https://api.telegram.org/bot{$token}/{$endpoint}", $payload);
    }

    private function editMessageText(int $chatId, int $messageId, string $text, array $replyMarkup = null): void
    {
        $payload = ['chat_id' => $chatId, 'message_id' => $messageId, 'text' => $text, 'parse_mode' => 'Markdown'];
        if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
        $this->sendApiRequest('editMessageText', $payload);
    }

    private function answerCallbackQuery(string $callbackQueryId, string $text = null): void
    {
        $payload = ['callback_query_id' => $callbackQueryId];
        if ($text) $payload['text'] = $text;
        $this->sendApiRequest('answerCallbackQuery', $payload);
    }

    // ==========================================
    // LÓGICA DE NEGOCIO AISLADA
    // ==========================================

    private function showAvailableTables(int $chatId, string $firstName): void
    {
        $mesasDisponibles = Table::whereDoesntHave('orders', function($query) {
            $query->where('status', 'open');
        })->orderBy('id')->get();

        if ($mesasDisponibles->isEmpty()) {
            $this->sendApiRequest('sendMessage', [
                'chat_id' => $chatId,
                'text' => "⚠️ Todas las mesas están ocupadas actualmente (o no hay mesas configuradas).\n\nBusca la orden en el historial del chat para agregar más productos."
            ]);
            return;
        }

        $mensaje = "📝 ¿En qué mesa vas a tomar el nuevo pedido, $firstName?\n\n*(Solo se muestran las mesas libres)*";
        $keyboard = ['inline_keyboard' => []];
        $fila = [];

        foreach ($mesasDisponibles as $index => $mesa) {
            $fila[] = ['text' => $mesa->name, 'callback_data' => 'mesa_' . $mesa->id];
            if (count($fila) === 3 || $index === count($mesasDisponibles) - 1) {
                $keyboard['inline_keyboard'][] = $fila;
                $fila = [];
            }
        }

        $this->sendApiRequest('sendMessage', [
            'chat_id' => $chatId,
            'text' => $mensaje,
            'parse_mode' => 'Markdown',
            'reply_markup' => json_encode($keyboard)
        ]);
    }

    private function addItemToOrder(int $productId, int $orderId, string $callbackId): void
    {
        $product = Product::find($productId);
        $order = Order::find($orderId);

        if ($product && $order) {
            $detail = OrderDetail::where('order_id', $order->id)
                                 ->where('product_id', $product->id)
                                 ->first();

            if ($detail) {
                $detail->increment('quantity');
                $detail->increment('subtotal', $product->sale_price);
            } else {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => $product->sale_price,
                    'subtotal' => $product->sale_price,
                    'status' => 'pending'
                ]);
            }

            $order->increment('total', $product->sale_price);
            $this->answerCallbackQuery($callbackId, "✅ Agregado: 1x {$product->name}");
        }
    }

    private function viewOrder(int $orderId, int $chatId, int $messageId, string $callbackId): void
    {
        $order = Order::with('details.product')->find($orderId);

        if ($order) {
            $resumen = "🧾 *RESUMEN ORDEN #{$order->id}*\n\n";

            foreach ($order->details as $d) {
                $resumen .= "• {$d->quantity}x {$d->product->name} - $" . number_format($d->subtotal, 0, ',', '.') . "\n";
            }

            $resumen .= "\n💵 *TOTAL: $" . number_format($order->total, 0, ',', '.') . "*\n\n_¿Te equivocaste? Usa los botones ❌ abajo para restar 1 unidad:_";

            $keyboard = ['inline_keyboard' => []];
            $filaRestar = [];

            foreach ($order->details as $d) {
                $filaRestar[] = ['text' => "❌ 1x {$d->product->name}", 'callback_data' => "remove_{$d->product_id}_{$order->id}"];
                if (count($filaRestar) === 2) {
                    $keyboard['inline_keyboard'][] = $filaRestar;
                    $filaRestar = [];
                }
            }
            if (!empty($filaRestar)) { $keyboard['inline_keyboard'][] = $filaRestar; }

            $keyboard['inline_keyboard'][] = [['text' => '🔙 Seguir Pidiendo', 'callback_data' => "mesa_{$order->table_id}"]];

            if ($order->total > 0) {
                $keyboard['inline_keyboard'][] = [['text' => '💳 FINALIZAR Y PAGAR', 'callback_data' => "checkout_{$order->id}"]];
            }

            $keyboard['inline_keyboard'][] = [['text' => '🗑️ CANCELAR PEDIDO', 'callback_data' => "cancel_{$order->id}"]];

            $this->editMessageText($chatId, $messageId, $resumen, $keyboard);
            $this->answerCallbackQuery($callbackId);
        }
    }

    private function showCheckoutOptions(int $orderId, int $chatId, int $messageId, string $callbackId): void
    {
        $mensaje = "💳 *¿Cómo pagó el cliente la Orden #{$orderId}?*";
        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '💵 Efectivo', 'callback_data' => "pay_{$orderId}_efectivo"],
                    ['text' => '📱 Transf/Nequi', 'callback_data' => "pay_{$orderId}_transferencia"]
                ],
                [
                    ['text' => '💳 Datáfono', 'callback_data' => "pay_{$orderId}_tarjeta"],
                    ['text' => '❌ Volver', 'callback_data' => "view_{$orderId}"]
                ]
            ]
        ];

        $this->editMessageText($chatId, $messageId, $mensaje, $keyboard);
        $this->answerCallbackQuery($callbackId);
    }

    private function processPayment(int $orderId, string $paymentMethod, int $chatId, int $messageId, string $callbackId): void
    {
        $order = Order::with('details.product')->find($orderId);

        if ($order && $order->status === 'open') {
            foreach ($order->details as $detail) {
                if ($detail->product) {
                    $this->deductionService->deductFromRecipe(
                        $detail->product,
                        $detail->quantity,
                        $order->user_id,
                        "Telegram Orden #{$order->id}"
                    );
                }
            }

            $order->update(['status' => 'closed']);

            Sale::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'total' => $order->total,
                'payment_method' => $paymentMethod,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            Table::where('id', $order->table_id)->update(['status' => 'available']);

            $mensajeFinal = "🏁 *Orden #{$orderId} Finalizada*\n💳 Método: " . ucfirst($paymentMethod) . "\n💰 Venta registrada: $" . number_format($order->total, 0, ',', '.') . "\n\nLa mesa ha sido liberada.";

            $this->editMessageText($chatId, $messageId, $mensajeFinal);
            $this->answerCallbackQuery($callbackId, "Venta registrada con éxito");
        }
    }

    private function removeItem(int $productId, int $orderId, int $chatId, int $messageId, string $callbackId): void
    {
        $order = Order::find($orderId);
        $detail = OrderDetail::where('order_id', $orderId)->where('product_id', $productId)->first();

        if ($order && $detail && $order->status === 'open') {
            $order->decrement('total', $detail->unit_price);

            if ($detail->quantity > 1) {
                $detail->decrement('quantity');
                $detail->decrement('subtotal', $detail->unit_price);
                $this->answerCallbackQuery($callbackId, "➖ Se restó 1x {$detail->product->name}");
            } else {
                $nombreProducto = $detail->product->name;
                $detail->delete();
                $this->answerCallbackQuery($callbackId, "❌ Se eliminó {$nombreProducto} de la cuenta");
            }

            // Aplicación de DRY: Redibujamos la vista reciclando el método existente
            $this->viewOrder($orderId, $chatId, $messageId, $callbackId);
        }
    }

    private function cancelOrder(int $orderId, int $chatId, int $messageId, string $callbackId): void
    {
        $order = Order::find($orderId);

        if ($order && $order->status === 'open') {
            $tableId = $order->table_id;

            OrderDetail::where('order_id', $order->id)->delete();
            $order->delete();

            Table::where('id', $tableId)->update(['status' => 'available']);

            $this->editMessageText($chatId, $messageId, "🗑️ *Pedido Cancelado*\n\nLa orden #{$orderId} fue eliminada y la mesa está libre nuevamente.");
            $this->answerCallbackQuery($callbackId, "Pedido cancelado y mesa liberada.");
        } else {
            $this->answerCallbackQuery($callbackId, "La orden ya no existe o está cerrada.");
        }
    }
}
