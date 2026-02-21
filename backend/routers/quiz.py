from fastapi import APIRouter, HTTPException
from backend.models.schemas import QuizRequest, QuizQuestion
from backend.services.generation_service import generate_quiz
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate-quiz", response_model=List[QuizQuestion])
async def create_quiz(request: QuizRequest):
    try:
        quiz_data = generate_quiz(request.source_id)
        # Validate and return through Pydantic
        return [QuizQuestion(**q) for q in quiz_data]
    except ValueError as e:
        logger.error(f"Value Error in quiz: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in quiz generation: {str(e)}")
        raise HTTPException(status_code=503, detail="Failed to generate quiz. Please try again later.")
