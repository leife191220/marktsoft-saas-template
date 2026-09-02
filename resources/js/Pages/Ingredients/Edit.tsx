import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, Category, MeasureUnit, Ingredient } from '@/types';

interface Props extends PageProps {
    categories: Category[];
    units: MeasureUnit[];
    ingredient: Ingredient;
}

export default function Edit({ auth, categories, units = [], ingredient }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: ingredient.name,
        category_id: ingredient.category_id || '',
        unit_of_measure: ingredient.unit_of_measure,
        current_stock: ingredient.current_stock,
        cost_per_unit: ingredient.cost_per_unit,
    });

    const [calcPrice, setCalcPrice] = useState<number | string>('');
    const [calcCapacity, setCalcCapacity] = useState<number | string>('');
    const [calcQuantity, setCalcQuantity] = useState<number | string>(1);

    useEffect(() => {
        if (calcPrice && calcCapacity && calcQuantity && Number(calcCapacity) > 0) {
            const costPerUnit = Number(calcPrice) / Number(calcCapacity);
            const totalStock = Number(calcCapacity) * Number(calcQuantity);

            setData(currentData => ({
                ...currentData,
                current_stock: totalStock,
                cost_per_unit: Number(costPerUnit.toFixed(2))
            }));
        }
    }, [calcPrice, calcCapacity, calcQuantity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ingredients.update', ingredient.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black leading-tight text-white tracking-tight">
                        <Link href={route('ingredients.index')} className="text-slate-500 hover:text-slate-300 transition-colors mr-2">
                            Inventario
                        </Link>
                        <span className="text-slate-600">/</span> <span className="text-indigo-400">Editar: {ingredient.name}</span>
                    </h2>
                </div>
            }
        >
            <Head title={`Editar ${ingredient.name}`} />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden shadow-xl p-6 sm:p-10">

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Nombre del Producto / Insumo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Categoría</label>
                                    <select
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                    >
                                        <option value="">Selecciona una categoría...</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-2 text-sm text-red-400">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Unidad de Medida de Receta</label>
                                    <select
                                        value={data.unit_of_measure}
                                        onChange={e => setData('unit_of_measure', e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-indigo-400 font-bold focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                    >
                                        <option value="">Selecciona unidad...</option>
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.abbreviation}>{unit.name} ({unit.abbreviation})</option>
                                        ))}
                                    </select>
                                    {errors.unit_of_measure && <p className="mt-2 text-sm text-red-400">{errors.unit_of_measure}</p>}
                                </div>
                            </div>

                            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
                                <h4 className="text-indigo-400 font-bold mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    Calculadora Inteligente (Opcional)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Precio de <span className="text-white font-bold">1 Botella/Empaque</span></label>
                                        <input type="number" placeholder="Ej: 40000" value={calcPrice} onChange={e => setCalcPrice(e.target.value)} className="w-full bg-slate-900/50 border-indigo-500/30 rounded-lg text-white text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">¿Cuántos {data.unit_of_measure} trae <span className="text-white font-bold">1 Botella</span>?</label>
                                        <input type="number" placeholder="Ej: 750" value={calcCapacity} onChange={e => setCalcCapacity(e.target.value)} className="w-full bg-slate-900/50 border-indigo-500/30 rounded-lg text-white text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">¿Cuántas botellas <span className="text-indigo-400 font-bold">compraste</span>?</label>
                                        <input type="number" placeholder="Ej: 10" value={calcQuantity} onChange={e => setCalcQuantity(e.target.value)} className="w-full bg-slate-900/50 border-indigo-500/30 rounded-lg text-white text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                    </div>
                                </div>
                                <p className="text-xs text-indigo-300 mt-2 opacity-80">* Usar esto sobrescribirá el stock actual y recalculará el costo unitario.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-5 rounded-xl border border-slate-700/50">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Stock Actual Total en Bodega</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.current_stock}
                                            onChange={e => setData('current_stock', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 transition-colors pr-12"
                                        />
                                        <span className="absolute right-4 top-2.5 text-slate-400 font-bold uppercase">{data.unit_of_measure}</span>
                                    </div>
                                    {errors.current_stock && <p className="mt-2 text-sm text-red-400">{errors.current_stock}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Costo Real por 1 {data.unit_of_measure} ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.cost_per_unit}
                                        onChange={e => setData('cost_per_unit', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-emerald-400 font-bold placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                    />
                                    {errors.cost_per_unit && <p className="mt-2 text-sm text-red-400">{errors.cost_per_unit}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-700">
                                <Link
                                    href={route('ingredients.index')}
                                    className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 bg-indigo-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                                >
                                    {processing ? 'Actualizando...' : 'Actualizar Insumo'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
