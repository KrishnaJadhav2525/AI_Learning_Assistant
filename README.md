# AI Learning Assistant 🧠

An intelligent web application that transforms unstructured educational content (YouTube videos and PDFs) into interactive study materials, including AI-generated flashcards, quizzes, and a rich RAG chat interface.

## Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS, TypeScript, Lucide Icons
- **Backend**: FastAPI, Python, Supabase (PostgreSQL + pgvector), OpenAI
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Features
- **YouTube Ingestion**: Automatically extracts video transcripts.
- **PDF Extraction**: Parses uploaded documents into text.
- **RAG Chat**: Ask questions directly to your study materials with streaming SSE responses.
- **Generative Quizzes**: 8-question multiple choice quizzes dynamically generated based on chunked context.
- **3D Flashcards**: 12 custom flashcards with "Know it / Still Learning" keyboard tracking.
- **Semantic Search**: Text embeddings stored in Supabase via OpenAI `text-embedding-3-small` with fast cosine similarity RPC queries.

## Getting Started

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. Activate the environment (e.g. `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. Create `.env` from `.env.example` and populate your keys:
    - `OPENAI_API_KEY`
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_KEY`
6. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env.local` containing `NEXT_PUBLIC_API_URL=http://localhost:8000`
4. Run the dev server: `npm run dev`

### Supabase Initialization
1. Execute `backend/db/schema.sql` inside the Supabase SQL editor.

## Documentation
Please view individual phase commit histories to see how the architecture was incrementally constructed from scaffold to SSE streaming logic.
