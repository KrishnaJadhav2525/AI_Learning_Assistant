from fastapi import APIRouter

router = APIRouter()

@router.post("/generate-flashcards")
async def generate_flashcards():
    pass
