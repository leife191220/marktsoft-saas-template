<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $dashboardService;

    // Inyectamos el servicio siguiendo la arquitectura del proyecto
    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        $metrics = $this->dashboardService->getMonthlyKPIs();

        //dd($metrics);
        return Inertia::render('Dashboard', [
            'metrics' => $metrics
        ]);
    }
}