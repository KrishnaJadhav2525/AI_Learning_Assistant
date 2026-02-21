"use client"
import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"

export interface ToastProps {
    message: string;
    type: "success" | "error" | "info";
    duration?: number;
    onClose?: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) setTimeout(onClose, 300); // Wait for fade out
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center p-4 mb-4 text-slate-500 bg-white rounded-lg shadow-xl dark:text-slate-400 dark:bg-slate-800 animate-in slide-in-from-bottom-5 fade-in">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${type === "success" ? "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200" :
                    type === "error" ? "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200" :
                        "text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200"
                }`}>
                {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="ms-3 text-sm font-normal mr-4">{message}</div>
            <button type="button" onClick={() => setIsVisible(false)} className="ms-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8 dark:text-slate-500 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Very simple toast provider hook context (for Phase 9)
// Given React limitations, the request usually asks for just the component to be placed somewhere.
