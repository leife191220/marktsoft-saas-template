import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Bienvenido | MarktSoft POS" />
            
            <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden selection:bg-indigo-500 selection:text-white font-sans">
                
                {/* --- EFECTOS DE LUZ DE FONDO (Fondo oscuro con destellos) --- */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
                
                {/* --- CONTENEDOR PRINCIPAL --- */}
                <div className="relative z-10 w-full max-w-md px-6 sm:px-0">
                    
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-10 text-center transform transition-all hover:border-slate-700">
                        
                        {/* --- LOGO --- */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-inner shadow-indigo-500/10">
                                <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* --- TÍTULOS --- */}
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                            MarktSoft <span className="text-indigo-400">POS</span>
                        </h1>
                        <p className="text-slate-400 text-sm mb-10 font-medium">
                            Sistema de Punto de Venta y Control de Inventario para <span className="text-white font-bold">La Estación</span>.
                        </p>

                        {/* --- BOTONES DE ACCIÓN --- */}
                        <div className="flex flex-col gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full inline-flex justify-center items-center px-8 py-3.5 bg-indigo-600 border border-transparent rounded-xl text-sm font-black tracking-widest uppercase text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    Entrar al Sistema &rarr;
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="w-full inline-flex justify-center items-center px-8 py-3.5 bg-indigo-600 border border-transparent rounded-xl text-sm font-black tracking-widest uppercase text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    
                                    {/* Opcional: Si el registro está habilitado. Si solo tú creas usuarios, puedes comentar/borrar este botón */}
                                    <Link
                                        href={route('register')}
                                        className="w-full inline-flex justify-center items-center px-8 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold tracking-widest uppercase text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                                    >
                                        Registrar Personal
                                    </Link>
                                </>
                            )}
                        </div>

                    </div>

                    {/* --- FOOTER --- */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-600 font-medium">
                            &copy; {new Date().getFullYear()} MarktSoft Agency. Todos los derechos reservados.
                        </p>
                        <p className="text-[10px] text-slate-700 mt-1 uppercase tracking-widest">
                            V 1.0.0 | Laravel {laravelVersion}
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}