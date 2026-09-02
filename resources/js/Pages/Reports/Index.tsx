import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { formatCurrency } from '@/Utils/formatters';
import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Definimos la estructura exacta que tu backend envía para el reporte
interface ProfitabilityReport {
    month: string;
    percentage: number;
    sales: number;
    break_even_point: number;
    is_profitable: boolean;
    remaining_to_break_even: number;
    net_cash_flow: number;
}

interface Props extends PageProps {
    report: ProfitabilityReport;
}

export default function Index({ auth, report }: Props) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-2xl font-black text-white leading-tight">
                    Análisis de Rentabilidad <span className="text-indigo-400 font-medium">| {report.month}</span>
                </h2>
            }
        >
            <Head title="Reportes" />

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* TARJETA: PUNTO DE EQUILIBRIO */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                Meta: {report.percentage}%
                            </span>
                        </div>

                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            Progreso Punto de Equilibrio
                        </h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Ventas Actuales</p>
                                    <span className="text-4xl font-black text-white">{formatCurrency(report.sales)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-xs mb-1">Meta de Ventas</p>
                                    <span className="text-lg font-bold text-slate-400">{formatCurrency(report.break_even_point)}</span>
                                </div>
                            </div>

                            {/* BARRA DE PROGRESO NEÓN */}
                            <div className="relative w-full bg-slate-900 h-6 rounded-full p-1 border border-slate-700 shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.4)] ${
                                        report.is_profitable ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-indigo-500'
                                    }`}
                                    style={{ width: `${Math.min(report.percentage, 100)}%`, minWidth: '1%' }}
                                >
                                    <div className="w-full h-full bg-white/10" />
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border ${
                                report.is_profitable
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-900/50 border-slate-700 text-slate-400'
                            }`}>
                                <p className="text-sm">
                                    {report.is_profitable
                                        ? `🚀 ¡Excelente ${auth.user.name.split(' ')[0]}! El negocio ya cubrió sus costos totales. Cada venta de ahora es ganancia pura.`
                                        : `Faltan ${formatCurrency(report.remaining_to_break_even)} en ventas para alcanzar el equilibrio financiero.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TARJETA: FLUJO NETO */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-xl flex flex-col justify-center relative overflow-hidden">
                         {/* Decoración de fondo */}
                         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">Caja Real (Flujo Neto)</h3>
                        <div className="flex items-center gap-6">
                            <div className={`p-5 rounded-2xl shadow-lg ${
                                report.net_cash_flow >= 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs mb-1 uppercase font-bold">Saldo disponible</p>
                                <h2 className="text-5xl font-black text-white">{formatCurrency(report.net_cash_flow)}</h2>
                                <p className="text-slate-400 text-sm mt-2">Deducidos gastos de operación y casa.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COMPONENTE DE AUDITORÍA DE EXCEL */}
                <HistoricalImportAuditor />
            </div>
        </AuthenticatedLayout>
    );
}

export function HistoricalImportAuditor() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysis(null); // Resetea el análisis si cambian el archivo
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsAnalyzing(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(route('reports.analyze-historical'), formData);
            setAnalysis(res.data);
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Ups, algo falló',
                text: 'Error al leer el archivo. Asegúrate de que sea el formato correcto.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#EF4444',
                background: '#1F2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-xl border border-gray-700' }
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        
        if (analysis?.missing_count > 0) {
            Swal.fire({
                title: 'Atención',
                text: 'Por favor, resuelve las discrepancias de productos en la carta antes de importar.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#F59E0B',
                background: '#1F2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-xl border border-gray-700' }
            });
            return;
        }

        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción guardará permanentemente todas las comandas en la base de datos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, importar',
            cancelButtonText: 'Cancelar',
            background: '#1F2937',
            color: '#ffffff',
            customClass: { popup: 'rounded-xl border border-gray-700' }
        });

        if (!confirmacion.isConfirmed) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(route('reports.import-historical'), formData);
            
            await Swal.fire({
                title: '¡Importación Exitosa!',
                text: res.data.message || "Los reportes han sido actualizados.",
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#4F46E5',
                background: '#1F2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-xl border border-gray-700' }
            });

            // Limpiamos los estados
            setAnalysis(null);
            setFile(null);

            // Recargamos la página usando Inertia para actualizar los gráficos de rentabilidad
            router.reload();
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error de Importación',
                text: 'Hubo un problema guardando los datos en el servidor.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#EF4444',
                background: '#1F2937',
                color: '#ffffff',
                customClass: { popup: 'rounded-xl border border-gray-700' }
            });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="mt-12 bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Auditoría e Importación de Histórico (Excel)
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-2xl">
                Antes de importar meses de ventas, sube el Control Diario aquí. El sistema cruzará los productos escritos a mano con la carta actual para decirte qué productos debes crear primero.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="block w-full md:w-auto text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all cursor-pointer"
                />
                <button
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing || isImporting}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors w-full md:w-auto"
                >
                    {isAnalyzing ? 'Analizando...' : '1. Cruzar Datos'}
                </button>
            </div>

            {/* RESULTADOS DEL ANÁLISIS */}
            {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-700 pt-6 animate-in fade-in">

                    {/* ENCONTRADOS */}
                    <div className="bg-slate-900/50 rounded-2xl p-5 border border-emerald-500/20">
                        <h4 className="text-emerald-400 font-bold mb-3 flex items-center justify-between">
                            ✅ Coincidencias Exactas
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-xs">{analysis.matched_count} items</span>
                        </h4>
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-1">
                            {analysis.matched.map((item: string, i: number) => (
                                <div key={i} className="text-xs text-slate-300 py-1 border-b border-slate-800 last:border-0">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FALTANTES */}
                    <div className="bg-slate-900/50 rounded-2xl p-5 border border-rose-500/20">
                        <h4 className="text-rose-400 font-bold mb-3 flex items-center justify-between">
                            ❌ Productos Faltantes en la Carta
                            <span className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg text-xs">{analysis.missing_count} items</span>
                        </h4>
                        {analysis.missing_count === 0 ? (
                            <p className="text-sm text-slate-400 italic mt-4">¡Todo perfecto! Todos los productos del Excel existen en el sistema.</p>
                        ) : (
                            <>
                                <p className="text-[10px] text-slate-500 mb-2 leading-tight">Estos productos están en el Excel pero NO en tu base de datos actual. Debes crearlos en la Carta antes de importar.</p>
                                <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                                    {analysis.missing.map((item: string, i: number) => (
                                        <div key={i} className="text-xs text-rose-300/70 py-1 border-b border-slate-800 last:border-0">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* BOTÓN DE IMPORTACIÓN CONDICIONAL */}
                    <div className="col-span-1 lg:col-span-2 mt-2">
                        <button
                            onClick={handleImport}
                            disabled={analysis.missing_count > 0 || isImporting}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                analysis.missing_count > 0
                                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            }`}
                        >
                            {isImporting ? (
                                'Importando a la Base de Datos...'
                            ) : analysis.missing_count > 0 ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Crea los {analysis.missing_count} productos faltantes para habilitar la importación
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    2. Confirmar e Importar Historial
                                </>
                            )}
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}