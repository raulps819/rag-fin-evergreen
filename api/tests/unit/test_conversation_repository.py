"""
Unit tests for ConversationRepository.
"""
import pytest
from datetime import datetime

from app.domain.entities.conversation import Conversation
from app.infrastructure.repositories.conversation_repository import ConversationRepository


@pytest.mark.asyncio
async def test_save_conversation(sqlite_client):
    """Test saving a conversation."""
    repo = ConversationRepository(sqlite_client)

    now = datetime.utcnow()
    conversation = Conversation(
        id=None,
        created_at=now,
        updated_at=now,
        messages=[]
    )

    conversation_id = await repo.save(conversation)

    assert conversation_id is not None
    assert isinstance(conversation_id, str)


@pytest.mark.asyncio
async def test_get_by_id(sqlite_client):
    """Test retrieving a conversation by ID."""
    repo = ConversationRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(
        id=None,
        created_at=now,
        updated_at=now,
        messages=[]
    )
    conversation_id = await repo.save(conversation)

    # Retrieve conversation
    retrieved = await repo.get_by_id(conversation_id)

    assert retrieved is not None
    assert retrieved.id == conversation_id
    assert retrieved.messages == []


@pytest.mark.asyncio
async def test_get_by_id_not_found(sqlite_client):
    """Test retrieving a non-existent conversation."""
    repo = ConversationRepository(sqlite_client)

    retrieved = await repo.get_by_id("non-existent-id")

    assert retrieved is None


@pytest.mark.asyncio
async def test_list_all(sqlite_client):
    """Test listing all conversations."""
    repo = ConversationRepository(sqlite_client)

    # Create multiple conversations
    now = datetime.utcnow()
    for i in range(3):
        conversation = Conversation(
            id=None,
            created_at=now,
            updated_at=now,
            messages=[]
        )
        await repo.save(conversation)

    # List all
    conversations = await repo.list_all()

    assert len(conversations) >= 3
    assert all(isinstance(c, Conversation) for c in conversations)


@pytest.mark.asyncio
async def test_update_conversation(sqlite_client):
    """Test updating a conversation."""
    repo = ConversationRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(
        id=None,
        created_at=now,
        updated_at=now,
        messages=[]
    )
    conversation_id = await repo.save(conversation)

    # Update
    conversation.id = conversation_id
    new_time = datetime.utcnow()
    conversation.updated_at = new_time
    await repo.update(conversation)

    # Verify
    retrieved = await repo.get_by_id(conversation_id)
    assert retrieved.updated_at >= now


@pytest.mark.asyncio
async def test_delete_conversation(sqlite_client):
    """Test deleting a conversation."""
    repo = ConversationRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(
        id=None,
        created_at=now,
        updated_at=now,
        messages=[]
    )
    conversation_id = await repo.save(conversation)

    # Delete
    await repo.delete(conversation_id)

    # Verify
    retrieved = await repo.get_by_id(conversation_id)
    assert retrieved is None
