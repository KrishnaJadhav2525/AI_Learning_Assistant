from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from backend.models.schemas import ChatRequest
from backend.services.rag_service import get_relevant_chunks, build_rag_prompt, stream_chat_response
from backend.db.supabase_client import supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Fetch chat history for this source (limit to last 10)
        history_res = supabase.table("chat_history") \
            .select("role, content") \
            .eq("source_id", request.source_id) \
            .order("created_at", desc=True) \
            .limit(10) \
            .execute()
            
        # Re-order to chronological
        raw_history = reversed(history_res.data) if history_res.data else []
        chat_history = [{"role": msg["role"], "content": msg["content"]} for msg in raw_history]
        
        # Get chunks
        chunks = get_relevant_chunks(request.source_id, request.message)
        
        # Build prompt
        messages = build_rag_prompt(chunks, chat_history, request.message)
        
        # Save user message
        supabase.table("chat_history").insert({
            "source_id": request.source_id,
            "role": "user",
            "content": request.message
        }).execute()
        
        # Return streaming generator
        # Note: the client would typically save the assistant's response on their end and pass back, 
        # but the prompt requests "save the assistant response to chat_history table".
        # Because we are streaming, saving the final text requires a background task or wrapper 
        # around the generator. Since the prompt states "After streaming completes, save the assistant response", 
        # we will use an inline async generator wrapper to intercept chunks, build the final string, and save.

        async def streaming_wrapper():
            full_response = ""
            async for chunk in stream_chat_response(messages):
                yield chunk
                # Extract text out of "data: text\n\n"
                if chunk.startswith("data: ") and chunk != "data: [DONE]\n\n" and not chunk.startswith("data: [ERROR]"):
                    full_response += chunk[6:-2]
                    
            try:
                supabase.table("chat_history").insert({
                    "source_id": request.source_id,
                    "role": "assistant",
                    "content": full_response
                }).execute()
            except Exception as se:
                logger.error(f"Failed to save assistant history: {str(se)}")
                
        return StreamingResponse(streaming_wrapper(), media_type="text/event-stream")
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during chat processing")
