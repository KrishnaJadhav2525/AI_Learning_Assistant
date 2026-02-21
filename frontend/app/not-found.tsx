import Link from 'next/link';
import { Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-in fade-in slide-in-from-bottom-5">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                <HelpCircle className="w-12 h-12 text-indigo-500" />
            </div>

            <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-700 dark:text-slate-300 mb-6">Page Not Found</h2>

            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mb-10">
                We couldn't find the page you're looking for. It might have been moved or deleted.
            </p>

            <Link
                href="/"
                className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
            </Link>
        </div>
    );
}
