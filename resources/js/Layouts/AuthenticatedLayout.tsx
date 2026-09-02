import { useState, useEffect, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';

// ==============================================================================
// 1. SUB-COMPONENTES DE INTERFAZ (Extraídos para mantener el Layout limpio)
// ==============================================================================

const Logo = () => (
    <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <Link href={route('dashboard')} className="text-2xl font-black text-white tracking-tight">
            MaktSoft <span className="text-indigo-400">POS</span>
        </Link>
    </div>
);

const UserProfile = ({ user }: { user: any }) => (
    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center w-full px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <Link href={route('profile.edit')} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest text-[10px]">
                    Ajustes
                </Link>
            </div>
            <Link href={route('logout')} method="post" as="button" className="ml-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </Link>
        </div>
    </div>
);

const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => (
    <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-30 shadow-xl">
        <Link href={route('dashboard')} className="text-xl font-black text-white tracking-tight">
            MaktSoft <span className="text-indigo-400">POS</span>
        </Link>
        <button onClick={onMenuClick} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>
);

const ToastAlert = ({ toast, onClose }: { toast: { type: 'success' | 'error', text: string } | null, onClose: () => void }) => {
    if (!toast) return null;
    const isSuccess = toast.type === 'success';

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-[bounce_0.5s_ease-in-out]">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
                isSuccess 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' 
                : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'
            }`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d={isSuccess ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} />
                </svg>
                <p className="font-bold">{toast.text}</p>
                <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// ==============================================================================
// 2. COMPONENTE PRINCIPAL (Orquestador del Layout)
// ==============================================================================

export default function AuthenticatedLayout({ user, header, children }: PropsWithChildren<{ user: any, header?: ReactNode }>) {
    const { url, props } = usePage<any>();
    
    // Estados de la UI
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(url.startsWith('/reports'));
    // Nuevo estado para el menú de Bodega/Compras
    const [isInventoryOpen, setIsInventoryOpen] = useState(url.startsWith('/ingredients') || url.startsWith('/purchases') || url.startsWith('/categories'));
    const [toast, setToast] = useState<{type: 'success'|'error', text: string} | null>(null);

    // Lógica del sistema de notificaciones
    useEffect(() => {
        const { flash, errors } = props;
        let message = null;
        let type: 'success' | 'error' = 'success';

        if (flash?.success) {
            message = flash.success;
            type = 'success';
        } else if (flash?.error) {
            message = flash.error;
            type = 'error';
        } else if (errors && Object.keys(errors).length > 0) {
            message = Object.values(errors)[0]; 
            type = 'error';
        }

        if (message) {
            setToast({ type, text: message as string });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [props]);

    // Configuración de Navegación Principal
    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: url === '/dashboard' },
        { name: 'Punto de Venta (POS)', href: route('pos.index'), icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', active: url.startsWith('/pos') },
        { name: 'Flujo de Caja', href: route('expenses.index'), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', active: url.startsWith('/expenses') },
        { name: 'Mesas y Comandas', href: route('orders.index'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', active: url.startsWith('/orders') },
        { 
            name: 'Configurar Mesas', 
            href: route('tables.index'), 
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', 
            active: url.startsWith('/tables') 
        },
        { 
            name: 'Carta y Menú', 
            href: route('products.index'), 
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', 
            active: url.startsWith('/products') 
        },
    ];

    return (
        <div className="flex h-screen bg-slate-900 font-sans overflow-hidden">
            
            {/* Fondo Oscuro Móvil */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar Lateral */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Logo />
                
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 relative z-10 custom-scrollbar">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 ml-2">Menú Principal</div>
                    
                    {/* Renderizado de Enlaces Simples */}
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                item.active
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.name}
                        </Link>
                    ))}

                    {/* Acordeón BODEGA Y COMPRAS (NUEVO) */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                url.startsWith('/ingredients') || url.startsWith('/purchases') || url.startsWith('/categories') 
                                ? 'bg-emerald-600/5 text-emerald-400' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>Bodega y Compras</span>
                            <svg className={`ml-auto w-4 h-4 transform transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isInventoryOpen && (
                            <div className="mt-1 ml-9 space-y-1 border-l border-slate-800 pl-2">
                                <Link href={route('purchases.index')} className={`block px-4 py-2 text-xs font-bold rounded-lg transition-colors ${url.startsWith('/purchases') ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-slate-300'}`}>• Ingreso Facturas</Link>
                                <Link href={route('ingredients.index')} className={`block px-4 py-2 text-xs font-bold rounded-lg transition-colors ${url === '/ingredients' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-slate-300'}`}>• Insumos (Stock)</Link>
                                <Link href={route('categories.index')} className={`block px-4 py-2 text-xs font-bold rounded-lg transition-colors ${url.startsWith('/categories') ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-slate-300'}`}>• Categorías Base</Link>
                            </div>
                        )}
                    </div>

                    {/* Acordeón REPORTES */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsReportsOpen(!isReportsOpen)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                url.startsWith('/reports') ? 'bg-indigo-600/5 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Reportes</span>
                            <svg className={`ml-auto w-4 h-4 transform transition-transform duration-200 ${isReportsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isReportsOpen && (
                            <div className="mt-1 ml-9 space-y-1 border-l border-slate-800 pl-2">
                                <Link href={route('reports.index')} className={`block px-4 py-2 text-xs font-bold rounded-lg transition-colors ${url === '/reports' ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-500 hover:text-slate-300'}`}>• Rentabilidad (P.E)</Link>
                                <Link href={route('reports.movements')} className={`block px-4 py-2 text-xs font-bold rounded-lg transition-colors ${url === '/reports/movements' ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-500 hover:text-slate-300'}`}>• Movimientos de Caja</Link>
                                
                                {/* NUEVO BOTÓN: Cierre de Caja Z */}
                                <Link href={route('reports.z_closure')} className={`block px-4 py-2 text-xs font-bold rounded-lg transition-colors ${url.startsWith('/reports/z-closure') ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-500 hover:text-slate-300'}`}>• Cierre de Caja (Z)</Link>
                            </div>
                        )}
                    </div>

                    {/* Proveedores */}
                    <div className="pt-2">
                        <Link
                            href={route('suppliers.index')}
                            className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                url.startsWith('/suppliers') ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Proveedores
                        </Link>
                    </div>
                </div>
                
                <UserProfile user={user} />
            </aside>

            {/* Contenedor Principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto bg-slate-900 custom-scrollbar">
                    {header && (
                        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-20 shadow-sm">
                            <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">{header}</div>
                        </header>
                    )}
                    <div className="relative z-10">{children}</div>
                </main>
            </div>

            {/* Renderizado de Alerta Flotante */}
            <ToastAlert toast={toast} onClose={() => setToast(null)} />

            {/* Estilos globales para la barra de desplazamiento (Opcional, hace que se vea más limpio) */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>

        </div>
    );
}