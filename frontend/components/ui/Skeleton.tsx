export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-200/50 dark:bg-slate-700/50 rounded-md ${className}`} />
    );
}
