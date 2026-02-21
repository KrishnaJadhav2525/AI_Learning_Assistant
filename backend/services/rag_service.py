from typing import AsyncGenerator

def get_relevant_chunks(source_id: str, query: str, top_k: int = 5) -> list[str]:
    pass

def build_rag_prompt(context_chunks: list[str], chat_history: list[dict], user_message: str) -> list[dict]:
    pass

async def stream_chat_response(messages: list[dict]) -> AsyncGenerator:
    yield ""
