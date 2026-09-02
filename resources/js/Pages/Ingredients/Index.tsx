import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import { PageProps, PaginatedData, Ingredient } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface Props extends PageProps {
    ingredients: PaginatedData<Ingredient>;
    filters: { search?: string };
}

export default function Index({ auth, ingredients, filters, flash }: Props) {
    // Estado para la búsqueda
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    // Estados para los Modales
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Estado para el Modal de Confirmación de Eliminación
    const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});

    // Formulario de Inertia para subir el archivo
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    // Efecto de búsqueda en tiempo real (Debounce de 500ms)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(() => {
            if (searchTerm !== filters.search) {
                router.get(route('ingredients.index'), {
                    search: searchTerm,
                    page: 1
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 500);

        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchTerm, filters.search]);

    // Función para manejar la subida del archivo Excel
    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ingredients.import'), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                reset();
            },
        });
    };

    // =========================================================
    // FUNCIONES DE ELIMINACIÓN CON MODAL
    // =========================================================

    const triggerDelete = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = () => {
        if (deleteModal.id) {
            router.delete(route('ingredients.destroy', deleteModal.id), {
                onSuccess: () => setDeleteModal({ isOpen: false, id: null }),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black leading-tight text-white tracking-tight">
                        Inventario <span className="text-orange-400 font-medium">| Insumos y Bodega</span>
                    </h2>

                    <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                        <Link
                            href={route('measure-units.index')}
                            className="inline-flex justify-center items-center px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                            Unidades
                        </Link>
                        <Link
                            href={route('categories.index')}
                            className="inline-flex justify-center items-center px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            Categorías
                        </Link>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex justify-center items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-lg"
                        >
                            Importar Excel
                        </button>
                        <Link
                            href={route('ingredients.create')}
                            className="inline-flex justify-center items-center px-4 py-2 bg-orange-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/30"
                        >
                            + Nuevo Insumo
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Inventario" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">

                    {flash?.success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center shadow-lg shadow-emerald-500/10 font-bold">
                            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-lg shadow-red-500/10 font-bold">
                            {flash.error}
                        </div>
                    )}

                    <div className="mb-6 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 rounded-2xl flex items-center shadow-xl">
                        <svg className="w-6 h-6 text-slate-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Buscar licor, gaseosa, insumo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-500 text-lg"
                        />
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Producto / Insumo</th>
                                        <th className="px-6 py-4 font-semibold">Categoría</th>
                                        <th className="px-6 py-4 font-semibold">Stock Actual</th>
                                        <th className="px-6 py-4 font-semibold">Costo Aprox.</th>
                                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {ingredients.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No se encontraron insumos. Intenta importar tu archivo masivo.
                                            </td>
                                        </tr>
                                    ) : (
                                        ingredients.data.map((item: Ingredient) => (
                                            <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white">{item.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1 uppercase">
                                                        Unidad: {item.unit_of_measure}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300">
                                                        {item.category?.name || 'Importados'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className={`text-lg font-black ${item.current_stock <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                            {item.current_stock}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300 font-medium">
                                                    {formatCurrency(item.cost_per_unit)}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    <Link href={route('ingredients.edit', item.id)} className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-bold">
                                                        Editar
                                                    </Link>
                                                    <button onClick={() => triggerDelete(item.id)} className="text-slate-500 hover:text-rose-400 transition-colors text-sm font-bold">
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
                            <Pagination links={ingredients.links} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE IMPORTACIÓN */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative border-t-4 border-t-orange-500">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Carga Masiva de Bodega</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="p-6">
                            <div className="mb-6">
                                <p className="text-xs text-slate-400 mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    Asegúrate de que tu archivo (.csv o .xlsx) tenga estas columnas: <br/>
                                    <span className="text-orange-400 font-bold font-mono">nombre, categoria, unidad, stock_inicial, costo_unitario</span>
                                </p>

                                <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-widest">Archivo de Excel</label>

                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-2xl hover:border-orange-500 transition-colors bg-slate-900/30">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-slate-400 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-black text-orange-400 hover:text-orange-300 focus-within:outline-none">
                                                <span>Sube un archivo</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv, .xlsx, .xls" onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)} />
                                            </label>
                                            <p className="pl-1">o arrástralo aquí</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-tighter">XLSX, CSV hasta 5MB</p>

                                        {data.file && (
                                            <div className="mt-4 inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold text-xs uppercase">
                                                Seleccionado: {data.file.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {errors.file && <p className="mt-2 text-sm text-red-400 font-bold">{errors.file}</p>}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors uppercase text-xs">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!data.file || processing}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-xl font-black hover:bg-orange-500 transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/30 uppercase text-xs tracking-widest"
                                >
                                    {processing ? 'Cargando...' : 'Iniciar Importación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-rose-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.1)] relative border-t-4 border-t-rose-500 transform transition-all">
                        <div className="p-6 sm:p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-black text-white mb-2 tracking-tight">¿Eliminar Insumo?</h3>

                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Estás a punto de borrar este producto de la base de datos. Esta acción <span className="text-rose-400 font-bold">eliminará su historial en el Kardex</span> y lo quitará de las recetas asociadas.
                                <br/><br/>
                                ¿Estás completamente seguro de que deseas continuar?
                            </p>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, id: null })}
                                    className="px-5 py-2.5 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors text-sm w-full"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-black hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/30 tracking-wide text-sm w-full"
                                >
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </AuthenticatedLayout>
    );
}
