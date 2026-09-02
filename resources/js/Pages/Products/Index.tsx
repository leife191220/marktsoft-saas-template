import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { formatCurrency } from '@/Utils/formatters'; // <-- Utilidad importada
import { PageProps, PaginatedData, Product } from '@/types'; // <-- Tipos estrictos

interface Props extends PageProps {
    products: PaginatedData<Product>;
    filters: { search?: string };
}

export default function Index({ auth, products, filters, flash }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Efecto de búsqueda con debounce
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(route('products.index'), { search: searchTerm }, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 500);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchTerm, filters?.search]);

    // Función de borrado
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este producto de la carta?')) {
            router.delete(route('products.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black leading-tight text-white tracking-tight">
                        Carta <span className="text-purple-400 font-medium">| Menú y Recetario</span>
                    </h2>
                    <Link
                        href={route('products.create')}
                        className="inline-flex justify-center items-center px-4 py-2 bg-purple-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/30"
                    >
                        + Nuevo Producto
                    </Link>
                </div>
            }
        >
            <Head title="Carta y Menú" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">

                    {flash?.success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center shadow-lg font-bold">
                            {flash.success}
                        </div>
                    )}

                    {/* Buscador */}
                    <div className="mb-6 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 rounded-2xl flex items-center shadow-xl">
                        <svg className="w-6 h-6 text-slate-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Buscar en la carta..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-500 text-lg"
                        />
                    </div>

                    {/* Tabla */}
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Producto</th>
                                        <th className="px-6 py-4 font-semibold">Categoría</th>
                                        <th className="px-6 py-4 font-semibold">Precio de Venta</th>
                                        <th className="px-6 py-4 font-semibold">Receta</th>
                                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {products.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No se encontraron productos.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.data.map((item: Product) => (
                                            <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300">
                                                        {item.category?.name || 'Sin Categoría'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-emerald-400">
                                                    {formatCurrency(item.sale_price)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400 italic">
                                                    {item.recipes && item.recipes.length > 0 ? (
                                                        <span className="text-purple-400 font-medium">{item.recipes.length} insumos vinculados</span>
                                                    ) : (
                                                        <span>Venta Directa</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    <Link href={route('products.edit', item.id)} className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-bold">
                                                        Editar
                                                    </Link>
                                                    <button onClick={() => handleDelete(item.id)} className="text-rose-500 hover:text-rose-400 transition-colors text-sm font-bold">
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-700 bg-slate-900/20">
                            <Pagination links={products.links} />
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
