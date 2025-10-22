# 🧠 Backend FastAPI — Asistente Financiero con IA

## 1. Descripción técnica

Backend modular en **FastAPI**, sin ORM ni frameworks de inyección de dependencias.
Aplica **Clean Architecture** y almacenamiento de documentos mediante **vectorización**.

---

## 2. Principios clave

- **FastAPI** como framework base.
- **Sin ORM** → SQL crudo con `aiosqlite`.
- **Sin DI framework** → wiring manual.
- **Persistencia semántica** → embeddings en vector store.
- **Clean Architecture** → separación clara entre dominio, aplicación e infraestructura.
- **Iterativo (MVP)** → cada historia entrega valor.

---

## 3. Estructura general

```
app/
├── domain/
│   ├── entities/
│   └── ports/
├── application/
│   ├── usecases/
│   └── dto.py
├── infrastructure/
│   ├── db/
│   ├── repositories/
│   ├── vector/
│   └── llm/
├── presentation/
│   ├── api/v1/
│   └── schemas/
└── core/
    ├── config.py
    └── container.py
```

---

## 4. Persistencia

- **SQLite** para metadatos (`documents`, `conversations`, etc.).
- **Chroma** como vector store (chunks + embeddings).
- **OpenAI** para embeddings.

**No se guarda el archivo físico**, solo su contenido vectorizado.

---

## 5. Flujo principal (`UploadDocumentUseCase`)

1. Leer archivo del stream.
2. Extraer texto (`pdfminer`, `pandas`, etc.).
3. Dividir en *chunks* (`size=1000`, `overlap=200`).
4. Generar embeddings (OpenAI).
5. Guardar en Chroma (`vector_store.add()`).
6. Registrar metadatos en SQLite.

---

## 6. Endpoints principales

- `POST /api/v1/documents/upload` → Procesar y vectorizar documento.
- `GET /api/v1/documents` → Listar documentos.
- `POST /api/v1/chat/message` → Chat semántico.
- `POST /api/v1/chat/stream` → SSE streaming.
- `GET /api/v1/conversations` → Historial.
- `GET /api/v1/health` → Health check.

---

## 7. Adaptadores principales

- `OpenAIEmbeddingService`: genera embeddings.
- `ChromaVectorStore`: almacena y busca embeddings.
- `SQLiteClient`: ejecuta SQL y gestiona transacciones.

---

## 8. Variables de entorno

```env
DATABASE_URL=sqlite:///./data/app.db
OPENAI_API_KEY=sk-...
CHROMA_URL=http://localhost:8000
```

---

## 9. Filosofía del código

> "Escribe lo mínimo para entregar valor.
> Refactoriza solo cuando el valor esté probado."

- Sin dependencias pesadas.
- Sin abstracciones innecesarias.
- Cada caso de uso = valor entregado.

---

## 10. Testing

- Unit tests para casos de uso.
- Integration tests con SQLite `:memory:`.
- Test de endpoints con `httpx.AsyncClient`.

---

## 🚀 Roadmap Ágil (HDU + MVP)

### 🎯 Objetivo

Desarrollar el backend **FastAPI sin ORM ni DI**, priorizando velocidad y simplicidad.
Cada iteración entrega al menos una historia de usuario funcional (HDEU).

---

### 🗂️ Iteración 0 — Setup

**HU0 — Configuración inicial**
- Crear estructura base (app/, core/, etc.).
- Implementar `/health`.
- Configurar entorno `.env` y `aiosqlite`.

---

### 🗂️ Iteración 1 — Upload y embeddings

**HU1 — Subir documento y vectorizar**
- Procesar PDF/CSV en memoria.
- Extraer texto y generar embeddings.
- Guardar metadatos en SQLite.
- Indexar en Chroma.

---

### 🗂️ Iteración 2 — Listar documentos

**HU2 — Consultar documentos procesados**
- Endpoint `GET /documents`.
- Mostrar nombre, chunks, fecha.

---

### 🗂️ Iteración 3 — Chat básico (no streaming)

**HU3 — Preguntar sobre documentos**
- Endpoint `POST /chat/message`.
- Recuperar top-K chunks desde Chroma.
- Responder con contexto y fuente.

---

### 🗂️ Iteración 4 — Conversaciones

**HU4 — Persistir historial**
- Guardar conversación y mensajes.
- Endpoint `GET /conversations`.

---

### 🗂️ Iteración 5 — Streaming SSE

**HU5 — Streaming de respuestas**
- Endpoint `POST /chat/stream`.
- Implementar `EventSourceResponse`.

---

### 🗂️ Iteración 6 — Documentos temporales

**HU6 — Docs efímeros**
- Subir documentos `isTemporary`.
- Limpieza automática o manual.

---

### 🗂️ Iteración 7 — Analítica básica

**HU7 — Reporte financiero**
- Endpoint `/analytics/expenses`.
- Generar resumen JSON con LLM.

---

### 🗂️ Iteración 8 — QA & Infra

**HU8 — Calidad y despliegue**
- Tests unitarios e integrados.
- OpenAPI `/docs`.
- Docker Compose (FastAPI + Chroma).

---

### ✅ Checklist por entrega

- [ ] Endpoint funcional y documentado
- [ ] Pruebas unitarias + integración
- [ ] SQL migrations aplicadas
- [ ] Logs activos
- [ ] Documentación actualizada

---

### 🔁 Ciclo de trabajo (Agile + HDEU)

1. Crear historia (HUx).
2. Definir criterios de aceptación.
3. Implementar caso de uso + endpoint.
4. Validar con tests.
5. Documentar y entregar valor.

---

### 🧩 Próximos pasos

- Iniciar con HU0 y HU1.
- Configurar Chroma + OpenAI embeddings.
- Iterar semanalmente HU2 → HU3 → HU4.