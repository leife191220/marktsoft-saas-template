<?php

namespace App\Services;

class CashRegisterService
{
    // Este servicio se puede expandir luego para manejar "Retiros Parciales" a mitad de turno
    // o "Ingreso de Base" al abrir el bar. Por ahora, encapsula la lógica financiera temporal.

    public function calculateExpectedCash(float $baseCash, float $cashSales, float $cashExpenses): float
    {
        return ($baseCash + $cashSales) - $cashExpenses;
    }
}
