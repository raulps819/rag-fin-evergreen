"""
FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.container import container
from app.infrastructure.db.migrations import run_migrations
from app.presentation.api import health, documents, chat


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