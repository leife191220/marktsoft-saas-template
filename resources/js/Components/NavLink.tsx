import { Link, InertiaLinkProps } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-200 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-indigo-500 text-white focus:border-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600 focus:text-slate-200 focus:border-slate-600') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
