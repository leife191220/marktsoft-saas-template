import { FormEvent, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, Table } from '@/types';

interface Props extends PageProps {
    tables: Table[];
}

export default function Index({ auth, tables }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: ''
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('tables.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name'),
        });
    };

    const handleUpdate = (id: number) => {
        router.put(route('tables.update', id), { name: editName }, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null)
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás segura de eliminar esta mesa? Desaparecerá también del bot de Telegram.')) {
            router.delete(route('tables.destroy', id), { preserveScroll: true });
        }
    };

    const handleRelease = (id: number) => {
        if (confirm('¿Liberar esta mesa? Esto cerrará cualquier comanda activa asociada.')) {
            router.post(route('tables.update', id), { _method: 'PUT', status: 'available' }, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-bold leading-tight text-white">Configuración de Mesas</h2>}
        >
            <Head title="Gestión de Mesas" />

            <div className="py-12 bg-slate-900 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-8">

                    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Agregar Nueva Mesa</h3>
                        <form onSubmit={submit} className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ej: Mesa 10, VIP, Terraza 2..."
                                    className="w-full bg-slate-900 border-slate-700 text-white rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing || !data.name}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50"
                            >
                                + Agregar
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Mesas Activas en el Sistema</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {tables.map((table: Table) => (
                                <div key={table.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col justify-between group">

                                    {editingId === table.id ? (
                                        <div className="flex flex-col gap-2 mb-4">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full bg-slate-800 border-slate-600 text-white text-sm rounded-lg"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdate(table.id)} className="flex-1 bg-emerald-500 text-white text-xs font-bold py-1.5 rounded-lg">Guardar</button>
                                                <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-700 text-white text-xs font-bold py-1.5 rounded-lg">Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xl font-black text-white">{table.name}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${table.status === 'open' || table.status === 'occupied' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {table.status === 'open' || table.status === 'occupied' ? 'EN USO' : 'DISPONIBLE'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {editingId !== table.id && (
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity border-t border-slate-800 pt-3">
                                            {(table.status === 'open' || table.status === 'occupied') && (
                                                <button
                                                    onClick={() => handleRelease(table.id)}
                                                    className="text-slate-400 hover:text-amber-400 text-sm font-bold transition-colors"
                                                >
                                                    Liberar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setEditingId(table.id); setEditName(table.name); }}
                                                className="text-slate-400 hover:text-indigo-400 text-sm font-bold transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(table.id)}
                                                className="text-slate-400 hover:text-red-400 text-sm font-bold transition-colors ml-2"
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {tables.length === 0 && (
                                <p className="col-span-full text-slate-400 italic text-center py-4">No hay mesas. Agrega una arriba.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
