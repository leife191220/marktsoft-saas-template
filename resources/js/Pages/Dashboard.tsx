import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { PageProps } from '@/types';
import { formatCurrency } from '@/Utils/formatters';

// Interfaces locales para los módulos del dashboard
interface ChartData {
    fecha: string;
    total: number;
}

interface LowStockItem {
    name: string;
    current_stock: number;
    unit_of_measure: string;
}

interface TopProduct {
    name: string;
    total_sold: number;
    total_revenue: number;
}

interface DashboardMetrics {
    valorInventario?: number;
    gastosPersonales?: number;
    ventasTotales?: number;
    gastosNegocio?: number;
    flujoNeto?: number;
    puntoEquilibrio?: number;
    chartData?: ChartData[];
    lowStock?: LowStockItem[];
    topProducts?: TopProduct[];
}

interface CustomPageProps extends PageProps {
    metrics?: DashboardMetrics;
}

export default function Dashboard({ auth, metrics }: CustomPageProps) {
    const { props } = usePage<CustomPageProps>();

    const d = useMemo(() => {
        const source = metrics || props.metrics || {};
        return {
            valorInventario: source.valorInventario || 0,
            gastosPersonales: source.gastosPersonales || 0,
            ventasTotales: source.ventasTotales || 0,
            gastosNegocio: source.gastosNegocio || 0,
            flujoNeto: source.flujoNeto || 0,
            puntoEquilibrio: source.puntoEquilibrio || 6200000,
            chartData: source.chartData || [],
            lowStock: source.lowStock || [],
            topProducts: source.topProducts || []
        };
    }, [metrics, props.metrics]);

    const getStockColor = (stock: number) => {
        if (stock <= 2) return 'bg-rose-500 shadow-rose-500/50';
        if (stock <= 8) return 'bg-amber-500 shadow-amber-500/50';
        return 'bg-emerald-500 shadow-emerald-500/50';
    };

    const modules = [
        {
            title: 'Punto de Venta (POS)', description: 'Facturación rápida en barra, registro de pagos y propinas.',
            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
            color: 'from-emerald-500/20 to-teal-500/5', textColor: 'text-emerald-400', route: route('pos.index'),
        },
        {
            title: 'Carta y Recetario', description: 'Gestión de productos para la venta y escandallos (recetas).',
            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
            color: 'from-purple-500/20 to-fuchsia-500/5', textColor: 'text-purple-400', route: route('products.index'),
        },
        {
            title: 'Inventario y Compras', description: 'Control de botellas, stock y escáner IA de facturas.',
            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
            color: 'from-orange-500/20 to-red-500/5', textColor: 'text-orange-400', route: route('ingredients.index'),
        },
        {
            title: 'Flujo de Caja', description: 'Cierres diarios, gastos operativos y pagos de nómina.',
            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            color: 'from-indigo-500/20 to-blue-500/5', textColor: 'text-indigo-400', route: route('expenses.index'),
        },
        {
            title: 'Directorio Proveedores', description: 'Gestiona contactos, teléfonos y empresas aliadas.',
            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
            color: 'from-amber-500/20 to-yellow-500/5', textColor: 'text-amber-400', route: route('suppliers.index'),
        },
        {
            title: 'Mesas y Comandas', description: 'Monitor de pedidos activos vía Telegram.',
            icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
            color: 'from-blue-500/20 to-indigo-500/5', textColor: 'text-blue-400', route: route('orders.index'),
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-black leading-tight text-white tracking-tight">Centro de Control <span className="text-indigo-400 font-medium">| La Estación</span></h2>}>
            <Head title="Dashboard" />

            <div className="bg-slate-900 pb-20 pt-8 relative overflow-hidden min-h-screen">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">

                    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 p-8 shadow-xl relative">
                        <h3 className="text-xl font-bold text-white mb-2">¡Bienvenido, {auth.user.name}! 👋</h3>
                        <p className="text-slate-400 max-w-2xl text-sm">Resumen operativo y financiero.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Valor Inventario</p>
                            <h4 className="text-xl font-black text-orange-400">{formatCurrency(d.valorInventario)}</h4>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Ventas del Mes</p>
                            <h4 className="text-xl font-black text-emerald-400">{formatCurrency(d.ventasTotales)}</h4>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Gastos Negocio</p>
                            <h4 className="text-xl font-black text-indigo-400">{formatCurrency(d.gastosNegocio)}</h4>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Punto Equilibrio</p>
                            <h4 className="text-xl font-black text-white">{((d.ventasTotales / (d.puntoEquilibrio || 1)) * 100).toFixed(1)}%</h4>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                Flujo de Ventas (Últimos 30 días)
                            </h3>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={d.chartData}>
                                        <defs>
                                            <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val ? val.split('-')[2] : ''} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
                                        <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorV)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl h-[166px] flex flex-col justify-center">
                                <p className="text-blue-400 text-xs font-bold uppercase mb-1">Flujo Neto</p>
                                <h2 className="text-4xl font-black text-white">{formatCurrency(d.flujoNeto)}</h2>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl h-[166px] flex flex-col justify-center">
                                <p className="text-rose-400 text-xs font-bold uppercase mb-1">Gastos Casa</p>
                                <h2 className="text-3xl font-black text-white">{formatCurrency(d.gastosPersonales)}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                                    Alerta de Insumos Críticos
                                </h3>
                                <Link href={route('purchases.create')} className="text-xs font-bold text-indigo-400 hover:text-white transition-colors">Abastecer &rarr;</Link>
                            </div>

                            {d.lowStock.length === 0 ? (
                                <div className="text-center py-8 text-emerald-400 font-bold bg-emerald-400/10 rounded-xl border border-emerald-400/20">
                                    ¡Bodega sana! No hay insumos por agotarse.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {d.lowStock.map((item, i) => {
                                        const percentage = Math.min((Number(item.current_stock) / 20) * 100, 100);
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-bold text-slate-200">{item.name}</span>
                                                    <span className="font-black text-white">
                                                        {Number(item.current_stock)} <span className="text-[10px] text-slate-500 font-normal uppercase">{item.unit_of_measure}</span>
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                                                    <div className={`h-2.5 rounded-full shadow-lg ${getStockColor(Number(item.current_stock))}`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
                                <h3 className="text-lg font-bold text-white">🔥 Top Más Vendidos (Mes)</h3>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unidades</span>
                            </div>

                            {d.topProducts.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 font-bold bg-slate-900/50 rounded-xl border border-slate-700 border-dashed">
                                    Aún no hay ventas suficientes este mes.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {d.topProducts.map((product, index) => {
                                        const maxSold = Number(d.topProducts[0].total_sold);
                                        const percentage = (Number(product.total_sold) / maxSold) * 100;

                                        return (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-slate-400 shrink-0">{index + 1}</div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-bold text-slate-200">{product.name}</span>
                                                        <span className="font-black text-emerald-400 text-xs">{formatCurrency(Number(product.total_revenue))}</span>
                                                    </div>
                                                    <div className="w-full flex items-center gap-3">
                                                        <div className="flex-1 bg-slate-900 rounded-full h-1.5 border border-slate-700 overflow-hidden">
                                                            <div className="bg-cyan-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-white w-8 text-right">{product.total_sold}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module, index) => (
                            <Link key={index} href={module.route} className="group relative overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full shadow-lg">
                                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${module.color}`} />
                                <div className="relative z-10 flex-1">
                                    <div className={`mb-4 p-3 inline-block rounded-xl bg-slate-900/50 border border-slate-700 ${module.textColor}`}>{module.icon}</div>
                                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{module.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{module.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
