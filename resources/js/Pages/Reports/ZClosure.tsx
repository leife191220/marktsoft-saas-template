import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface ClosureMetrics {
    total_sales: number;
    sales_count: number;
    total_expenses: number;
    expected_cash: number;
    sales_by_method: {
        efectivo: number;
        nequi: number;
        daviplata: number;
    };
}

interface Props extends PageProps {
    reportDate: string;
    metrics: ClosureMetrics;
}

export default function ZClosure({ auth, reportDate, metrics }: Props) {
    const [selectedDate, setSelectedDate] = useState(reportDate);

    // Recargar el reporte con la nueva fecha
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        router.get(route('reports.z_closure'), { date: newDate }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Reportes <span className="text-indigo-400">| Cierre de Caja (Z)</span>
                    </h2>

                    {/* Botones de Acción (Ocultos al imprimir) */}
                    <div className="flex gap-4 print:hidden">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500 shadow-inner"
                        />
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Imprimir Cuadre
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Cierre de Caja" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 text-slate-300 print:bg-white print:text-black print:p-0 print:min-h-0">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">

                    {/* VISTA DE PANTALLA (Dashboards) - Se oculta al imprimir */}
                    <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ingresos Brutos</p>
                            <h3 className="text-3xl font-black text-emerald-400">{formatCurrency(metrics.total_sales)}</h3>
                            <p className="text-xs text-slate-500 mt-2">{metrics.sales_count} ventas realizadas</p>
                        </div>
                        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl shadow-xl text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Salidas (Efectivo)</p>
                            <h3 className="text-3xl font-black text-rose-400">{formatCurrency(metrics.total_expenses)}</h3>
                            <p className="text-xs text-slate-500 mt-2">Gastos y compras operativas</p>
                        </div>
                        <div className="bg-indigo-600/10 border border-indigo-500/30 p-6 rounded-2xl shadow-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Efectivo en Gaveta</p>
                            <h3 className="text-3xl font-black text-white relative z-10">{formatCurrency(metrics.expected_cash)}</h3>
                            <p className="text-xs text-indigo-300/50 mt-2 relative z-10">Total a entregar en caja</p>
                        </div>
                    </div>

                    {/* VISTA DE IMPRESIÓN (Estilo Tirilla Térmica) */}
                    <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl print:shadow-none print:border-none print:p-0 print:bg-white print:max-w-full">

                        <div className="text-center mb-8 border-b border-slate-700 print:border-black pb-6 border-dashed">
                            <h1 className="text-2xl font-black text-white print:text-black uppercase tracking-widest">La Estación</h1>
                            <p className="text-sm text-slate-400 print:text-black mt-1">Reporte Z - Cierre Diario</p>
                            <p className="text-xs text-slate-500 print:text-black mt-2 font-mono">Fecha: {selectedDate}</p>
                            <p className="text-xs text-slate-500 print:text-black font-mono">Generado por: {auth.user.name}</p>
                        </div>

                        <div className="space-y-6 font-mono text-sm">

                            {/* SECCIÓN INGRESOS */}
                            <div>
                                <h4 className="font-bold text-white print:text-black border-b border-slate-700 print:border-black mb-3 pb-1">INGRESOS POR VENTAS</h4>
                                <div className="flex justify-between mb-1 text-slate-300 print:text-black">
                                    <span>Efectivo</span>
                                    <span>{formatCurrency(metrics.sales_by_method.efectivo)}</span>
                                </div>
                                <div className="flex justify-between mb-1 text-slate-300 print:text-black">
                                    <span>Nequi</span>
                                    <span>{formatCurrency(metrics.sales_by_method.nequi)}</span>
                                </div>
                                <div className="flex justify-between mb-1 text-slate-300 print:text-black">
                                    <span>Daviplata</span>
                                    <span>{formatCurrency(metrics.sales_by_method.daviplata)}</span>
                                </div>
                                <div className="flex justify-between mt-3 pt-3 border-t border-slate-700 print:border-black font-bold text-emerald-400 print:text-black">
                                    <span>TOTAL VENTAS ({metrics.sales_count})</span>
                                    <span>{formatCurrency(metrics.total_sales)}</span>
                                </div>
                            </div>

                            {/* SECCIÓN SALIDAS */}
                            <div>
                                <h4 className="font-bold text-white print:text-black border-b border-slate-700 print:border-black mb-3 pb-1">SALIDAS DE CAJA</h4>
                                <div className="flex justify-between mb-1 text-slate-300 print:text-black">
                                    <span>Gastos/Compras (Efectivo)</span>
                                    <span className="text-rose-400 print:text-black">-{formatCurrency(metrics.total_expenses)}</span>
                                </div>
                            </div>

                            {/* GRAN TOTAL */}
                            <div className="mt-8 pt-6 border-t-2 border-slate-600 print:border-black border-dashed">
                                <div className="flex justify-between items-center bg-slate-900 print:bg-transparent p-4 rounded-xl print:p-0">
                                    <span className="font-black text-white print:text-black">EFECTIVO A ENTREGAR</span>
                                    <span className="text-xl font-black text-white print:text-black">{formatCurrency(metrics.expected_cash)}</span>
                                </div>
                                <p className="text-[10px] text-center text-slate-500 mt-4 uppercase">(Base Inicial: $0)</p>
                            </div>

                        </div>

                        {/* ESPACIO PARA FIRMAS (Solo visible al imprimir) */}
                        <div className="hidden print:block mt-20 pt-10">
                            <div className="flex justify-between px-10">
                                <div className="text-center w-40">
                                    <div className="border-b border-black mb-2 h-10"></div>
                                    <p className="text-xs font-bold">Entrega</p>
                                </div>
                                <div className="text-center w-40">
                                    <div className="border-b border-black mb-2 h-10"></div>
                                    <p className="text-xs font-bold">Recibe</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* Estilos para forzar una impresión limpia */}
            <style>{`
                @media print {
                    body { background-color: white !important; }
                    @page { margin: 1cm; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
