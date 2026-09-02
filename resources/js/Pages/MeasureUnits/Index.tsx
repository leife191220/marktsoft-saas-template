import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

interface Unit {
    id: number;
    name: string;
    abbreviation: string;
}

export default function Index({ auth, units, filters, flash = {} }: any) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        abbreviation: '',
    });

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            if (searchTerm !== filters.search) {
                router.get(route('measure-units.index'), { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchTerm]);

    const openModal = (unit?: Unit) => {
        clearErrors();
        if (unit) {
            setEditingId(unit.id);
            setData({ name: unit.name, abbreviation: unit.abbreviation });
        } else {
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('measure-units.update', editingId), { onSuccess: () => setIsModalOpen(false) });
        } else {
            post(route('measure-units.store'), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta unidad de medida?')) {
            router.delete(route('measure-units.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white">
                        <Link href={route('ingredients.index')} className="text-slate-500 hover:text-slate-300 mr-2">Inventario</Link>
                        <span className="text-slate-600">/</span> <span className="text-teal-400">Unidades de Medida</span>
                    </h2>
                    <button onClick={() => openModal()} className="px-4 py-2 bg-teal-600 rounded-xl text-sm font-bold text-white hover:bg-teal-500 shadow-lg shadow-teal-500/30">
                        + Nueva Unidad
                    </button>
                </div>
            }
        >
            <Head title="Unidades de Medida" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {flash?.success && <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{flash.success}</div>}

                <div className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 mt-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-sm">
                                <th className="px-6 py-4">Unidad</th>
                                <th className="px-6 py-4">Abreviación</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {units.data.map((unit: Unit) => (
                                <tr key={unit.id} className="hover:bg-slate-700/20 text-white">
                                    <td className="px-6 py-4 font-bold">{unit.name}</td>
                                    <td className="px-6 py-4 text-teal-400 font-mono">{unit.abbreviation}</td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        <button onClick={() => openModal(unit)} className="text-teal-400 hover:text-white text-sm font-semibold">Editar</button>
                                        <button onClick={() => handleDelete(unit.id)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Eliminar</button>
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
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">{editingId ? 'Editar Unidad' : 'Nueva Unidad'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nombre Completo</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ej: Mililitros, Caja" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-teal-500 focus:ring-teal-500" required />
                                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Abreviación</label>
                                <input type="text" value={data.abbreviation} onChange={e => setData('abbreviation', e.target.value)} placeholder="Ej: ml, cj" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-teal-500 focus:ring-teal-500" required />
                                {errors.abbreviation && <p className="text-red-400 text-sm mt-1">{errors.abbreviation}</p>}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 text-white rounded-xl">Cancelar</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold">{processing ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
