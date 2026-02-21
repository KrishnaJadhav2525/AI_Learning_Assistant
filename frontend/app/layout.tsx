import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AI Learning Assistant - Automate Your Studying',
    template: '%s | AI Learning Assistant'
  },
  description: 'Transform YouTube videos and PDFs into interactive flashcards, quizzes, and chat sessions with AI.',
  keywords: ['AI', 'Learning', 'Education', 'Flashcards', 'Quiz', 'RAG', 'PDF', 'YouTube'],
  authors: [{ name: 'Krishna' }],
  creator: 'Krishna',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-learning-assistant.vercel.app',
    title: 'AI Learning Assistant',
    description: 'Turn unstructured content into interactive study aids instantly using ChatGPT.',
    siteName: 'AI Learning Assistant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Learning Assistant',
    description: 'Transform YouTube videos and PDFs into interactive study sessions.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-200`}>
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Learning Assistant
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
