from fastapi import APIRouter

router = APIRouter()

@router.post("/process-video")
async def process_video():
    pass

@router.post("/process-pdf")
async def process_pdf():
    pass
