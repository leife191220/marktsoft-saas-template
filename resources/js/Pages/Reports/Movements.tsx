import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { PageProps, PaginatedData } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface MovementRecord {
    fecha: string;
    tipo_clase: 'venta' | 'gasto_personal' | 'gasto_negocio' | string;
    tipo_etiqueta: string;
    monto: number;
    detalle: string;
    responsable: string;
}

interface Filters {
    start_date?: string;
    end_date?: string;
    type?: string;
}

interface Props extends PageProps {
    movements: PaginatedData<MovementRecord>;
    filters: Filters;
}

export default function Movements({ auth, movements, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [type, setType] = useState(filters.type || 'all');

    const handleFilter = () => {
        router.get(route('reports.movements'), {
            start_date: startDate,
            end_date: endDate,
            type: type
        }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = route('reports.movements', { ...filters, export: 1 } as any);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-black text-white leading-tight">Auditoría Financiera <span className="text-indigo-400">| Historial Detallado</span></h2>}
        >
            <Head title="Kardex de Caja" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* FILTROS AVANZADOS */}
                <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 mb-8 flex flex-wrap gap-6 items-end backdrop-blur-sm shadow-xl">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rango de Fechas</label>
                        <div className="flex gap-2">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-900 border-slate-700 text-white rounded-xl text-sm focus:ring-indigo-500" />
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-900 border-slate-700 text-white rounded-xl text-sm focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Filtrar por Categoría</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full bg-slate-900 border-slate-700 text-white rounded-xl text-sm font-bold focus:ring-indigo-500"
                        >
                            <option value="all">🌐 Todos los Movimientos</option>
                            <option value="ventas">💰 Solo Ventas (Ingresos)</option>
                            <option value="gastos_negocio">🏬 Gastos de Operación</option>
                            <option value="gastos_personales">🏠 Gastos Personales (Casa)</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-500/20">Aplicar</button>
                        <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                            📥 Excel
                        </button>
                    </div>
                </div>

                {/* TABLA ESTILO KARDEX */}
                <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl border-b-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                                    <th className="px-6 py-5">Fecha / Hora</th>
                                    <th className="px-6 py-5 text-center">Clasificación</th>
                                    <th className="px-6 py-5">Monto Neto</th>
                                    <th className="px-6 py-5">Detalle / Motivo</th>
                                    <th className="px-6 py-5">Auditado por</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {movements.data.map((m: MovementRecord, i: number) => (
                                    <tr key={i} className="hover:bg-slate-700/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-200 font-bold">{new Date(m.fecha).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-slate-500">{new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border tracking-tighter ${
                                                m.tipo_clase === 'venta' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                m.tipo_clase === 'gasto_personal' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {m.tipo_etiqueta}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-black text-base ${m.tipo_clase === 'venta' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {m.tipo_clase === 'venta' ? '+' : '-'}{formatCurrency(m.monto)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{m.detalle}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white">{m.responsable?.charAt(0)}</div>
                                                <span className="text-xs text-slate-300 font-bold">{m.responsable}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-8 bg-slate-900/30 border-t border-slate-700">
                        <Pagination links={movements.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
