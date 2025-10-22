# 🧠 Asistente Financiero con IA (Backend FastAPI)

## 🎯 Propósito

Backend para un **asistente financiero inteligente** que permite:
- Subir documentos financieros (PDF, CSV, Excel).
- Procesarlos mediante **embeddings** para análisis semántico.
- Consultarlos con un **chat RAG (Retrieval-Augmented Generation)**.

El objetivo es construir una base **hipersimplificada**, sin ORM ni DI, bajo los principios de **Clean Architecture** y desarrollo **ágil por historias de usuario (HDEU)**.

---

## ⚙️ Tecnologías principales

| Capa | Tecnología | Descripción |
|------|-------------|--------------|
| Framework | **FastAPI** | Servidor REST/ASGI |
| DB | **SQLite (aiosqlite)** | Metadatos de documentos |
| Vector Store | **Chroma** | Almacenamiento de embeddings |
| Embeddings | **OpenAI (text-embedding-3-small)** | Vectorización |
| Lógica | **Clean Architecture** | Separación Domain / Application / Infra / API |
| Tests | **Pytest** | Unitarios e integrados |

---

## 🧱 Arquitectura

```
app/
├── domain/            # Entidades y puertos
├── application/       # Casos de uso (usecases)
├── infrastructure/    # Repositorios, vector store, LLM adapters
├── presentation/      # Routers y schemas (FastAPI)
└── core/              # Config y wiring manual
```

---

## 🧾 Variables de entorno

```bash
ENV=development
PORT=8000
DATABASE_URL=sqlite:///./data/app.db
OPENAI_API_KEY=sk-...
CHROMA_URL=http://localhost:8000
CHUNK_SIZE=1000
TOP_K=5
```

---

## 🚀 Ejecución rápida

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🧠 Pipeline RAG simplificado

1. El usuario sube un documento.
2. Se extrae texto (sin guardar fichero físico).
3. Se generan chunks y embeddings.
4. Se guarda en Chroma + metadatos en SQLite.
5. Las consultas se responden por similitud semántica.

---

## 📋 Historias de Usuario (HDEU)

### HU0 — Configuración inicial

**Como** desarrollador,
**quiero** tener un entorno FastAPI funcional,
**para** comenzar el desarrollo incremental.

**AC**: `/health` devuelve `{status: ok}` y estructura clean creada.

---

### HU1 — Subir documento y procesar embeddings

**Como** usuario,
**quiero** subir un documento,
**para** que sea vectorizado y guardado en el vector store.

**AC**: `POST /documents/upload` extrae texto, genera embeddings, guarda metadatos en DB.

---

### HU2 — Listar documentos procesados

**Como** usuario,
**quiero** ver mis documentos indexados,
**para** conocer su estado.

**AC**: `GET /documents` lista nombre, fecha y número de chunks.

---

### HU3 — Chat básico (no streaming)

**Como** usuario,
**quiero** hacer preguntas sobre mis documentos,
**para** recibir respuestas semánticas.

**AC**: `POST /chat/message` retorna `{answer, sources[]}`.

---

### HU4 — Conversaciones persistentes

**Como** usuario,
**quiero** guardar el historial de chat,
**para** revisarlo después.

**AC**: endpoints para listar y recuperar conversaciones.

---

### HU5 — Streaming SSE

**Como** usuario,
**quiero** recibir la respuesta por streaming,
**para** mejorar la UX.

**AC**: `POST /chat/stream` con `EventSourceResponse`.

---

### HU6 — Documentos temporales

**Como** usuario,
**quiero** subir documentos efímeros,
**para** analizarlos solo en una conversación.

**AC**: `isTemporary=true` y eliminación automática.

---

### HU7 — Analítica financiera

**Como** usuario,
**quiero** obtener reportes automáticos,
**para** entender mis gastos y métricas.

**AC**: `POST /analytics/expenses` genera JSON de resumen.

---

### HU8 — QA y despliegue

**Como** equipo técnico,
**quiero** documentación y tests,
**para** asegurar calidad y portabilidad.

**AC**: `/docs`, pytest, docker-compose.