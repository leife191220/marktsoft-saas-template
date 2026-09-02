import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps, Table } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface Props extends PageProps {
    tables: Table[];
}

export default function Index({ auth, tables }: Props) {

    // Función para abrir una mesa nueva (Llama a tu OrderController@store)
    const handleOpenTable = (tableId: number) => {
        router.post(route('orders.store'), {
            table_id: tableId
        }, {
            preserveScroll: true,
            onSuccess: () => console.log('Mesa abierta con éxito')
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-bold leading-tight text-white">Monitor de Mesas y Comandas</h2>}
        >
            <Head title="Mesas y Comandas" />

            <div className="py-12 bg-slate-900 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Grid de Mesas */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {tables.map((table: Table) => {
                            // Verificamos si la mesa tiene una orden abierta
                            const activeOrder = table.orders && table.orders.length > 0 ? table.orders[0] : null;
                            const isOccupied = !!activeOrder;

                            return (
                                <div
                                    key={table.id}
                                    className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 shadow-lg flex flex-col justify-between min-h-[200px] ${
                                        isOccupied
                                        ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60'
                                        : 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
                                    }`}
                                >
                                    {/* Cabecera de la Tarjeta */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">{table.name || `Mesa ${table.id}`}</h3>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mt-2 ${
                                                isOccupied ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                                                {isOccupied ? 'OCUPADA' : 'DISPONIBLE'}
                                            </span>
                                        </div>

                                        {/* Icono Decorativo */}
                                        <div className={`p-3 rounded-xl ${isOccupied ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Cuerpo de la Tarjeta */}
                                    <div className="mt-auto">
                                        {isOccupied && activeOrder ? (
                                            <>
                                                <div className="mb-4">
                                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Actual</p>
                                                    <p className="text-3xl font-black text-white">{formatCurrency(activeOrder.total)}</p>
                                                    <p className="text-slate-400 text-xs mt-1">
                                                        {activeOrder.details?.length || 0} productos pedidos
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => router.get(route('orders.show', activeOrder.id))}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                                                >
                                                    Gestionar Comanda
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mb-4">
                                                    <p className="text-slate-400 text-sm">Lista para recibir clientes.</p>
                                                </div>
                                                <button
                                                    onClick={() => handleOpenTable(table.id)}
                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                                                >
                                                    Abrir Mesa
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {tables.length === 0 && (
                            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-700 rounded-3xl">
                                <p className="text-slate-400 font-medium">Aún no hay mesas configuradas en el sistema.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
