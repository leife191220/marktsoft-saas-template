import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, Supplier, Ingredient } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface PurchaseItem {
    id: number;
    ingredient_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface PurchaseRecord {
    id: number;
    supplier_id: number;
    invoice_number: string | null;
    purchase_date: string;
    payment_method: string;
    total_amount: number;
    items?: PurchaseItem[];
}

interface Props extends PageProps {
    purchase: PurchaseRecord;
    suppliers: Supplier[];
    ingredients: Ingredient[];
}

interface PurchaseItemRow {
    rowId: string;
    id?: number;
    ingredient_id: string | number;
    quantity: number | string;
    unit_price: number | string;
    subtotal: number;
}

export default function Edit({ auth, purchase, suppliers, ingredients }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        supplier_id: purchase.supplier_id || '',
        invoice_number: purchase.invoice_number || '',
        purchase_date: purchase.purchase_date ? new Date(purchase.purchase_date).toISOString().split('T')[0] : '',
        payment_method: purchase.payment_method || 'transferencia',
        total_amount: Number(purchase.total_amount) || 0,
        items: purchase.items ? purchase.items.map((item) => ({
            rowId: crypto.randomUUID(),
            id: item.id,
            ingredient_id: item.ingredient_id,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            subtotal: Number(item.subtotal)
        })) : [] as PurchaseItemRow[],
    });

    const addItemRow = () => {
        setData('items', [...data.items, { rowId: crypto.randomUUID(), ingredient_id: '', quantity: '', unit_price: '', subtotal: 0 }]);
    };

    const removeItemRow = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const updateItemRow = (index: number, field: keyof PurchaseItemRow, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'unit_price') {
            const qty = parseFloat(newItems[index].quantity as string) || 0;
            const price = parseFloat(newItems[index].unit_price as string) || 0;
            newItems[index].subtotal = qty * price;
        }

        setData('items', newItems);
    };

    useEffect(() => {
        const newTotal = data.items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
        setData('total_amount', newTotal);
    }, [data.items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('purchases.update', purchase.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Link href={route('purchases.index')} className="text-slate-500 hover:text-slate-300">Inventario</Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-emerald-400">Editar Factura #{purchase.id}</span>
                </h2>
            }
        >
            <Head title={`Editar Factura #${purchase.id}`} />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative text-slate-300">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 relative z-10">

                    <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4 shadow-lg">
                        <svg className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h4 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-1">Cuidado al editar</h4>
                            <p className="text-sm text-amber-500/80">
                                Al guardar los cambios, el sistema ajustará automáticamente el <strong>Inventario de Insumos</strong> y el <strong>Flujo de Caja</strong> para reflejar las nuevas cantidades y precios. Verifica bien los datos.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Datos del Proveedor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proveedor</label>
                                    <select value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500" required>
                                        <option value="">Selecciona...</option>
                                        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {errors.supplier_id && <p className="mt-1 text-xs text-red-400">{errors.supplier_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">N° Factura</label>
                                    <input type="text" value={data.invoice_number} onChange={e => setData('invoice_number', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                    <input type="date" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} required className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                                <h3 className="text-lg font-bold text-white">Insumos ingresados</h3>
                                <button type="button" onClick={addItemRow} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold hover:bg-emerald-500 hover:text-white transition-colors">
                                    + Agregar Insumo
                                </button>
                            </div>

                            {data.items.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                                    No hay insumos en esta factura.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.items.map((row, index) => (
                                        <div key={row.rowId} className="flex flex-col md:flex-row gap-3 items-end bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                                            <div className="flex-1 w-full">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Producto / Insumo</label>
                                                <select value={row.ingredient_id} onChange={e => updateItemRow(index, 'ingredient_id', e.target.value)} required className="w-full bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-emerald-500">
                                                    <option value="">Buscar insumo...</option>
                                                    {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-full md:w-28">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cantidad</label>
                                                <input type="number" step="0.01" value={row.quantity} onChange={e => updateItemRow(index, 'quantity', e.target.value)} required className="w-full bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-emerald-500" />
                                            </div>
                                            <div className="w-full md:w-36">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Costo Unitario ($)</label>
                                                <input type="number" step="0.01" value={row.unit_price} onChange={e => updateItemRow(index, 'unit_price', e.target.value)} required className="w-full bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-emerald-500" />
                                            </div>
                                            <div className="w-full md:w-36">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtotal</label>
                                                <div className="h-[38px] flex items-center px-3 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold text-sm">
                                                    {formatCurrency(row.subtotal)}
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeItemRow(index)} className="h-[38px] px-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Método de Pago</label>
                                <div className="flex space-x-2">
                                    {['efectivo', 'transferencia', 'tarjeta'].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setData('payment_method', method)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all border ${data.payment_method === method ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-700'}`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-6">
                                <div>
                                    <div className="text-sm font-bold text-slate-500 uppercase mb-1">Total a Pagar</div>
                                    <div className="text-4xl font-black text-white">{formatCurrency(data.total_amount)}</div>
                                </div>
                                <button type="submit" disabled={processing || data.items.length === 0} className="w-full md:w-auto px-8 py-3 bg-emerald-600 border border-transparent rounded-xl text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 h-[60px]">
                                    {processing ? 'Actualizando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
