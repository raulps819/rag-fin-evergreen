"""
Conversations API endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.presentation.schemas.conversation import (
    ConversationResponse,
    ConversationListResponse,
    ConversationDetailResponse
)
from app.presentation.schemas.chat import MessageResponse, SourceSchema
from app.core.container import Container

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conversation"
)
async def create_conversation():
    """
    Create a new empty conversation.

    Returns:
        ConversationResponse: Created conversation
    """
    container = Container()
    create_conversation_usecase = container.create_conversation_usecase

    conversation = await create_conversation_usecase.execute()

    return ConversationResponse(
        id=conversation.id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )


@router.get(
    "",
    response_model=ConversationListResponse,
    summary="List all conversations"
)
async def list_conversations():
    """
    List all conversations (without messages).

    Returns:
        ConversationListResponse: List of conversations ordered by updated_at DESC
    """
    container = Container()
    list_conversations_usecase = container.list_conversations_usecase

    conversations = await list_conversations_usecase.execute()

    return ConversationListResponse(
        conversations=[
            ConversationResponse(
                id=conv.id,
                created_at=conv.created_at,
                updated_at=conv.updated_at
            )
            for conv in conversations
        ],
        total=len(conversations)
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationDetailResponse,
    summary="Get conversation with messages"
)
async def get_conversation(conversation_id: str):
    """
    Get a conversation by ID with all its messages.

    Args:
        conversation_id: Conversation identifier

    Returns:
        ConversationDetailResponse: Conversation with messages

    Raises:
        HTTPException: 404 if conversation not found
    """
    container = Container()
    get_conversation_usecase = container.get_conversation_usecase

    conversation = await get_conversation_usecase.execute(conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found"
        )

    # Convert messages to response schema
    messages_response = []
    for msg in conversation.messages:
        sources = None
        if msg.sources:
            sources = [
                SourceSchema(
                    document_id=src.document_id,
                    filename=src.filename,
                    chunk_index=src.chunk_index,
                    content=src.content,
                    relevance_score=src.relevance_score
                )
                for src in msg.sources
            ]

        messages_response.append(MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            sources=sources,
            created_at=msg.created_at
        ))

    return ConversationDetailResponse(
        id=conversation.id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=messages_response
    )


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a conversation"
)
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation and all its messages.

    Args:
        conversation_id: Conversation identifier

    Raises:
        HTTPException: 404 if conversation not found
    """
    container = Container()
    conversation_repository = container.conversation_repository

    # Verify conversation exists
    conversation = await conversation_repository.get_by_id(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found"
        )

    # Delete conversation (cascade will delete messages)
    await conversation_repository.delete(conversation_id)
