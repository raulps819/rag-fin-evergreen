"""
Chat API endpoints.
"""
from fastapi import APIRouter, HTTPException

from app.core.container import container
from app.presentation.schemas.chat import ChatRequest, ChatResponse, SourceSchema

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message and get a response based on uploaded documents.

    This endpoint:
    1. Generates an embedding for the user's question
    2. Searches for relevant chunks in the vector store
    3. Uses the top-K most relevant chunks as context
    4. Generates a response using OpenAI's LLM
    5. Returns the answer with source references

    The response is based only on the uploaded documents.
    """
    try:
        # Execute chat use case
        message = await container.chat_usecase.execute(query=request.message)

        # Convert sources to schema
        sources_schema = None
        if message.sources:
            sources_schema = [
                SourceSchema(
                    document_id=source.document_id,
                    filename=source.filename,
                    chunk_index=source.chunk_index,
                    content=source.content,
                    relevance_score=source.relevance_score
                )
                for source in message.sources
            ]

        # Return response
        return ChatResponse(
            answer=message.content,
            sources=sources_schema,
            created_at=message.created_at
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")