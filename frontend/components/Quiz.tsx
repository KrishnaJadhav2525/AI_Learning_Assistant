"use client"
import { useState } from "react";
import { generateQuiz } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, RotateCw } from "lucide-react";

interface QuizQuestion {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

export default function Quiz({ sourceId }: { sourceId: string }) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const fetchQuiz = async () => {
        setIsLoading(true);
        try {
            const data = await generateQuiz(sourceId);
            setQuestions(data);
            setCurrentQuestionIdx(0);
            setSelectedAnswers({});
            setSubmitted(false);
            setShowResults(false);
        } catch (e) {
            console.error(e);
            alert("Failed to generate quiz.");
        } finally {
            setIsLoading(false);
        }
    };

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[400px]">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold">Ready for a Quiz?</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                    Test your knowledge with an AI-generated multiple choice quiz based on this material.
                </p>
                <button
                    onClick={fetchQuiz}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{isLoading ? "Generating..." : "Generate Quiz"}</span>
                </button>
            </div>
        );
    }

    // Results View
    if (showResults) {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct_index) correctCount++;
        });
        const percentage = Math.round((correctCount / questions.length) * 100);

        let scoreColor = "text-green-600 dark:text-green-400";
        if (percentage < 70) scoreColor = "text-yellow-600 dark:text-yellow-400";
        if (percentage < 50) scoreColor = "text-red-600 dark:text-red-400";

        return (
            <div className="max-w-3xl mx-auto py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold">Quiz Results</h2>
                    <div className="flex justify-center items-center py-6">
                        <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-8 border-slate-100 dark:border-slate-800`}>
                            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                                <circle
                                    cx="96" cy="96" r="88"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    fill="transparent"
                                    className={scoreColor}
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="text-center flex items-baseline">
                                <span className="text-5xl font-black">{percentage}</span><span className="text-2xl font-medium">%</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xl font-medium text-slate-600 dark:text-slate-400">
                        You scored {correctCount} out of {questions.length}
                    </p>
                </div>

                <div className="flex justify-center space-x-4">
                    <button onClick={() => { setShowResults(false); setCurrentQuestionIdx(0); }} className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                        Review Answers
                    </button>
                    <button onClick={fetchQuiz} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center">
                        <RotateCw className="w-5 h-5 mr-2" />
                        New Quiz
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIdx];
    const hasSelected = selectedAnswers[currentQuestionIdx] !== undefined;
    const progress = ((currentQuestionIdx + 1) / questions.length) * 100;

    const handleSelectOption = (index: number) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: index }));
    };

    const handleNext = () => {
        if (!submitted) {
            setSubmitted(true);
        } else {
            if (currentQuestionIdx < questions.length - 1) {
                setCurrentQuestionIdx(prev => prev + 1);
                setSubmitted(false);
            } else {
                setShowResults(true);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-6 flex flex-col items-center animate-in fade-in transition-all">
            <div className="w-full flex justify-between items-center mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                {submitted && hasSelected && (
                    <span className={selectedAnswers[currentQuestionIdx] === currentQ.correct_index ? "text-green-500 flex items-center" : "text-red-500 flex items-center"}>
                        {selectedAnswers[currentQuestionIdx] === currentQ.correct_index
                            ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Correct</>
                            : <><XCircle className="w-4 h-4 mr-1" /> Incorrect</>}
                    </span>
                )}
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-10 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="w-full space-y-8 min-h-[400px]">
                <h3 className="text-2xl font-bold leading-snug">{currentQ.question}</h3>

                <div className="space-y-3">
                    {currentQ.options.map((opt, idx) => {
                        const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                        const isCorrect = submitted && idx === currentQ.correct_index;
                        const isWrongSelection = submitted && isSelected && idx !== currentQ.correct_index;

                        let styleClasses = "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10";
                        if (isSelected && !submitted) styleClasses = "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500";
                        if (isCorrect) styleClasses = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100";
                        if (isWrongSelection) styleClasses = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100";
                        if (submitted && !isCorrect && !isWrongSelection) styleClasses = "border-slate-200 dark:border-slate-800 opacity-50";

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(idx)}
                                disabled={submitted}
                                className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all min-h-[48px] ${styleClasses}`}
                            >
                                <span className="font-medium">{opt}</span>
                            </button>
                        );
                    })}
                </div>

                {submitted && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">Explanation</span>
                        <p className="text-slate-700 dark:text-slate-300">{currentQ.explanation}</p>
                    </div>
                )}
            </div>

            <div className="w-full mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!hasSelected}
                    className="px-8 py-4 bg-slate-900 dark:bg-slate-100 hover:bg-black dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!submitted
                        ? "Check Answer"
                        : (currentQuestionIdx === questions.length - 1 ? "Finish Quiz" : "Next Question")
                    }
                </button>
            </div>
        </div>
    );
}
