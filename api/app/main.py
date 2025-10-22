"""
FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.presentation.api import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    print(f"🚀 Starting application in {settings.ENV} mode")
    print(f"📊 Database: {settings.DATABASE_URL}")

    yield

    # Shutdown
    print("👋 Shutting down application")


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