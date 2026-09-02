import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Supplier } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

export interface Purchase {
    id: number;
    invoice_number: string | null;
    purchase_date: string;
    total_amount: number;
    payment_method: string;
    supplier: Supplier;
    items_count: number;
}

interface Props extends PageProps {
    purchases: { data: Purchase[] } | Purchase[];
}

export default function Index({ auth, purchases, flash = {} }: Props) {
    // Manejo seguro tanto de arrays planos como de colecciones paginadas
    const purchasesList = Array.isArray(purchases) ? purchases : (purchases?.data || []);

    const handleDelete = (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta factura? Esto borrará el registro de las compras asociadas.')) {
            router.delete(route('purchases.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                        Inventario <span className="text-emerald-400">| Ingreso de Mercancía</span>
                    </h2>
                    <Link
                        href={route('purchases.create')}
                        className="inline-flex justify-center items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/30"
                    >
                        + Registrar Factura
                    </Link>
                </div>
            }
        >
            <Head title="Ingreso de Mercancía" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative overflow-hidden text-slate-300">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">

                    {flash?.success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center shadow-lg">
                            <svg className="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm font-bold uppercase tracking-widest">{flash.success}</span>
                        </div>
                    )}

                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-widest font-black">
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Proveedor / Factura</th>
                                    <th className="px-6 py-4 text-center">Insumos</th>
                                    <th className="px-6 py-4">Total Pagado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {purchasesList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">No hay compras registradas.</td>
                                    </tr>
                                ) : (
                                    purchasesList.map((p: Purchase) => (
                                        <tr key={p.id} className="hover:bg-slate-700/20 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-slate-300">
                                                {new Date(p.purchase_date).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-white uppercase italic">{p.supplier?.name || 'Desconocido'}</div>
                                                <div className="text-xs text-slate-400">Ref: {p.invoice_number || 'S/N'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-slate-900 px-3 py-1 rounded-lg text-xs font-bold border border-slate-700">{p.items_count} refs</span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-emerald-400 text-lg">
                                                {formatCurrency(Number(p.total_amount))}
                                                <div className="text-[10px] text-slate-500 uppercase font-normal">{p.payment_method}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-3">
                                                <Link href={route('purchases.edit', p.id)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                                    Ver/Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="text-slate-500 hover:text-rose-500 transition-colors"
                                                    title="Eliminar factura"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
