import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, Supplier } from '@/types';

interface Props extends PageProps {
    // Acepta tanto colección paginada como un array plano, según como lo envíes desde Laravel
    suppliers: { data: Supplier[] } | Supplier[];
}

export default function Index({ auth, suppliers, flash = {} }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
    });

    const handleEdit = (supplier: Supplier) => {
        setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
        });
        setEditingId(supplier.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás segura de eliminar este proveedor? Esta acción no se puede deshacer.')) {
            router.delete(route('suppliers.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const cancelEdit = () => {
        reset();
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(route('suppliers.update', editingId), {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                    setIsFormOpen(false);
                }
            });
        } else {
            post(route('suppliers.store'), {
                onSuccess: () => {
                    reset();
                    setIsFormOpen(false);
                }
            });
        }
    };

    const suppliersList = Array.isArray(suppliers) ? suppliers : (suppliers?.data || []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Gestión <span className="text-amber-400">| Proveedores</span>
                    </h2>
                    <button
                        onClick={isFormOpen ? cancelEdit : () => setIsFormOpen(true)}
                        className={`inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                            isFormOpen
                            ? 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/20'
                            : 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/30'
                        }`}
                    >
                        {isFormOpen ? 'Cerrar Formulario' : '+ Nuevo Proveedor'}
                    </button>
                </div>
            }
        >
            <Head title="Proveedores" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative overflow-hidden text-slate-300">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">

                    {flash?.success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center shadow-lg animate-in fade-in">
                            <svg className="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm font-bold uppercase tracking-widest">{flash.success}</span>
                        </div>
                    )}

                    {isFormOpen && (
                        <div className="mb-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">
                                    {editingId ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 italic">Empresa / Razón Social *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-0 px-4 py-2" />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 italic">Contacto (Nombre)</label>
                                    <input type="text" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-0 px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 italic">Teléfono / Celular</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:ring-0 px-4 py-2" />
                                </div>
                                <div className="flex justify-end pt-6">
                                    <button type="submit" disabled={processing} className={`inline-flex justify-center items-center px-4 py-2 h-[42px] w-full border border-transparent rounded-xl text-sm font-bold text-white shadow-lg transition-colors ${
                                        editingId ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/30'
                                    }`}>
                                        {processing ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-widest font-black">
                                    <th className="px-6 py-4 border-r border-slate-700/30">Empresa</th>
                                    <th className="px-6 py-4">Persona de Contacto</th>
                                    <th className="px-6 py-4">Teléfono</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {suppliersList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-bold">No hay proveedores registrados.</td>
                                    </tr>
                                ) : (
                                    suppliersList.map((s: Supplier) => (
                                        <tr key={s.id} className="hover:bg-slate-700/20 transition-colors group">
                                            <td className="px-6 py-4 border-r border-slate-700/30 font-black text-white uppercase italic group-hover:text-amber-400 transition-colors">
                                                {s.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">{s.contact_person || '—'}</td>
                                            <td className="px-6 py-4 font-bold text-emerald-400 italic">
                                                {s.phone || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(s)}
                                                        className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s.id)}
                                                        className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
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
        </AuthenticatedLayout>
    );
}
