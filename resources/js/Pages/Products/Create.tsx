import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, Category, Ingredient } from '@/types';

interface Props extends PageProps {
    categories: Category[];
    ingredients: Ingredient[];
}

interface RecipeRow {
    rowId: string;
    id: number | string;
    quantity: number | string;
}

export default function Create({ auth, categories, ingredients }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category_id: '',
        sale_price: 0,
        is_active: true,
        ingredients: [] as RecipeRow[],
    });

    const addIngredientRow = () => {
        setData('ingredients', [...data.ingredients, { rowId: crypto.randomUUID(), id: '', quantity: '' }]);
    };

    const removeIngredientRow = (index: number) => {
        const newIngredients = [...data.ingredients];
        newIngredients.splice(index, 1);
        setData('ingredients', newIngredients);
    };

    const updateIngredientRow = (index: number, field: 'id' | 'quantity', value: any) => {
        const newIngredients = [...data.ingredients];
        newIngredients[index][field] = value;
        setData('ingredients', newIngredients);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.store'));
    };

    const getUnitForIngredient = (ingredientId: string | number) => {
        const found = ingredients.find((i) => i.id.toString() === ingredientId.toString());
        return found ? found.unit_of_measure : '';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-black leading-tight text-white tracking-tight">
                        <Link href={route('products.index')} className="text-slate-500 hover:text-slate-300 transition-colors mr-2">Carta</Link>
                        <span className="text-slate-600">/</span> <span className="text-purple-400">Nuevo Producto</span>
                    </h2>
                </div>
            }
        >
            <Head title="Nuevo Producto" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* DATOS BÁSICOS */}
                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-2">Datos Principales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Nombre del Producto (Ej: Mojito Tradicional)</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:ring-purple-500" />
                                    {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Categoría en Menú</label>
                                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:ring-purple-500">
                                        <option value="">Selecciona...</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-400">{errors.category_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Precio de Venta al Público ($)</label>
                                    <input type="number" value={data.sale_price} onChange={e => setData('sale_price', parseFloat(e.target.value) || 0)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:ring-purple-500 text-emerald-400 font-bold" />
                                    {errors.sale_price && <p className="mt-1 text-sm text-red-400">{errors.sale_price}</p>}
                                </div>
                            </div>
                        </div>

                        {/* CONSTRUCTOR DE RECETA */}
                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Fórmula / Receta (Opcional)</h3>
                                    <p className="text-xs text-slate-400 mt-1">Si es una cerveza o botella entera, agrega el insumo con cantidad 1.</p>
                                </div>
                                <button type="button" onClick={addIngredientRow} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-bold hover:bg-purple-500 hover:text-white transition-colors">
                                    + Añadir Insumo
                                </button>
                            </div>

                            {data.ingredients.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                                    Este producto no tiene ingredientes a descontar. (Venta libre sin inventario)
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* CORRECCIÓN DE KEY: Usamos rowId en lugar de index */}
                                    {data.ingredients.map((row, index) => (
                                        <div key={row.rowId} className="flex flex-col md:flex-row gap-3 items-end bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                                            <div className="flex-1 w-full">
                                                <label className="block text-xs font-bold text-slate-400 mb-1">Insumo / Bodega</label>
                                                <select
                                                    value={row.id}
                                                    onChange={e => updateIngredientRow(index, 'id', e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-purple-500 text-sm"
                                                >
                                                    <option value="">Buscar insumo...</option>
                                                    {ingredients.map((ing) => (
                                                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit_of_measure})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-full md:w-48 relative">
                                                <label className="block text-xs font-bold text-slate-400 mb-1">Cantidad a Descontar</label>
                                                <input
                                                    type="number" step="0.01"
                                                    value={row.quantity}
                                                    onChange={e => updateIngredientRow(index, 'quantity', parseFloat(e.target.value) || '')}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-purple-500 text-sm pr-12"
                                                />
                                                <span className="absolute right-3 top-[26px] text-xs text-slate-400 font-bold uppercase">{getUnitForIngredient(row.id)}</span>
                                            </div>
                                            <button type="button" onClick={() => removeIngredientRow(index)} className="p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors w-full md:w-auto flex justify-center">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BOTONES DE ACCIÓN */}
                        <div className="flex justify-end gap-4">
                            <Link href={route('products.index')} className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-700 transition-all">
                                Cancelar
                            </Link>
                            <button type="submit" disabled={processing} className="px-6 py-3 bg-purple-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50">
                                {processing ? 'Guardando...' : 'Crear Producto'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
