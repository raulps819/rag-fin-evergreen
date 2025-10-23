"""
Chat API endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException, Depends

from app.core.container import container
from app.application.usecases.chat import ChatUseCase
from app.presentation.schemas.chat import ChatRequest, ChatResponse, SourceSchema

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    chat_usecase: ChatUseCase = Depends(container.get_chat_usecase)
):
    """
    Send a message and get a response based on uploaded documents.

    This endpoint:
    1. Creates a new conversation if conversation_id is not provided
    2. Saves the user message to the conversation
    3. Generates an embedding for the user's question
    4. Searches for relevant chunks in the vector store
    5. Uses the top-K most relevant chunks as context
    6. Generates a response using OpenAI's LLM
    7. Saves the assistant message to the conversation
    8. Returns the answer with source references and conversation_id

    The response is based only on the uploaded documents.
    """
    try:
        # Log incoming request
        logger.info(f"📨 Incoming chat request - Message: '{request.message}' | Conversation ID: {request.conversation_id or 'NEW'}")

        # Execute chat use case (returns message and conversation_id)
        message, conversation_id = await chat_usecase.execute(
            query=request.message,
            conversation_id=request.conversation_id
        )

        # Convert sources to schema
        sources_schema = None
        source_count = 0
        if message.sources:
            source_count = len(message.sources)
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

        # Log response
        answer_preview = message.content[:100] + "..." if len(message.content) > 100 else message.content
        logger.info(f"📤 Sending response - Answer: '{answer_preview}' | Sources: {source_count} | Conversation: {conversation_id}")

        # Return response
        return ChatResponse(
            answer=message.content,
            conversation_id=conversation_id,
            sources=sources_schema,
            created_at=message.created_at
        )

    except ValueError as e:
        logger.error(f"❌ Validation error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Error processing chat message: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")