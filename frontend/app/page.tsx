"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processVideo, processPDF } from '@/lib/api';
import { Youtube, UploadCloud, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoadingText, setIsLoadingText] = useState<'youtube' | 'pdf' | null>(null);
  const [processedSourceId, setProcessedSourceId] = useState<string | null>(null);
  const [processedTitle, setProcessedTitle] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleProcessVideo = async () => {
    if (!youtubeUrl) return;
    setIsLoadingText('youtube');
    try {
      const data = await processVideo(youtubeUrl);
      setProcessedSourceId(data.source_id);
      setProcessedTitle(data.title);
    } catch (e) {
      console.error(e);
      alert("Failed to process video");
    } finally {
      setIsLoadingText(null);
    }
  };

  const handleProcessPDF = async () => {
    if (!pdfFile) return;
    setIsLoadingText('pdf');
    try {
      const data = await processPDF(pdfFile);
      setProcessedSourceId(data.source_id);
      setProcessedTitle(data.title);
    } catch (e) {
      console.error(e);
      alert("Failed to process PDF");
    } finally {
      setIsLoadingText(null);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Only PDF files are supported");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">AI Learning Assistant</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Turn any YouTube video or PDF into flashcards, quizzes & interactive study sessions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Youtube Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-lg">
              <Youtube className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold">YouTube Video</h2>
          </div>
          {processedSourceId && processedTitle ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center mb-6">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium truncate">Processed: {processedTitle}</span>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Paste YouTube URL here..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
              <button
                onClick={handleProcessVideo}
                disabled={!youtubeUrl || isLoadingText === 'youtube'}
                className="w-full py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoadingText === 'youtube' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process Video"}
              </button>
            </div>
          )}
        </div>

        {/* PDF Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-lg">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold">Upload PDF</h2>
          </div>
          {processedSourceId && processedTitle ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center mb-6">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium truncate">Processed: {processedTitle}</span>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isHovering ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-300 dark:border-slate-700"
                  }`}
              >
                {pdfFile ? (
                  <div className="font-medium text-indigo-600 dark:text-indigo-400 truncate px-2">{pdfFile.name}</div>
                ) : (
                  <div className="text-slate-500 dark:text-slate-400 text-sm">
                    Drag & drop your PDF here, or <br />
                    <label className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium inline-block mt-2">
                      browse file
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                        if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                      }} />
                    </label>
                  </div>
                )}
              </div>
              <button
                onClick={handleProcessPDF}
                disabled={!pdfFile || isLoadingText === 'pdf'}
                className="w-full py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoadingText === 'pdf' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process PDF"}
              </button>
            </div>
          )}
        </div>
      </div>

      {processedSourceId && (
        <button
          onClick={() => router.push(`/learn/${processedSourceId}`)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
