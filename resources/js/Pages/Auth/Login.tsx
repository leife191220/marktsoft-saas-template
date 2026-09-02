import { useState, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    // 1. Estado para controlar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex bg-slate-900 font-sans text-slate-300">
            <Head title="Iniciar Sesión" />

            {/* Panel Izquierdo - Visual / Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-800 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-800/40 z-10" />
                <div className="absolute w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] -top-20 -left-20" />
                <div className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px] bottom-10 right-10" />

                <div className="relative z-20 text-center px-12">
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight">MarktSoft <span className="text-indigo-400">POS</span></h1>
                    <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
                        Sistema de gestión inteligente. Controla tus ventas, inventario y flujo de caja en tiempo real.
                    </p>
                </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
                <div className="w-full max-w-md space-y-8 relative z-20">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Bienvenido de nuevo</h2>
                        <p className="text-slate-400 text-sm">Ingresa tus credenciales para acceder al sistema.</p>
                    </div>

                    {status && <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-400">{status}</div>}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="email" value="Correo Electrónico" className="text-slate-300" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2 text-red-400" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Contraseña" className="text-slate-300" />
                            
                            {/* CONTENEDOR RELATIVO PARA EL OJITO */}
                            <div className="relative mt-2">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-xl pr-12"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2 text-red-400" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 rounded"
                                />
                                <span className="text-sm text-slate-400 select-none">Recordarme</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            )}
                        </div>

                        <PrimaryButton
                            className="w-full justify-center py-3.5 bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-700 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25"
                            disabled={processing}
                        >
                            {processing ? 'INICIANDO...' : 'INICIAR SESIÓN'}
                        </PrimaryButton>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-8">
                        ¿No tienes una cuenta? <Link href={route('register')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}