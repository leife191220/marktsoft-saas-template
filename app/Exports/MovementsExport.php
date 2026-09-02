<?php

namespace App\Exports;

use App\Services\FinancialReportService;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MovementsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected array $filters,
        protected FinancialReportService $reportService
    ) {}

    public function collection()
    {
        return $this->reportService->listMovements($this->filters, 5000);
    }

    public function headings(): array
    {
        return ['Fecha', 'Hora', 'Tipo', 'Responsable', 'Detalle de Productos', 'Ingreso (+)', 'Egreso (-)'];
    }

    public function map($row): array
    {
        $fecha = \Carbon\Carbon::parse($row->fecha);
        $isVenta = $row->tipo_clase === 'venta';

        return [
            $fecha->format('d/m/Y'),
            $fecha->format('h:i A'),
            $row->tipo_etiqueta,
            $row->responsable,
            $row->detalle,
            $isVenta ? $row->monto : '',
            !$isVenta ? $row->monto : '',
        ];
    }
}
