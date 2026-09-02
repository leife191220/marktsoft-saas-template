import { Link } from '@inertiajs/react';

export default function Pagination({ links }: { links: any[] }) {
    return (
        <div className="flex flex-wrap justify-center gap-1">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="px-4 py-2 text-sm text-slate-600 bg-slate-800/50 border border-slate-700 rounded-lg cursor-not-allowed"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`px-4 py-2 text-sm border rounded-lg transition-all duration-200 ${
                            link.active
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
}