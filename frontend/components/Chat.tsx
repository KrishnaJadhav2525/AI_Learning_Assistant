"use client"
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function Chat({ sourceId }: { sourceId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming]);

    const sendMessage = async (overrideMsg?: string) => {
        const textToSend = overrideMsg || input;
        if (!textToSend.trim() || isStreaming) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsStreaming(true);

        const aiMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: "" }]);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_id: sourceId, message: textToSend })
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            break;
                        } else if (data.startsWith('[ERROR]')) {
                            accumulatedContent += `\n**Error:** ${data.replace('[ERROR]', '')}`;
                        } else {
                            // Since we have newlines separated by \n\n in SSE chunks potentially, 
                            // we just append directly preserving whitespace tokens originally yielded by openai
                            accumulatedContent += data + " ";
                        }

                        setMessages(prev => prev.map(msg =>
                            msg.id === aiMsgId ? { ...msg, content: accumulatedContent } : msg
                        ));
                    }
                }
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Sorry, I encountered an error while processing your request." }]);
        } finally {
            setIsStreaming(false);
        }
    };

    const starterQuestions = [
        "What is the main topic of this content?",
        "Summarize the key points",
        "What are the most important takeaways?"
    ];

    return (
        <div className="flex flex-col h-[600px] max-w-4xl mx-auto border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm animate-in fade-in">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-950/50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center text-slate-500">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-6">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Start a Conversation</h3>
                            <p className="max-w-xs mx-auto mt-2">Ask questions to deepen your understanding of the material.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg">
                            {starterQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600 text-white ml-3' : 'bg-slate-800 dark:bg-slate-700 text-white mr-3'}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Message bubble */}
                                <div className={`px-5 py-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'}`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                className="rounded-md my-2"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-700" {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {msg.content || (isStreaming ? '...' : '')}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isStreaming && (
                    <div className="flex w-full justify-start mt-4">
                        <div className="flex flex-row max-w-[85%] items-center text-slate-400 space-x-2">
                            <div className="w-8 h-8 flex-shrink-0" />
                            <span className="text-sm">AI is typing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex items-center space-x-2 relative"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about the material..."
                        disabled={isStreaming}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-4 py-4 pr-14 transition-all outline-none ring-0 placeholder:text-slate-400 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isStreaming}
                        className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
