"use client"
import { useState, useEffect, useCallback } from "react";
import { generateFlashcards } from "@/lib/api";
import { Loader2, ArrowLeft, ArrowRight, RotateCw, Shuffle } from "lucide-react";

interface Flashcard {
    question: string;
    answer: string;
}

export default function Flashcards({ sourceId }: { sourceId: string }) {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

    const fetchCards = async () => {
        setIsLoading(true);
        try {
            const data = await generateFlashcards(sourceId);
            setFlashcards(data);
            setCurrentIndex(0);
            setIsFlipped(false);
            setKnownCards(new Set());
        } catch (e) {
            console.error(e);
            alert("Failed to generate flashcards.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextCard = useCallback(() => {
        if (currentIndex < flashcards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    }, [currentIndex, flashcards.length]);

    const prevCard = useCallback(() => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    }, [currentIndex]);

    const markKnown = useCallback(() => {
        setKnownCards(prev => {
            const next = new Set(prev);
            next.add(currentIndex);
            return next;
        });
        nextCard();
    }, [currentIndex, nextCard]);

    const markUnknown = useCallback(() => {
        setKnownCards(prev => {
            const next = new Set(prev);
            next.delete(currentIndex);
            return next;
        });
        nextCard();
    }, [currentIndex, nextCard]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (flashcards.length === 0) return;
            if (e.key === "ArrowRight") nextCard();
            if (e.key === "ArrowLeft") prevCard();
            if (e.code === "Space") {
                e.preventDefault();
                setIsFlipped(prev => !prev);
            }
            if (e.key.toLowerCase() === "k") markKnown();
            if (e.key.toLowerCase() === "l") markUnknown();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [flashcards.length, nextCard, prevCard, markKnown, markUnknown]);

    const shuffleCards = () => {
        const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
    };

    const restartCards = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
    };

    if (flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[400px]">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                    <RotateCw className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold">Ready to Study?</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                    Generate AI flashcards from your material to test key concepts.
                </p>
                <button
                    onClick={fetchCards}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{isLoading ? "Generating..." : "Generate Flashcards"}</span>
                </button>
            </div>
        );
    }

    const progress = (knownCards.size / flashcards.length) * 100;

    return (
        <div className="max-w-3xl mx-auto py-8 flex flex-col items-center">
            {/* Header info */}
            <div className="w-full flex justify-between items-center mb-6">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Card {currentIndex + 1} of {flashcards.length}
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={shuffleCards} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500" title="Shuffle">
                        <Shuffle className="w-5 h-5" />
                    </button>
                    <button onClick={restartCards} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500" title="Restart">
                        <RotateCw className="w-5 h-5" />
                    </button>
                    <div className="text-sm font-medium px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        Known: {knownCards.size}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-10 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>

            {/* 3D Flip Card Container */}
            <div className="relative w-full aspect-[3/2] max-w-2xl mb-12 perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>

                    {/* Front: Question */}
                    <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl group-hover:shadow-2xl transition-shadow text-center">
                        <span className="absolute top-6 left-8 uppercase tracking-widest text-xs font-bold text-slate-400">Question</span>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight select-none pointer-events-none">
                            {flashcards[currentIndex].question}
                        </h2>
                        <span className="absolute bottom-6 text-sm text-slate-400">Click or press Space to flip</span>
                    </div>

                    {/* Back: Answer */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-indigo-50 dark:bg-indigo-900/40 rounded-3xl border border-indigo-100 dark:border-indigo-800 shadow-xl group-hover:shadow-2xl transition-shadow text-center">
                        <span className="absolute top-6 left-8 uppercase tracking-widest text-xs font-bold text-indigo-400">Answer</span>
                        <p className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed select-none pointer-events-none">
                            {flashcards[currentIndex].answer}
                        </p>
                    </div>

                </div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-lg mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={markUnknown}
                        className="py-4 border-2 border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors flex items-center justify-center"
                    >
                        <span>✗ Still Learning (L)</span>
                    </button>
                    <button
                        onClick={markKnown}
                        className="py-4 border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center"
                    >
                        <span>✓ Know It (K)</span>
                    </button>
                </div>
            </div>

            <div className="flex space-x-6 items-center">
                <button
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                    className="p-3 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 inline mr-1" /> Previous
                </button>
                <button
                    onClick={nextCard}
                    disabled={currentIndex === flashcards.length - 1}
                    className="p-3 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                >
                    Next <ArrowRight className="w-6 h-6 inline ml-1" />
                </button>
            </div>

            <p className="mt-8 text-xs text-slate-400">Keyboard shortcuts: ← / → navigate, Space flip, K know, L learn</p>
        </div>
    );
}
