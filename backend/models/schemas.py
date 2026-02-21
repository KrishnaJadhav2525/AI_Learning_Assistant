from pydantic import BaseModel

class ProcessVideoRequest(BaseModel):
    url: str

class ProcessVideoResponse(BaseModel):
    source_id: str
    title: str
    chunk_count: int

class ProcessPDFResponse(BaseModel):
    source_id: str
    title: str
    chunk_count: int

class FlashcardRequest(BaseModel):
    source_id: str

class QuizRequest(BaseModel):
    source_id: str

class ChatRequest(BaseModel):
    source_id: str
    message: str

class Flashcard(BaseModel):
    question: str
    answer: str

class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str
