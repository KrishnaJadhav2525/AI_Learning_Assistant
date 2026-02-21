import os
from typing import AsyncGenerator, List, Dict
from dotenv import load_dotenv
from openai import AsyncOpenAI
from backend.db.supabase_client import match_chunks
from backend.services.embedding_service import embed_chunks

load_dotenv()
# Important: using AsyncOpenAI for async generator streaming
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_relevant_chunks(source_id: str, query: str, top_k: int = 5) -> List[str]:
    """Retrieves context by embedding the user's query and executing cosine matching."""
    # embed_chunks returns a list of embeddings arrays, we select [0]
    query_vector = embed_chunks([query])[0]
    results = match_chunks(query_vector, source_id, top_k)
    
    if not results:
        return []
        
    return [match['content'] for match in results]

def build_rag_prompt(context_chunks: List[str], chat_history: List[Dict], user_message: str) -> List[Dict]:
    """Assembles all system formatting, retrieved contexts, and past chat histories."""
    system_msg = {
        "role": "system",
        "content": "You are a helpful learning assistant. Answer questions based ONLY on the provided context. If the answer is not in the context, say so. Be concise and educational."
    }
    
    joined_chunks = "\n\n".join(context_chunks)
    context_msg = {
        "role": "user",
        "content": f"CONTEXT:\n{joined_chunks}\n---"
    }
    
    # We slice chat_history to max last 6 context messages in the router logic
    # but the input chat_history is already assumed to be limited.
    messages = [system_msg, context_msg]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_message})
    
    return messages

async def stream_chat_response(messages: List[Dict]) -> AsyncGenerator[str, None]:
    """Initiates an OpenAI stream and yields SSE compliant lines."""
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True,
            temperature=0.7
        )
        
        async for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                text = chunk.choices[0].delta.content
                yield f"data: {text}\n\n"
                
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"
        yield "data: [DONE]\n\n"
