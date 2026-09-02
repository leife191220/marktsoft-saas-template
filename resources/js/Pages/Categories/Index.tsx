import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
    type: 'product' | 'expense' | 'ingredient';
    is_personal: boolean;
    is_active: boolean;
}

export default function Index({ auth, categories, filters, flash = {} }: any) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Estado del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'ingredient',
        is_personal: false,
        is_active: true,
    });

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            if (searchTerm !== filters.search) {
                router.get(route('categories.index'), { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchTerm]);

    const openModal = (category?: Category) => {
        clearErrors();
        if (category) {
            setEditingId(category.id);
            setData({
                name: category.name,
                type: category.type,
                is_personal: Boolean(category.is_personal),
                is_active: Boolean(category.is_active),
            });
        } else {
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('categories.update', editingId), { onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('categories.store'), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta categoría? Si está en uso, el sistema bloqueará la acción por seguridad.')) {
            router.delete(route('categories.destroy', id));
        }
    };

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'ingredient': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'product': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'expense': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const getTypeName = (type: string) => {
        switch(type) {
            case 'ingredient': return 'Bodega / Insumo';
            case 'product': return 'Carta / Menú';
            case 'expense': return 'Gasto / Costo';
            default: return type;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white">
                        <Link href={route('ingredients.index')} className="text-slate-500 hover:text-slate-300 mr-2">Inventario</Link>
                        <span className="text-slate-600">/</span> <span className="text-indigo-400">Categorías Maestras</span>
                    </h2>
                    <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30">
                        + Nueva Categoría
                    </button>
                </div>
            }
        >
            <Head title="Categorías" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {flash?.success && <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{flash.success}</div>}
                {flash?.error && <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">{flash.error}</div>}

                <div className="mb-6 bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center">
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-500"
                    />
                </div>

                <div className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm">
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Módulo (Tipo)</th>
                                <th className="px-6 py-4 text-center">Estado / Atributos</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {categories.data.map((cat: Category) => (
                                <tr key={cat.id} className="hover:bg-slate-700/20 text-white">
                                    <td className="px-6 py-4 font-bold">{cat.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getTypeColor(cat.type)}`}>
                                            {getTypeName(cat.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        {!cat.is_active && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-md">Inactiva</span>}
                                        {cat.is_personal && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md border border-yellow-400/20">Uso Personal / Salario</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        <button onClick={() => openModal(cat)} className="text-indigo-400 hover:text-white text-sm font-semibold">Editar</button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-indigo-500" required />
                                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Módulo de uso</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value as any)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-indigo-500">
                                    <option value="ingredient">Bodega / Insumos</option>
                                    <option value="product">Carta / Menú (POS)</option>
                                    <option value="expense">Gastos (Flujo de Caja)</option>
                                </select>
                            </div>
                            {data.type === 'expense' && (
                                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-900/30 rounded-xl border border-slate-700">
                                    <input type="checkbox" checked={data.is_personal} onChange={e => setData('is_personal', e.target.checked)} className="rounded border-slate-600 text-indigo-500 bg-slate-900 focus:ring-indigo-500" />
                                    <span className="text-sm text-slate-300">Es un gasto de casa / Retiro personal</span>
                                </label>
                            )}
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-slate-600 text-indigo-500 bg-slate-900 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-300">Categoría Activa</span>
                            </label>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 text-white rounded-xl">Cancelar</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">{processing ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
