<?php

namespace App\Http\Controllers;

use App\Services\FinancialReportService;
use App\Services\HistoricalImportService;
use App\Exports\MovementsExport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Exception;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(
        protected FinancialReportService $reportService,
        protected HistoricalImportService $historicalImportService
    ) {}

    public function index(Request $request): Response
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        return Inertia::render('Reports/Index', [
            'report' => $this->reportService->getMonthlySummary((int)$year, (int)$month),
            'filters' => compact('month', 'year')
        ]);
    }

    public function movements(Request $request): Response|BinaryFileResponse
    {
        $filters = $request->only(['start_date', 'end_date', 'type']);

        if ($request->has('export')) {
            $filename = "kardex_la_estacion_" . now()->format('Y-m-d_Hi') . ".xlsx";
            return Excel::download(new MovementsExport($filters, $this->reportService), $filename);
        }

        return Inertia::render('Reports/Movements', [
            'movements' => $this->reportService->listMovements($filters),
            'filters' => $filters
        ]);
    }

    public function zClosure(Request $request): Response
    {
        $date = $request->query('date', Carbon::today()->toDateString());

        return Inertia::render('Reports/ZClosure', [
            'reportDate' => $date,
            'metrics' => $this->reportService->getZClosureMetrics($date)
        ]);
    }

    /**
     * Recibe el archivo Excel y retorna el análisis de cruce de productos.
     */
    public function analyzeHistorical(Request $request): JsonResponse
    {
        $this->extendExecutionLimits();

        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240',
        ]);

        try {
            $analysisResult = $this->historicalImportService->analyzeFile($request->file('file'));
            return response()->json($analysisResult);
        } catch (Exception $e) {
            Log::error('Fallo en análisis de Excel: ' . $e->getMessage());

            return response()->json([
                'error' => 'Hubo un problema procesando el archivo.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesa e importa definitivamente el Excel a la Base de Datos.
     */
    public function importHistorical(Request $request): JsonResponse
    {
        $this->extendExecutionLimits();

        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240'
        ]);

        try {
            $result = $this->historicalImportService->importData($request->file('file'));
            return response()->json($result);
        } catch (Exception $e) {
            Log::error('Fallo en importación masiva: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error interno de importación.',
                'debug_error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Amplía los límites del servidor para operaciones pesadas con Excel.
     */
    private function extendExecutionLimits(): void
    {
        set_time_limit(300); // 5 minutos
        ini_set('memory_limit', '256M');
    }
}
