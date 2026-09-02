import { Link, InertiaLinkProps } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start ps-3 pe-4 py-3 border-l-4 ${
                active
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 focus:text-indigo-300 focus:bg-indigo-500/20 focus:border-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-slate-600 focus:text-white focus:bg-slate-800/80 focus:border-slate-600'
            } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
