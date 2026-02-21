from fastapi import APIRouter, HTTPException, UploadFile, File
from backend.models.schemas import ProcessVideoRequest, ProcessVideoResponse, ProcessPDFResponse
from backend.services.youtube_service import extract_transcript, get_video_title
from backend.services.pdf_service import extract_text_from_pdf
from backend.services.embedding_service import chunk_text, embed_chunks, store_chunks
from backend.db.supabase_client import supabase

router = APIRouter()

@router.post("/process-video", response_model=ProcessVideoResponse)
async def process_video(request: ProcessVideoRequest):
    try:
        url = request.url
        title = get_video_title(url)
        transcript = extract_transcript(url)
        
        # Save source record to get the source_id
        source_data = {
            "type": "youtube",
            "title": title,
            "url": url
        }
        res = supabase.table("sources").insert(source_data).execute()
        if not res.data:
             raise Exception(f"Failed to create source DB entry")
             
        source_id = res.data[0]["id"]
        
        # Chunk, Embed, Store
        chunks = chunk_text(transcript)
        embeddings = embed_chunks(chunks)
        store_chunks(source_id, chunks, embeddings)
        
        return ProcessVideoResponse(
            source_id=source_id,
            title=title,
            chunk_count=len(chunks)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-pdf", response_model=ProcessPDFResponse)
async def process_pdf(file: UploadFile = File(...)):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is supported.")
            
        file_bytes = await file.read()
        title = file.filename or "Uploaded PDF"
        text = extract_text_from_pdf(file_bytes)
        
        # Save source record
        source_data = {
            "type": "pdf",
            "title": title,
            "file_name": file.filename
        }
        res = supabase.table("sources").insert(source_data).execute()
        if not res.data:
             raise Exception("Failed to create source DB entry")
             
        source_id = res.data[0]["id"]
        
        # Chunk, Embed, Store
        chunks = chunk_text(text)
        embeddings = embed_chunks(chunks)
        store_chunks(source_id, chunks, embeddings)
        
        return ProcessPDFResponse(
            source_id=source_id,
            title=title,
            chunk_count=len(chunks)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
