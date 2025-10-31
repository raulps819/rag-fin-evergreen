# RAG Fin Evergreen 🌾

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20DB-orange?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**An intelligent RAG system for agricultural producers to analyze financial documents using natural language**

[View Demo](#-screenshots) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 About the Project | Sobre el Proyecto

### English

**RAG Fin Evergreen** is a Retrieval-Augmented Generation (RAG) system designed specifically for the agricultural sector. It provides a ChatGPT-style intelligent interface that allows farmers and agricultural producers to query and analyze their financial documents—including contracts, purchase orders, invoices, and historical sales data—using natural language in Spanish.

This project demonstrates the implementation of modern full-stack architecture combined with cutting-edge AI technologies to solve real-world problems in the agricultural industry. Built as an academic project, it showcases expertise in AI/ML integration, modern web development, and cloud-native deployment practices.

**Key Problem Solved:** Agricultural producers often struggle to extract insights from large volumes of financial documents. This system uses RAG to provide instant, context-aware answers by combining semantic search with LLM reasoning.

### Español

**RAG Fin Evergreen** es un sistema de Generación Aumentada por Recuperación (RAG) diseñado específicamente para el sector agrícola. Proporciona una interfaz inteligente estilo ChatGPT que permite a agricultores y productores consultar y analizar sus documentos financieros—incluyendo contratos, órdenes de compra, facturas y datos históricos de ventas—usando lenguaje natural en español.

Este proyecto demuestra la implementación de arquitectura full-stack moderna combinada con tecnologías de IA de vanguardia para resolver problemas del mundo real en la industria agrícola. Construido como proyecto académico, demuestra experiencia en integración de IA/ML, desarrollo web moderno y prácticas de deployment cloud-native.

**Problema Clave Resuelto:** Los productores agrícolas frecuentemente tienen dificultades para extraer información de grandes volúmenes de documentos financieros. Este sistema usa RAG para proporcionar respuestas instantáneas y conscientes del contexto, combinando búsqueda semántica con razonamiento de LLM.

---

## 📸 Screenshots

> - Main chat interface with a sample query
> - <img width="1913" height="879" alt="image" src="https://github.com/user-attachments/assets/e0a364ce-1e38-447d-bf45-2086563ff164" />
> - Document reference display
> - <img width="1896" height="878" alt="image" src="https://github.com/user-attachments/assets/d22ed4d1-2ce0-4a84-b5a6-1a860b73e4cb" />


---

## ✨ Key Features | Características Principales

### English
- 🤖 **Intelligent Conversational AI**: ChatGPT-like interface for natural language queries in Spanish
- 📄 **Multi-Document RAG**: Semantic search across contracts, invoices, and purchase orders using vector embeddings
- 📊 **Data Visualizations**: Dynamic charts and tables generated from query results
- 🔍 **Source Attribution**: Every answer includes references to source documents for transparency
- 🎨 **Modern UI/UX**: Built with Next.js 15, React 19, and shadcn/ui for a polished user experience
- 🌓 **Dark/Light Theme**: Customizable interface with theme support
- 📱 **Responsive Design**: Fully functional on desktop and mobile devices
- 🐳 **Containerized Deployment**: Production-ready Docker Compose setup

### Español
- 🤖 **IA Conversacional Inteligente**: Interfaz tipo ChatGPT para consultas en lenguaje natural en español
- 📄 **RAG Multi-Documento**: Búsqueda semántica en contratos, facturas y órdenes de compra usando embeddings vectoriales
- 📊 **Visualizaciones de Datos**: Gráficos y tablas dinámicas generadas desde resultados de consultas
- 🔍 **Atribución de Fuentes**: Cada respuesta incluye referencias a documentos fuente para transparencia
- 🎨 **UI/UX Moderna**: Construida con Next.js 15, React 19 y shadcn/ui para experiencia pulida
- 🌓 **Tema Oscuro/Claro**: Interfaz personalizable con soporte de temas
- 📱 **Diseño Responsivo**: Totalmente funcional en dispositivos desktop y móviles
- 🐳 **Deployment Containerizado**: Setup de Docker Compose listo para producción

---

## 🎯 Technical Highlights | Aspectos Técnicos Destacados

### 1. Full-Stack Architecture | Arquitectura Full-Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
│  Next.js 15 + React 19 + Tailwind CSS + shadcn/ui         │
│  (App Router, Server Components, Streaming)                │
└─────────────────┬───────────────────────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────────────────────┐
│                   API Layer                                 │
│  FastAPI + Python 3.12 (Async/Await, Type Hints)          │
│  - Chat endpoints with streaming support                   │
│  - Document ingestion pipeline                             │
│  - Query orchestration                                      │
└─────────┬─────────────────────────┬─────────────────────────┘
          │                         │
┌─────────▼──────────┐    ┌────────▼─────────────┐
│  PostgreSQL 16     │    │  ChromaDB            │
│  - User data       │    │  - Vector embeddings │
│  - Conversations   │    │  - Similarity search │
│  - Metadata        │    │  - Document chunks   │
└────────────────────┘    └──────────────────────┘
                               ▲
                               │ OpenAI Embeddings API
                          ┌────┴──────┐
                          │  OpenAI   │
                          │  GPT-4    │
                          └───────────┘
```

**Architecture Decisions:**
- **Monorepo structure** for unified development workflow
- **Next.js App Router** for optimal React Server Components usage
- **FastAPI** for high-performance async Python backend
- **ChromaDB** for efficient vector storage and retrieval
- **Docker Compose** for reproducible multi-service orchestration

### 2. RAG Implementation | Implementación de RAG

The system implements a sophisticated RAG pipeline:

**Ingestion Phase:**
1. Document parsing (PDF, XLSX, DOCX)
2. Text chunking with semantic boundaries
3. OpenAI embedding generation (text-embedding-3-small)
4. Vector storage in ChromaDB with metadata

**Query Phase:**
1. User query embedding generation
2. Similarity search in ChromaDB (top-k retrieval)
3. Context construction with relevant document chunks
4. LLM prompt engineering with system instructions
5. OpenAI GPT-4 response generation
6. Source attribution and formatting

**Key Implementation Details:**
- Hybrid search combining vector similarity and metadata filtering
- Conversation context management for multi-turn dialogs
- Streaming responses for improved UX
- Structured outputs for data visualization (charts/tables)

### 3. Modern UI/UX Stack | Stack de UI/UX Moderno

Built with the latest web technologies:

- **Next.js 15**: Leveraging Turbopack for fast builds and App Router for modern React patterns
- **React 19**: Using latest concurrent features and server components
- **Tailwind CSS v4**: Utility-first styling with CSS variables for theming
- **shadcn/ui**: High-quality, accessible components built on Radix UI primitives
- **TypeScript**: Strict type safety throughout the application
- **Responsive Design**: Mobile-first approach with collapsible sidebar

**UX Patterns Implemented:**
- Optimistic UI updates for instant feedback
- Skeleton loading states
- Toast notifications for user actions
- Keyboard shortcuts (Shift+Enter for line breaks, Enter to send)
- Auto-scrolling message list
- Suggested questions for new users

---

## 🛠️ Tech Stack | Stack Tecnológico

### Frontend
- **Framework**: [Next.js 15.5](https://nextjs.org/) with App Router & Turbopack
- **UI Library**: [React 19.1](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI + CVA)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Language**: TypeScript (strict mode)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.12
- **AI/ML**: OpenAI API (GPT-4, text-embedding-3-small)
- **Async Runtime**: uvicorn + asyncio

### Database & Storage
- **Relational DB**: PostgreSQL 16
- **Vector DB**: [ChromaDB](https://www.trychroma.com/)
- **ORM**: SQLAlchemy (async)

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Make commands for development workflow
- **Environment**: Multi-stage Docker builds for optimization

### Why These Technologies?

- **Next.js 15 + React 19**: Cutting-edge SSR/SSG capabilities, optimal performance, and modern DX
- **FastAPI**: Async-first Python framework with automatic OpenAPI docs and type safety
- **ChromaDB**: Purpose-built vector database for embeddings, easy to deploy and scale
- **PostgreSQL**: Robust, ACID-compliant database with excellent JSON support
- **Docker**: Ensures consistent environments across development and production

---

## 🚀 Quick Start | Inicio Rápido

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- OpenAI API Key ([get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd rag-fin-evergreen

# Setup environment variables
make dev-setup
# Edit api/.env and add your OPENAI_API_KEY

# Start all services
make dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs (Interactive Swagger UI)
- **PostgreSQL**: localhost:5432 (user: `rag_user`, db: `rag_financial`)
- **ChromaDB**: http://localhost:8001

### Useful Commands

```bash
make help          # View all available commands
make up            # Start services
make down          # Stop services
make logs          # View all logs
make logs-api      # View API logs only
make health        # Check service health
make backup-db     # Backup PostgreSQL database
```

For local development without Docker:
- **Frontend**: `cd app && pnpm dev`
- **Backend**: `cd api && uvicorn app.main:app --reload`

---

## 💡 Challenges & Learnings | Desafíos y Aprendizajes

### English

**Technical Challenges:**
1. **RAG Context Window Management**: Balancing chunk size vs. context relevance for optimal retrieval
2. **Streaming Responses**: Implementing real-time streaming from FastAPI to Next.js frontend
3. **Type Safety Across Stack**: Maintaining type consistency between Python backend and TypeScript frontend
4. **Docker Multi-Service Orchestration**: Coordinating startup dependencies (DB → ChromaDB → API → Frontend)

**Key Learnings:**
- Implementing production-ready RAG systems requires careful prompt engineering and context management
- Next.js 15 App Router patterns for optimal server/client component separation
- Vector database operations and similarity search optimization
- Async Python patterns with FastAPI for high-concurrency workloads

### Español

**Desafíos Técnicos:**
1. **Gestión de Ventana de Contexto RAG**: Balancear tamaño de chunks vs. relevancia de contexto para recuperación óptima
2. **Respuestas Streaming**: Implementar streaming en tiempo real desde FastAPI al frontend Next.js
3. **Type Safety Entre Capas**: Mantener consistencia de tipos entre backend Python y frontend TypeScript
4. **Orquestación Multi-Servicio Docker**: Coordinar dependencias de inicio (DB → ChromaDB → API → Frontend)

**Aprendizajes Clave:**
- Implementar sistemas RAG listos para producción requiere ingeniería de prompts y gestión de contexto cuidadosa
- Patrones de Next.js 15 App Router para separación óptima de componentes server/client
- Operaciones de bases de datos vectoriales y optimización de búsqueda por similitud
- Patrones async de Python con FastAPI para cargas de alto concurrency

---

## 📖 Documentation | Documentación

- **[DOCKER.md](./DOCKER.md)**: Complete Docker setup and deployment guide
- **[app/README.md](./app/README.md)**: Frontend architecture and component documentation
- **[api/README.md](./api/README.md)**: Backend API reference and implementation details
- **[CLAUDE.md](./CLAUDE.md)**: Project guidelines for AI-assisted development

---

## 📚 Project Context | Contexto del Proyecto

This project was developed as part of academic coursework to explore practical applications of Large Language Models and Retrieval-Augmented Generation in domain-specific contexts. The agricultural sector was chosen due to the complexity of financial document analysis and the opportunity to create real value for producers.

**Learning Objectives:**
- Implement end-to-end RAG systems with vector databases
- Build production-grade full-stack applications with modern frameworks
- Apply software engineering best practices (type safety, testing, containerization)
- Design user-centric interfaces for AI-powered applications

---

## 📄 License | Licencia

This project is available for educational and portfolio purposes. See [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ for the agricultural community**

[⬆ Back to top](#rag-fin-evergreen-)

</div>
