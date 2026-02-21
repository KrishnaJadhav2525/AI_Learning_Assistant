"use client"
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorMsg: ""
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMsg: error.message };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl m-4">
                    <AlertOctagon className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Something went wrong</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                        An unexpected error occurred in this component. Try refreshing the page.
                    </p>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg text-sm text-red-600 dark:text-red-400 font-mono text-left w-full overflow-auto border border-red-200 dark:border-red-800">
                        {this.state.errorMsg}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
