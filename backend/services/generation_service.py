import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from backend.db.supabase_client import supabase

load_dotenv()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def _get_context_from_source(source_id: str) -> str:
    """Helper to fetch all chunks for a given source and join them."""
    response = supabase.table("chunks").select("content").eq("source_id", source_id).execute()
    if not response.data:
        raise ValueError(f"No chunks found for source_id: {source_id}")
    
    # Combine content and trim to approx 6000 tokens (very rough approx via string slice or we rely on model limits)
    # Using a 24000 char slice approx equals ~6000 tokens for safety
    combined = "\n\n".join([row["content"] for row in response.data])
    return combined[:24000] 

def generate_flashcards(source_id: str) -> list[dict]:
    """Generates 12 flashcards from the source material."""
    context = _get_context_from_source(source_id)
    
    prompt = f"""You are an expert educator. Given the following content, generate exactly 12 high-quality flashcards. 
Each flashcard must test a distinct key concept. 
Return ONLY a valid JSON array with objects: [{{"question": "...", "answer": "..."}}]
No extra text, no markdown fences.

CONTENT:
{context}"""

    for attempt in range(3):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            result = response.choices[0].message.content.strip()
            # Clean possible markdown formatting from responses
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
                
            flashcards = json.loads(result)
            if not isinstance(flashcards, list):
                raise ValueError("Response is not a JSON array")
                
            return flashcards
        except Exception as e:
            if attempt == 2:
                raise ValueError(f"Failed to generate flashcards after 3 attempts: {str(e)}")

def generate_quiz(source_id: str) -> list[dict]:
    """Generates 8 multiple choice questions from the source material."""
    context = _get_context_from_source(source_id)
    
    prompt = f"""You are an expert quiz maker. Given the following content, generate exactly 8 multiple-choice questions.
Each question must have 4 options (A-D), exactly one correct answer, and a brief explanation.
Return ONLY a valid JSON array:
[{{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct_index": 0, "explanation": "..."}}]
No extra text, no markdown fences.

CONTENT:
{context}"""

    for attempt in range(3):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            result = response.choices[0].message.content.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
                
            quiz = json.loads(result)
            if not isinstance(quiz, list):
                raise ValueError("Response is not a JSON array")
                
            # Validate correct_index ranges
            for q in quiz:
                if q.get("correct_index", -1) not in [0, 1, 2, 3]:
                    q["correct_index"] = 0
                    
            return quiz
        except Exception as e:
            if attempt == 2:
                raise ValueError(f"Failed to generate quiz after 3 attempts: {str(e)}")
