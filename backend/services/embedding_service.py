import os
import tiktoken
from typing import List
from dotenv import load_dotenv
from openai import OpenAI
from backend.db.supabase_client import supabase

load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """Splits text into overlapping chunks using tiktoken base token counter."""
    try:
        encoding = tiktoken.get_encoding("cl100k_base")
    except Exception:
        encoding = tiktoken.encoding_for_model("gpt-4")

    # Rough approximation of splitting. We split first by sentences/lines simply for cleaner boundaries.
    paragraphs = text.split("\n")
    
    chunks = []
    current_chunk = []
    current_length = 0
    
    for p in paragraphs:
        if not p.strip():
            continue
            
        p_tokens = len(encoding.encode(p))
        
        # If a single paragraph is larger than chunk_size, we just force it in for now
        # A more robust strategy splits individual sentences.
        if current_length + p_tokens > chunk_size and current_chunk:
            chunks.append("\n".join(current_chunk))
            
            # Handle overlap by keeping the last N elements of current_chunk
            # We approximate N to keep ~overlap tokens in context
            overlap_length = 0
            overlap_chunk = []
            for sent in reversed(current_chunk):
                s_tokens = len(encoding.encode(sent))
                if overlap_length + s_tokens <= overlap:
                    overlap_chunk.insert(0, sent)
                    overlap_length += s_tokens
                else:
                    break
                    
            current_chunk = overlap_chunk
            current_length = sum(len(encoding.encode(s)) for s in current_chunk)
            
        current_chunk.append(p)
        current_length += p_tokens
        
    if current_chunk:
        chunks.append("\n".join(current_chunk))
        
    return chunks

def embed_chunks(chunks: List[str]) -> List[List[float]]:
    """Converts a list of text chunks into embedding vectors using OpenAI text-embedding-3-small."""
    embeddings = []
    
    # Process in batches of 100 for efficiency
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        try:
            response = openai_client.embeddings.create(
                input=batch,
                model="text-embedding-3-small"
            )
            # OpenAI response contains a list of objects under `.data`
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)
        except Exception as e:
            raise ValueError(f"Failed to create embeddings from OpenAI: {str(e)}")
            
    return embeddings

def store_chunks(source_id: str, chunks: List[str], embeddings: List[List[float]]) -> None:
    """Inserts all combined chunks into the Supabase database."""
    if len(chunks) != len(embeddings):
        raise ValueError("Mismatch between chunks and embeddings list sizes")
        
    data = []
    for idx, (chunk_text, embedding_vector) in enumerate(zip(chunks, embeddings)):
        data.append({
            "source_id": source_id,
            "content": chunk_text,
            "embedding": embedding_vector,
            "chunk_index": idx
        })
        
    if data:
        # Use upsert or insert batched
        # Note Supabase client supports large array insertions if POST limit isn't reached
        response = supabase.table("chunks").insert(data).execute()
        
        # Depending on supabase-py version this might return .data on success or error.
        if not response.data and getattr(response, 'error', None):
             raise Exception(f"Failed inserting chunks to db. error: {response.error}")
