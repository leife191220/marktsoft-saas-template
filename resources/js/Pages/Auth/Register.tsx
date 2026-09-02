import { useState, FormEventHandler } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    // 1. Estados para los ojitos
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex bg-slate-900 font-sans text-slate-300">
            <Head title="Registro" />

            {/* Panel Izquierdo - Visual / Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-800 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-800/40 to-indigo-600/20 z-10" />
                <div className="absolute w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] top-20 right-0" />
                <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[80px] -bottom-20 -left-10" />

                <div className="relative z-20 text-center px-12">
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight">Únete al <span className="text-purple-400">Futuro</span></h1>
                    <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
                        Crea tu cuenta de administrador y empieza a operar tu negocio con la mejor tecnología.
                    </p>
                </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
                <div className="w-full max-w-md space-y-8 relative z-20 py-10">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
                        <p className="text-slate-400 text-sm">Completa tus datos para configurar tu nuevo espacio de trabajo.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre Completo" className="text-slate-300" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-2 block w-full bg-slate-800/50 border-slate-700 text-white focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2 text-red-400" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Correo Electrónico" className="text-slate-300" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full bg-slate-800/50 border-slate-700 text-white focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2 text-red-400" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Contraseña" className="text-slate-300" />
                            <div className="relative mt-2">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full bg-slate-800/50 border-slate-700 text-white focus:border-purple-500 focus:ring-purple-500 rounded-xl pr-12"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2 text-red-400" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" className="text-slate-300" />
                            <div className="relative mt-2">
                                <TextInput
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full bg-slate-800/50 border-slate-700 text-white focus:border-purple-500 focus:ring-purple-500 rounded-xl pr-12"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2 text-red-400" />
                        </div>

                        <PrimaryButton
                            className="w-full justify-center py-3.5 mt-4 bg-purple-600 hover:bg-purple-500 focus:bg-purple-500 active:bg-purple-700 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-purple-500/25"
                            disabled={processing}
                        >
                            {processing ? 'REGISTRANDO...' : 'REGISTRARSE'}
                        </PrimaryButton>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-8">
                        ¿Ya tienes una cuenta? <Link href={route('login')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}