from fastapi import APIRouter

router = APIRouter()

@router.post("/generate-quiz")
async def generate_quiz():
    pass
