import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, expenses, categories, suppliers, flash }: any) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        expense_date: today,
        description: '',
        amount: '',
        category_id: '',
        supplier_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('expenses.store'), {
            onSuccess: () => {
                reset();
                setIsFormOpen(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black leading-tight text-white tracking-tight flex items-center gap-3">
                        <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Flujo de Caja <span className="text-rose-400">| Gastos</span>
                    </h2>
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="inline-flex justify-center items-center px-4 py-2 bg-orange-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/30"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFormOpen ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                        </svg>
                        {isFormOpen ? 'Cerrar Registro' : '+ Registrar Gasto'}
                    </button>
                </div>
            }
        >
            <Head title="Gastos y Flujo de Caja" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative overflow-hidden text-slate-300">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">

                    {/* MENSAJE FLASH: ADVERTENCIA (AHORA CON AMARILLO TENUE DE FONDO) */}
                    {flash?.warning && (
                        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center shadow-lg shadow-yellow-500/10">
                            <svg className="w-6 h-6 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm font-bold tracking-tight">
                                {flash.warning}
                            </span>
                        </div>
                    )}

                    {/* MENSAJE FLASH: ÉXITO (VERDE TENUE) */}
                    {flash?.success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center shadow-lg shadow-emerald-500/10">
                            <svg className="w-6 h-6 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold tracking-tight">{flash.success}</span>
                        </div>
                    )}

                    {/* FORMULARIO DE REGISTRO */}
                    {isFormOpen && (
                        <div className="mb-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Descripción</label>
                                        <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-orange-500 focus:ring-0 px-4 py-2" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor ($)</label>
                                        <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-orange-400 font-black focus:border-orange-500 focus:ring-0 px-4 py-2" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fecha</label>
                                        <input type="date" value={data.expense_date} onChange={e => setData('expense_date', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-orange-500 focus:ring-0 px-4 py-2" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Categoría</label>
                                        <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-orange-500 focus:ring-0 px-4 py-2">
                                            <option value="">Seleccione...</option>
                                            {categories?.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Proveedor</label>
                                        <select value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-orange-500 focus:ring-0 px-4 py-2">
                                            <option value="">Ninguno...</option>
                                            {suppliers?.map((s: any) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex justify-center items-center px-4 py-2 bg-orange-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
                                        >
                                            {processing ? '...' : 'Guardar Gasto'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TABLA DE GASTOS */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold border-r border-slate-700/30 text-center">Fecha / Registro</th>
                                        <th className="px-6 py-4 font-semibold">Descripción</th>
                                        <th className="px-6 py-4 font-semibold text-center border-x border-slate-700/30">Categoría</th>
                                        <th className="px-6 py-4 font-semibold">Proveedor</th>
                                        <th className="px-6 py-4 font-semibold text-right bg-slate-900/30">Valor Pagado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {expenses?.data?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest opacity-30">
                                                Sin registros
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses?.data?.map((expense: any) => (
                                            <tr key={expense.id} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="px-6 py-4 border-r border-slate-700/30 text-center">
                                                    <div className="text-white font-medium">{expense.expense_date}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase mt-1 tracking-tighter italic">Por: {expense.user?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-white uppercase text-sm tracking-tight italic">
                                                    {expense.description}
                                                </td>
                                                <td className="px-6 py-4 text-center border-x border-slate-700/30">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${expense.category?.is_personal ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                                                        {expense.category?.name || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-sm font-medium italic">
                                                    {expense.supplier?.name || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-right bg-slate-900/20">
                                                    <div className="text-lg font-black text-rose-500">
                                                        ${Number(expense.amount).toLocaleString('es-CO')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
