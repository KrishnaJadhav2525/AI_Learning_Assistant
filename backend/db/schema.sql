-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Stores processed sources (YouTube or PDF)
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,              -- 'youtube' or 'pdf'
    title TEXT,
    url TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Stores text chunks with embeddings
CREATE TABLE chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),          -- for text-embedding-3-small
    chunk_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create IVFFlat index for fast similarity search
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Stores chat history per source session
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    role TEXT NOT NULL,              -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- match_chunks SQL function
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding VECTOR(1536),
    match_source_id UUID,
    match_count INT DEFAULT 5
)
RETURNS TABLE(id UUID, content TEXT, similarity FLOAT)
LANGUAGE SQL STABLE AS $$
    SELECT id, content, 1 - (embedding <=> query_embedding) AS similarity
    FROM chunks
    WHERE source_id = match_source_id
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;
