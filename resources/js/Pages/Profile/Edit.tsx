import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    auth, // <-- 1. Agregamos auth aquí
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            user={auth.user} // <-- 2. Pasamos el user al layout para quitar el error
            header={
                <h2 className="text-2xl font-black leading-tight text-white tracking-tight">
                    Mi Perfil <span className="text-indigo-400 font-medium">| Configuración</span>
                </h2>
            }
        >
            <Head title="Perfil" />

            {/* Ajustado ligeramente para mantener el fondo oscuro del sistema */}
            <div className="py-12 bg-slate-900 min-h-screen">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 shadow-xl sm:rounded-2xl sm:p-8 text-slate-300">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 shadow-xl sm:rounded-2xl sm:p-8 text-slate-300">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 shadow-xl sm:rounded-2xl sm:p-8 text-slate-300">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
