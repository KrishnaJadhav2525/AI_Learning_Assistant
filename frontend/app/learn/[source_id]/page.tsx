"use client"
import { useState, use, useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
// In real app, import actual components from '@/components/...'
// For Phase 5 we scaffold the layout around the tabs first.

import dynamic from "next/dynamic";

const Flashcards = dynamic(() => import('@/components/Flashcards').then(m => m.default || m), {
    loading: () => <Skeleton className="h-[400px] w-full" />,
    ssr: false
});
const Quiz = dynamic(() => import('@/components/Quiz').then(m => m.default || m), {
    loading: () => <Skeleton className="h-[400px] w-full" />,
    ssr: false
});
const Chat = dynamic(() => import('@/components/Chat').then(m => m.default || m), {
    loading: () => <Skeleton className="h-[400px] w-full" />,
    ssr: false
});

type TabOptions = "Overview" | "Flashcards" | "Quiz" | "Chat";

export default function LearnPage({ params }: { params: Promise<{ source_id: string }> }) {
    const resolvedParams = use(params);
    const sourceId = resolvedParams.source_id;
    const [activeTab, setActiveTab] = useState<TabOptions>("Overview");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock fetch of metadata
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [sourceId]);

    const tabs: TabOptions[] = ["Overview", "Flashcards", "Quiz", "Chat"];

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in py-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in py-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Study Session
            </h1>

            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab
                                ? "bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-2xl rounded-tr-2xl p-6 shadow-sm min-h-[500px]">
                {activeTab === "Overview" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Source Overview</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Your content has been successfully processed and indexed into the vector database.
                            You can now navigate between the tabs above to generate flashcards, take a quiz, or chat directly with the material.
                        </p>
                    </div>
                )}
                {activeTab === "Flashcards" && <Flashcards sourceId={sourceId} />}
                {activeTab === "Quiz" && <Quiz sourceId={sourceId} />}
                {activeTab === "Chat" && <Chat sourceId={sourceId} />}
            </div>
        </div>
    );
}
