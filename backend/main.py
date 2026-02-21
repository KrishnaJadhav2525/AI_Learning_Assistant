from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.routers import process, flashcards, quiz, chat

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="AI Learning Assistant")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": str(exc), "status_code": 500},
    )

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ai-learning-assistant.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router, tags=["Processing"])
app.include_router(flashcards.router, tags=["Flashcards"])
app.include_router(quiz.router, tags=["Quiz"])
app.include_router(chat.router, tags=["Chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Learning Assistant APIs"}
