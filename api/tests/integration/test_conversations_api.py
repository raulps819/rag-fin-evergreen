"""
Integration tests for conversations API endpoints.
"""
import pytest


@pytest.mark.asyncio
async def test_create_conversation(test_client):
    """Test creating a new conversation."""
    response = await test_client.post("/conversations")

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_list_conversations(test_client):
    """Test listing all conversations."""
    # Create a conversation first
    await test_client.post("/conversations")

    # List conversations
    response = await test_client.get("/conversations")

    assert response.status_code == 200
    data = response.json()
    assert "conversations" in data
    assert "total" in data
    assert data["total"] >= 1
    assert isinstance(data["conversations"], list)


@pytest.mark.asyncio
async def test_get_conversation(test_client):
    """Test getting a conversation by ID."""
    # Create a conversation
    create_response = await test_client.post("/conversations")
    conversation_id = create_response.json()["id"]

    # Get conversation
    response = await test_client.get(f"/conversations/{conversation_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == conversation_id
    assert "messages" in data
    assert isinstance(data["messages"], list)


@pytest.mark.asyncio
async def test_get_conversation_not_found(test_client):
    """Test getting a non-existent conversation."""
    response = await test_client.get("/conversations/non-existent-id")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_conversation_with_messages(test_client, mock_vector_store, mock_llm_service):
    """Test getting a conversation with messages."""
    # Create conversation and send a message
    chat_response = await test_client.post(
        "/chat/message",
        json={"message": "Test question"}
    )
    conversation_id = chat_response.json()["conversation_id"]

    # Get conversation with messages
    response = await test_client.get(f"/conversations/{conversation_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == conversation_id
    assert len(data["messages"]) >= 2  # user + assistant messages


@pytest.mark.asyncio
async def test_delete_conversation(test_client):
    """Test deleting a conversation."""
    # Create a conversation
    create_response = await test_client.post("/conversations")
    conversation_id = create_response.json()["id"]

    # Delete conversation
    response = await test_client.delete(f"/conversations/{conversation_id}")

    assert response.status_code == 204

    # Verify deletion
    get_response = await test_client.get(f"/conversations/{conversation_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_conversation_not_found(test_client):
    """Test deleting a non-existent conversation."""
    response = await test_client.delete("/conversations/non-existent-id")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_conversation_persistence_flow(test_client, mock_vector_store, mock_llm_service):
    """Test complete conversation flow with persistence."""
    # 1. Create conversation
    create_response = await test_client.post("/conversations")
    assert create_response.status_code == 201
    conversation_id = create_response.json()["id"]

    # 2. Send first message
    msg1_response = await test_client.post(
        "/chat/message",
        json={"message": "First question", "conversation_id": conversation_id}
    )
    assert msg1_response.status_code == 200
    assert msg1_response.json()["conversation_id"] == conversation_id

    # 3. Send second message to same conversation
    msg2_response = await test_client.post(
        "/chat/message",
        json={"message": "Second question", "conversation_id": conversation_id}
    )
    assert msg2_response.status_code == 200
    assert msg2_response.json()["conversation_id"] == conversation_id

    # 4. Get conversation with all messages
    get_response = await test_client.get(f"/conversations/{conversation_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert len(data["messages"]) == 4  # 2 user + 2 assistant messages

    # 5. Delete conversation
    delete_response = await test_client.delete(f"/conversations/{conversation_id}")
    assert delete_response.status_code == 204
