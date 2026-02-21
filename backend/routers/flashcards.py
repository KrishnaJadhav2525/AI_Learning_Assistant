from fastapi import APIRouter, HTTPException
from backend.models.schemas import FlashcardRequest, Flashcard
from backend.services.generation_service import generate_flashcards
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate-flashcards", response_model=List[Flashcard])
async def create_flashcards(request: FlashcardRequest):
    try:
        flashcards_data = generate_flashcards(request.source_id)
        # Validate through Pydantic
        return [Flashcard(**card) for card in flashcards_data]
    except ValueError as e:
        logger.error(f"Value Error in flashcards: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in flashcards: {str(e)}")
        raise HTTPException(status_code=503, detail="Failed to generate flashcards. Please try again later.")
