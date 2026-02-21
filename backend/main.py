from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import process, flashcards, quiz, chat

app = FastAPI(title="AI Learning Assistant")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
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
