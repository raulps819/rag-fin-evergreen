"""
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.container import container
from app.infrastructure.db.migrations import run_migrations
from app.presentation.api import health, documents, chat, conversations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Set specific loggers to appropriate levels
logging.getLogger("app.presentation.api").setLevel(logging.INFO)
logging.getLogger("app.application.usecases").setLevel(logging.INFO)
logging.getLogger("app.infrastructure.llm").setLevel(logging.INFO)

# Reduce noise from libraries
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    print(f"🚀 Starting application in {settings.ENV} mode")
    print(f"📊 Database: {settings.DATABASE_URL}")

    # Run database migrations
    await run_migrations(container.db_client)

    yield

    # Shutdown
    print("👋 Shutting down application")

    # Close database
    await container.db_client.disconnect()


# Create FastAPI application
app = FastAPI(
    title="Asistente Financiero con IA",
    description="Backend para asistente financiero inteligente con RAG",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(conversations.router)