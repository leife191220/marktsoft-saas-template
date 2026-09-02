import { FormEvent, useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { PageProps, Order, Product, OrderDetail } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface Props extends PageProps {
    order: Order;
    products: Product[];
}

export default function Show({ auth, order, products }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        product_id: '',
        quantity: 1,
        notes: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('efectivo');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredProducts = products.filter((p: Product) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectProduct = (product: Product) => {
        setData('product_id', product.id.toString());
        setSearchTerm(`${product.name} - ${formatCurrency(product.sale_price)}`);
        setIsDropdownOpen(false);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('orders.add-item', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('product_id', 'quantity', 'notes');
                setSearchTerm('');
            },
        });
    };

    const removeItem = (orderId: number, detailId: number) => {
        if (confirm('¿Eliminar este producto de la cuenta?')) {
            router.delete(route('orders.remove-item', [orderId, detailId]), {
                preserveScroll: true
            });
        }
    };

    const confirmCheckout = () => {
        setShowModal(false);
        router.post(route('checkout.store', order.id), {
            payment_method: paymentMethod
        });
    };

    const paymentMethods = [
        { value: 'efectivo', label: 'Efectivo' },
        { value: 'nequi', label: 'Nequi' },
        { value: 'daviplata', label: 'Daviplata' }
    ];

    // Aseguramos que la orden siempre tenga el array de detalles definido
    const orderDetails = order.details || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-tight text-white">
                        <Link href={route('orders.index')} className="text-indigo-400 hover:text-indigo-300 mr-2 transition-colors">
                            ← Volver
                        </Link>
                        {/* TypeScript necesita validación segura aquí si `table` viene precargada */}
                        Mesa: {(order as any).table?.name || `Mesa ${order.table_id}`}
                    </h2>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold animate-pulse">
                        CUENTA ABIERTA
                    </span>
                </div>
            }
        >
            <Head title={`Comanda - ${(order as any).table?.name || 'Mesa'}`} />

            <div className="py-12 bg-slate-900 min-h-screen relative">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* PANEL IZQUIERDO: DETALLE DE LA CUENTA */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Tirilla de Consumo</h3>

                            {orderDetails.length === 0 ? (
                                <p className="text-slate-400 italic text-center py-8">La cuenta está vacía. Agrega productos.</p>
                            ) : (
                                <div className="space-y-4">
                                    {orderDetails.map((detail: OrderDetail) => (
                                        <div key={detail.id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-500/20 text-indigo-400 font-black w-10 h-10 flex items-center justify-center rounded-lg">
                                                    {detail.quantity}x
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{detail.product?.name || 'Producto Desconocido'}</p>
                                                    {detail.notes && <p className="text-xs text-orange-400 mt-1">Nota: {detail.notes}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-white font-black">{formatCurrency(detail.subtotal)}</p>
                                                    <p className="text-xs text-slate-400">{formatCurrency(detail.unit_price)} c/u</p>
                                                </div>
                                                {/* Botón de eliminar ítem */}
                                                <button
                                                    onClick={() => removeItem(order.id, detail.id)}
                                                    className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 pt-4 border-t border-slate-700 flex justify-between items-end">
                                <p className="text-slate-400 uppercase font-bold tracking-widest text-sm">Total a Pagar</p>
                                <p className="text-4xl font-black text-emerald-400">{formatCurrency(order.total)}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            disabled={orderDetails.length === 0}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            💰 CERRAR CUENTA Y FACTURAR
                        </button>

                        <button
                            onClick={() => {
                                if (confirm('¿Estás seguro de cancelar toda la orden y liberar la mesa?')) {
                                    router.delete(route('orders.destroy-order', order.id));
                                }
                            }}
                            className="w-full mt-4 bg-rose-900/20 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white font-bold py-3 rounded-xl transition-all"
                        >
                            🗑️ CANCELAR ORDEN COMPLETA
                        </button>
                    </div>

                    {/* PANEL DERECHO: AGREGAR PRODUCTOS */}
                    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl h-fit sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Agregar a la orden</h3>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Buscar Producto</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Cerveza, Aguardiente..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsDropdownOpen(true);
                                        if (e.target.value === '') setData('product_id', '');
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="w-full bg-slate-900 border-slate-700 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />

                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((p: Product) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => selectProduct(p)}
                                                    className="w-full text-left px-4 py-3 hover:bg-indigo-600/30 text-slate-200 transition-colors border-b border-slate-700/50 last:border-0 flex justify-between items-center"
                                                >
                                                    <span className="font-bold text-white block truncate">{p.name}</span>
                                                    <span className="text-emerald-400 text-sm font-bold ml-2 whitespace-nowrap">{formatCurrency(p.sale_price)}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-center text-slate-400 text-sm">
                                                No se encontraron productos.
                                            </div>
                                        )}
                                    </div>
                                )}
                                {errors.product_id && <p className="text-red-400 text-xs mt-1">Por favor selecciona un producto válido de la lista.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Cantidad</label>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setData('quantity', Math.max(1, data.quantity - 1))} className="bg-slate-700 text-white w-12 h-10 rounded-lg hover:bg-slate-600 font-bold">-</button>
                                    <input type="number" min="1" value={data.quantity} onChange={e => setData('quantity', parseInt(e.target.value))} className="flex-1 bg-slate-900 border-slate-700 text-white rounded-lg text-center font-bold h-10 focus:ring-indigo-500 focus:border-indigo-500" required />
                                    <button type="button" onClick={() => setData('quantity', data.quantity + 1)} className="bg-slate-700 text-white w-12 h-10 rounded-lg hover:bg-slate-600 font-bold">+</button>
                                </div>
                                {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Notas (Opcional)</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Ej: Con limón, sin hielo..." className="w-full bg-slate-900 border-slate-700 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none h-20" />
                            </div>

                            <button type="submit" disabled={processing || !data.product_id} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors mt-4 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                {processing ? 'Agregando...' : '+ AGREGAR A LA CUENTA'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Cerrar Cuenta</h3>
                                    <p className="text-emerald-400 font-black text-lg">{formatCurrency(order.total)}</p>
                                </div>
                            </div>

                            <div className="mt-6 mb-6">
                                <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Método de Pago</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.value)}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold border transition-colors ${
                                                paymentMethod === method.value
                                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-inner'
                                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {method.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">Cancelar</button>
                                <button onClick={confirmCheckout} className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors">Confirmar Pago</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
