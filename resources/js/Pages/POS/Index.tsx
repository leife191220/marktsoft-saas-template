import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps, Category, Product } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

interface CartItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
}

interface Props extends PageProps {
    categories: Category[];
    products: Product[];
}

export default function Index({ auth, categories, products, flash }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [cart, setCart] = useState<CartItem[]>([]);

    // Tipamos explícitamente el payload que espera el SaleController
    const { data, setData, post, processing, reset } = useForm({
        items: [] as { product_id: number; quantity: number; price: number }[],
        payment_method: 'efectivo',
        total: 0,
    });

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter(p => p.category_id === selectedCategory);
    }, [selectedCategory, products]);

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const addToCart = (product: Product) => {
        setCart(currentCart => {
            const existing = currentCart.find(item => item.product_id === product.id);
            if (existing) {
                return currentCart.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentCart, {
                product_id: product.id,
                name: product.name,
                price: Number(product.sale_price),
                quantity: 1
            }];
        });
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(currentCart => {
            return currentCart.map(item => {
                if (item.product_id === productId) {
                    const newQuantity = item.quantity + delta;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(currentCart => currentCart.filter(item => item.product_id !== productId));
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        const payload = {
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            })),
            payment_method: data.payment_method,
            total: cartTotal
        };

        setData(payload);

        post(route('pos.store'), {
            onSuccess: (page) => {
                setCart([]);
                reset();

                // Extracción segura del ID de la última venta desde la sesión flash
                const flashData = page.props.flash as { last_sale_id?: number } | undefined;
                const saleId = flashData?.last_sale_id;

                if (saleId) {
                    window.open(route('sales.receipt', saleId), '_blank', 'width=400,height=600');
                }
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-2xl font-black leading-tight text-white tracking-tight flex items-center gap-3">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Punto de Venta <span className="text-cyan-400">| Caja Registradora</span>
                </h2>
            }
        >
            <Head title="Caja Registradora" />

            <div className="bg-slate-900 min-h-screen pb-6 pt-6 relative overflow-hidden">
                <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">

                    {flash?.success && (
                        <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center shadow-lg animate-pulse">
                            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-bold text-lg">{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center shadow-lg">
                            <span className="font-bold text-lg">{flash.error}</span>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">

                        <div className="flex-1 flex flex-col h-full bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                            <div className="bg-slate-900/50 p-3 border-b border-slate-700/50 flex overflow-x-auto gap-2 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === 'all' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Todos
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === cat.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="flex flex-col h-32 bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-700/50 rounded-2xl p-4 text-left transition-all group shadow-md"
                                        >
                                            <span className="text-white font-bold text-sm sm:text-base leading-tight flex-1 group-hover:text-cyan-400 transition-colors">
                                                {product.name}
                                            </span>
                                            <span className="text-emerald-400 font-black text-lg">
                                                {formatCurrency(Number(product.sale_price))}
                                            </span>
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="col-span-full py-20 text-center text-slate-500 font-bold">
                                            No hay productos en esta categoría.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col h-full bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="font-bold text-white text-lg flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    Comanda Actual
                                </h3>
                                <span className="text-slate-400 text-sm font-bold bg-slate-800 px-3 py-1 rounded-lg">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                               </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center space-y-4">
                                        <svg className="w-16 h-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        <p>Toca un producto para agregarlo a la cuenta.</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.product_id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center gap-3">
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold text-sm leading-tight mb-1">{item.name}</h4>
                                                <div className="text-emerald-400 font-bold text-xs">{formatCurrency(item.price)} c/u</div>
                                            </div>
                                            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-600">
                                                <button type="button" onClick={() => updateQuantity(item.product_id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg></button>
                                                <span className="w-8 text-center text-white font-black text-sm">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.product_id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></button>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <div className="text-white font-black text-sm">{formatCurrency(item.price * item.quantity)}</div>
                                            </div>
                                            <button type="button" onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="bg-slate-900 border-t border-slate-700 p-4">
                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <div className="flex justify-between items-end bg-slate-800 p-4 rounded-xl border border-slate-600 shadow-inner">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">Total a Pagar</span>
                                        <span className="text-3xl font-black text-emerald-400">{formatCurrency(cartTotal)}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <button type="button" onClick={() => setData('payment_method', 'efectivo')} className={`p-3 rounded-xl border font-bold text-sm transition-all flex flex-col items-center gap-1 ${data.payment_method === 'efectivo' ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            Efectivo
                                        </button>

                                        <button type="button" onClick={() => setData('payment_method', 'nequi')} className={`p-3 rounded-xl border font-bold text-sm transition-all flex flex-col items-center gap-1 ${data.payment_method === 'nequi' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            Nequi
                                        </button>

                                        <button type="button" onClick={() => setData('payment_method', 'daviplata')} className={`p-3 rounded-xl border font-bold text-sm transition-all flex flex-col items-center gap-1 ${data.payment_method === 'daviplata' ? 'bg-rose-600/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            Daviplata
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={cart.length === 0 || processing}
                                        className="w-full py-4 bg-cyan-600 border border-transparent rounded-xl text-lg font-black text-white hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
                                    >
                                        {processing ? 'Procesando Venta...' : '💳 COBRAR ORDEN'}
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </AuthenticatedLayout>
    );
}
