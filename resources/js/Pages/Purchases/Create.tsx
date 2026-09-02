import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2'; // <-- Importamos SweetAlert2
import { PageProps, Supplier, Ingredient } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface Props extends PageProps {
    suppliers: Supplier[];
    ingredients: Ingredient[];
}

interface PurchaseItemRow {
    rowId: string;
    ingredient_id: string | number;
    ai_name?: string;
    quantity: number | string;
    unit_price: number | string;
    subtotal: number;
}

export default function Create({ auth, suppliers, ingredients }: Props) {
    const [localIngredients, setLocalIngredients] = useState<Ingredient[]>(ingredients);
    const [isScanning, setIsScanning] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        invoice_number: '',
        purchase_date: new Date().toISOString().split('T')[0],
        payment_method: 'transferencia',
        total_amount: 0,
        items: [] as PurchaseItemRow[],
    });

    const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        const formData = new FormData();
        formData.append('receipt', file);

        const attemptScan = async (retries = 3): Promise<any> => {
            try {
                return await axios.post(route('purchases.scan'), formData);
            } catch (error: any) {
                const errorMsg = error.response?.data?.google_details?.error?.message || "";
                if (errorMsg.includes('high demand') && retries > 0) {
                    console.warn(`Servidor saturado. Reintentando en 3s... (Quedan ${retries} intentos)`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    return attemptScan(retries - 1);
                }
                throw error;
            }
        };

        try {
            const res = await attemptScan();

            if (res.data.ingredients) {
                setLocalIngredients(res.data.ingredients);
            }

            // Mapeamos los items escaneados
            const scannedItems: PurchaseItemRow[] = (res.data.items || []).map((item: any) => ({
                rowId: crypto.randomUUID(),
                ingredient_id: item.ingredient_id,
                ai_name: item.ai_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
            }));

            // Lógica de alerta hermosa con SweetAlert si la IA detecta un proveedor que no existe
            if (res.data.ai_supplier_name && !res.data.supplier_id) {
                Swal.fire({
                    title: 'Proveedor no registrado',
                    html: `La IA detectó a <strong>${res.data.ai_supplier_name}</strong> en la factura, pero no existe en tu base de datos.<br><br>Selecciónalo manualmente si tiene un nombre distinto, o créalo primero en la sección de Proveedores.`,
                    icon: 'warning',
                    background: '#1e293b', // bg-slate-800
                    color: '#f8fafc',      // text-slate-50
                    confirmButtonColor: '#10b981', // bg-emerald-500
                    confirmButtonText: 'Entendido'
                });
            } else if (res.data.items?.length > 0) {
                // Opcional: Un mini toast o alerta de éxito si todo salió perfecto
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Factura escaneada con éxito',
                    showConfirmButton: false,
                    timer: 3000,
                    background: '#1e293b',
                    color: '#10b981'
                });
            }

            // Actualización de estado
            setData(currentData => ({
                ...currentData,
                purchase_date: res.data.date || currentData.purchase_date,
                supplier_id: res.data.supplier_id || (res.data.ai_supplier_name ? '' : currentData.supplier_id),
                items: [...currentData.items, ...scannedItems]
            }));

        } catch (error: any) {
            const errorMsg = error.response?.data?.google_details?.error?.message || error.response?.data?.message || "Error desconocido procesando la imagen.";

            // Alerta de error elegante
            Swal.fire({
                title: 'Error de lectura',
                text: errorMsg,
                icon: 'error',
                background: '#1e293b',
                color: '#f8fafc',
                confirmButtonColor: '#ef4444', // bg-red-500
                confirmButtonText: 'Cerrar'
            });
            console.error("Error completo: ", error.response?.data);
        } finally {
            setIsScanning(false);
            e.target.value = '';
        }
    };

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
        post(route('purchases.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Link href={route('purchases.index')} className="text-slate-500 hover:text-slate-300">Inventario</Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-emerald-400">Ingresar Factura</span>
                </h2>
            }
        >
            <Head title="Nueva Compra" />

            <div className="bg-slate-900 min-h-screen pb-20 pt-8 relative text-slate-300">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 relative z-10">

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
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">N° Factura (Opcional)</label>
                                    <input type="text" value={data.invoice_number} onChange={e => setData('invoice_number', e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500" placeholder="Ej: FEV-1020" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                    <input type="date" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} required className="w-full bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-700 pb-2 gap-4">
                                <h3 className="text-lg font-bold text-white">Insumos a ingresar</h3>

                                <div className="flex gap-3">
                                    <label className={`px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${isScanning ? 'opacity-50 animate-pulse' : 'hover:bg-indigo-600 hover:text-white'}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {isScanning ? 'Analizando...' : '📸 Escanear'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleScanReceipt} disabled={isScanning} />
                                    </label>
                                    <button type="button" onClick={addItemRow} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold hover:bg-emerald-500 hover:text-white transition-colors">
                                        + Manual
                                    </button>
                                </div>
                            </div>

                            {data.items.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                                    Sube la foto de tu recibo para que la Inteligencia Artificial llene la factura por ti.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.items.map((row, index) => (
                                        <div key={row.rowId} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                                            <div className="flex-1 w-full">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Producto / Insumo</label>
                                                <select value={row.ingredient_id} onChange={e => updateItemRow(index, 'ingredient_id', e.target.value)} required className={`w-full bg-slate-800 border rounded-lg text-white text-sm focus:border-emerald-500 ${row.ai_name && !row.ingredient_id ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-600'}`}>
                                                    <option value="">Seleccionar insumo...</option>
                                                    {localIngredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                                                </select>

                                                {row.ai_name && (
                                                    <span className={`text-xs font-black mt-1 block tracking-tight ${row.ingredient_id ? 'text-emerald-400/50' : 'text-amber-400'}`}>
                                                        ✨ Escaneado: {row.ai_name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-full md:w-28">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cantidad</label>
                                                <input type="number" step="0.01" value={row.quantity} onChange={e => updateItemRow(index, 'quantity', e.target.value)} required placeholder="0.00" className="w-full bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-emerald-500" />
                                            </div>
                                            <div className="w-full md:w-36">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Costo Und ($)</label>
                                                <input type="number" step="0.01" value={row.unit_price} onChange={e => updateItemRow(index, 'unit_price', e.target.value)} required placeholder="0.00" className="w-full bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-emerald-500" />
                                            </div>
                                            <div className="w-full md:w-36">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtotal</label>
                                                <div className="h-[38px] flex items-center px-3 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold text-sm">
                                                    {formatCurrency(row.subtotal)}
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeItemRow(index)} className="h-[38px] px-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                ❌
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">¿De dónde salió el dinero?</label>
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
                                <button type="submit" disabled={processing || data.items.length === 0 || data.items.some(i => !i.ingredient_id)} className="w-full md:w-auto px-8 py-3 bg-emerald-600 border border-transparent rounded-xl text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 h-[60px]">
                                    {processing ? 'Actualizando...' : 'Guardar y Abastecer'}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
