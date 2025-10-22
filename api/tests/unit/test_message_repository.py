"""
Unit tests for MessageRepository.
"""
import pytest
from datetime import datetime

from app.domain.entities.message import Message, Source
from app.domain.entities.conversation import Conversation
from app.infrastructure.repositories.conversation_repository import ConversationRepository
from app.infrastructure.repositories.message_repository import MessageRepository


@pytest.mark.asyncio
async def test_save_message(sqlite_client):
    """Test saving a message."""
    conv_repo = ConversationRepository(sqlite_client)
    msg_repo = MessageRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(id=None, created_at=now, updated_at=now, messages=[])
    conversation_id = await conv_repo.save(conversation)

    # Create message
    message = Message(
        id=None,
        role="user",
        content="Test message",
        created_at=now,
        sources=None
    )

    message_id = await msg_repo.save(message, conversation_id)

    assert message_id is not None
    assert isinstance(message_id, str)


@pytest.mark.asyncio
async def test_save_message_with_sources(sqlite_client):
    """Test saving a message with sources."""
    conv_repo = ConversationRepository(sqlite_client)
    msg_repo = MessageRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(id=None, created_at=now, updated_at=now, messages=[])
    conversation_id = await conv_repo.save(conversation)

    # Create message with sources
    sources = [
        Source(
            document_id="doc1",
            filename="test.pdf",
            chunk_index=0,
            content="Test content",
            relevance_score=0.95
        )
    ]
    message = Message(
        id=None,
        role="assistant",
        content="Test response",
        created_at=now,
        sources=sources
    )

    message_id = await msg_repo.save(message, conversation_id)

    assert message_id is not None


@pytest.mark.asyncio
async def test_get_by_conversation_id(sqlite_client):
    """Test retrieving messages by conversation ID."""
    conv_repo = ConversationRepository(sqlite_client)
    msg_repo = MessageRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(id=None, created_at=now, updated_at=now, messages=[])
    conversation_id = await conv_repo.save(conversation)

    # Create messages
    for i in range(3):
        message = Message(
            id=None,
            role="user" if i % 2 == 0 else "assistant",
            content=f"Message {i}",
            created_at=now,
            sources=None
        )
        await msg_repo.save(message, conversation_id)

    # Retrieve messages
    messages = await msg_repo.get_by_conversation_id(conversation_id)

    assert len(messages) == 3
    assert all(isinstance(m, Message) for m in messages)


@pytest.mark.asyncio
async def test_get_messages_with_sources(sqlite_client):
    """Test retrieving messages with sources."""
    conv_repo = ConversationRepository(sqlite_client)
    msg_repo = MessageRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(id=None, created_at=now, updated_at=now, messages=[])
    conversation_id = await conv_repo.save(conversation)

    # Create message with sources
    sources = [
        Source(
            document_id="doc1",
            filename="test.pdf",
            chunk_index=0,
            content="Test content",
            relevance_score=0.95
        )
    ]
    message = Message(
        id=None,
        role="assistant",
        content="Test response",
        created_at=now,
        sources=sources
    )
    await msg_repo.save(message, conversation_id)

    # Retrieve messages
    messages = await msg_repo.get_by_conversation_id(conversation_id)

    assert len(messages) == 1
    assert messages[0].sources is not None
    assert len(messages[0].sources) == 1
    assert messages[0].sources[0].document_id == "doc1"


@pytest.mark.asyncio
async def test_delete_by_conversation_id(sqlite_client):
    """Test deleting messages by conversation ID."""
    conv_repo = ConversationRepository(sqlite_client)
    msg_repo = MessageRepository(sqlite_client)

    # Create conversation
    now = datetime.utcnow()
    conversation = Conversation(id=None, created_at=now, updated_at=now, messages=[])
    conversation_id = await conv_repo.save(conversation)

    # Create messages
    for i in range(3):
        message = Message(
            id=None,
            role="user",
            content=f"Message {i}",
            created_at=now,
            sources=None
        )
        await msg_repo.save(message, conversation_id)

    # Delete messages
    await msg_repo.delete_by_conversation_id(conversation_id)

    # Verify
    messages = await msg_repo.get_by_conversation_id(conversation_id)
    assert len(messages) == 0
