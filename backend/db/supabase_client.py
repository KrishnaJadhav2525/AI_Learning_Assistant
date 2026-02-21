import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def match_chunks(query_embedding: list[float], source_id: str, top_k: int = 5) -> list[dict]:
    """Calls the Supabase RPC function for cosine similarity search of pgvector chunks"""
    response = supabase.rpc("match_chunks", {
        "query_embedding": query_embedding,
        "match_source_id": source_id,
        "match_count": top_k
    }).execute()
    
    return response.data
