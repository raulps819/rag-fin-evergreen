# 🧠 Asistente Financiero con IA

## 📘 Descripción General

El **Asistente Financiero con IA** es una aplicación local (monousuario) diseñada para ayudar a gestionar información financiera mediante documentos y conversaciones inteligentes.  
El sistema integra capacidades de **IA conversacional**, **RAG (Retrieval-Augmented Generation)** y **gestión de conocimiento financiero**.

---

## 🎯 Objetivos del Proyecto

- Permitir la **gestión completa de documentos financieros** (PDF, CSV, XLSX) que alimentan una base de conocimiento persistente.
- Habilitar la **carga temporal de documentos** que se utilizan solo durante una conversación.
- Ofrecer **conversaciones asistidas por IA** con **streaming** y soporte de conocimiento contextual.
- Mantener un **historial completo de chats**, accesible en cualquier momento.
- Implementar una **arquitectura limpia y desacoplada**, de fácil mantenimiento y escalabilidad.

---

## 🧱 Arquitectura del Sistema

El proyecto seguirá los principios de **Clean Architecture**, dividiendo la aplicación en cuatro capas principales:

1. **Domain** — Entidades, modelos y contratos (interfaces) de negocio.
2. **Application** — Casos de uso y lógica de aplicación (sin dependencias externas).
3. **Infrastructure** — Implementaciones concretas (ORM, almacenamiento, embeddings, etc.).
4. **Presentation** — Controladores HTTP, rutas, validación, documentación.

---

## 🧩 Tecnologías Principales

| Componente | Tecnología | Descripción |
|-------------|-------------|--------------|
| **Servidor HTTP** | Fastify | Framework rápido, moderno y extensible para Node.js |
| **ORM / DB** | Prisma + SQLite | Acceso a datos simple y eficiente para entornos locales |
| **Inyección de dependencias** | tsyringe o typedi | Gestión de dependencias en capas limpias |
| **Validación** | JSON Schema | Validación tipada de requests/responses |
| **Documentación API** | Swagger (Fastify-OpenAPI) | Documentación automática de endpoints |
| **Embeddings / RAG** | OpenAI, Ollama o modelo local | Enriquecimiento semántico y contexto |
| **Vector Store** | Chroma / FAISS | Recuperación contextual basada en similitud |
| **Lenguaje** | TypeScript | Tipado estático y soporte para Clean Architecture |

---

## 📁 Estructura General del Proyecto

```
api/
├── src/
│   ├── domain/                    # Capa de dominio (entidades y contratos)
│   │   ├── entities/              # Entidades del negocio
│   │   │   ├── Document.ts        # Entidad documento
│   │   │   ├── Conversation.ts    # Entidad conversación
│   │   │   ├── Message.ts         # Entidad mensaje
│   │   │   └── Embedding.ts       # Entidad embedding
│   │   ├── repositories/          # Interfaces de repositorios
│   │   │   ├── IDocumentRepository.ts
│   │   │   ├── IConversationRepository.ts
│   │   │   ├── IMessageRepository.ts
│   │   │   └── IVectorStoreRepository.ts
│   │   └── services/              # Interfaces de servicios de dominio
│   │       ├── IEmbeddingService.ts
│   │       ├── ILLMService.ts
│   │       └── IDocumentProcessor.ts
│   │
│   ├── application/               # Capa de aplicación (casos de uso)
│   │   ├── use-cases/
│   │   │   ├── documents/
│   │   │   │   ├── CreateDocumentUseCase.ts
│   │   │   │   ├── ListDocumentsUseCase.ts
│   │   │   │   ├── GetDocumentUseCase.ts
│   │   │   │   ├── UpdateDocumentUseCase.ts
│   │   │   │   ├── DeleteDocumentUseCase.ts
│   │   │   │   └── ProcessDocumentUseCase.ts
│   │   │   ├── conversations/
│   │   │   │   ├── CreateConversationUseCase.ts
│   │   │   │   ├── ListConversationsUseCase.ts
│   │   │   │   ├── GetConversationUseCase.ts
│   │   │   │   ├── DeleteConversationUseCase.ts
│   │   │   │   └── AddTemporaryDocumentUseCase.ts
│   │   │   └── chat/
│   │   │       ├── SendMessageUseCase.ts
│   │   │       ├── StreamResponseUseCase.ts
│   │   │       └── RetrieveContextUseCase.ts
│   │   └── dto/                   # Data Transfer Objects
│   │       ├── DocumentDTO.ts
│   │       ├── ConversationDTO.ts
│   │       ├── MessageDTO.ts
│   │       └── ChatRequestDTO.ts
│   │
│   ├── infrastructure/            # Capa de infraestructura
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma  # Schema de Prisma
│   │   │   │   └── migrations/    # Migraciones
│   │   │   └── repositories/      # Implementaciones de repositorios
│   │   │       ├── PrismaDocumentRepository.ts
│   │   │       ├── PrismaConversationRepository.ts
│   │   │       └── PrismaMessageRepository.ts
│   │   ├── vector-store/
│   │   │   ├── ChromaVectorStore.ts    # Implementación Chroma
│   │   │   └── FAISSVectorStore.ts     # Implementación FAISS
│   │   ├── llm/
│   │   │   ├── OpenAIService.ts        # Implementación OpenAI
│   │   │   └── OllamaService.ts        # Implementación Ollama
│   │   ├── embeddings/
│   │   │   ├── OpenAIEmbeddings.ts
│   │   │   └── LocalEmbeddings.ts
│   │   ├── document-processing/
│   │   │   ├── PDFProcessor.ts
│   │   │   ├── CSVProcessor.ts
│   │   │   └── XLSXProcessor.ts
│   │   └── storage/
│   │       ├── LocalFileStorage.ts
│   │       └── TemporaryFileStorage.ts
│   │
│   ├── presentation/              # Capa de presentación
│   │   ├── routes/
│   │   │   ├── index.ts           # Registro de rutas
│   │   │   ├── documents.routes.ts
│   │   │   ├── conversations.routes.ts
│   │   │   └── chat.routes.ts
│   │   ├── controllers/
│   │   │   ├── DocumentsController.ts
│   │   │   ├── ConversationsController.ts
│   │   │   └── ChatController.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   └── logger.ts
│   │   └── schemas/               # JSON Schemas para validación
│   │       ├── document.schema.ts
│   │       ├── conversation.schema.ts
│   │       └── chat.schema.ts
│   │
│   ├── shared/                    # Código compartido
│   │   ├── config/
│   │   │   └── environment.ts     # Configuración de entorno
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   └── ErrorCodes.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── helpers.ts
│   │
│   ├── container.ts               # Configuración de DI (tsyringe)
│   ├── server.ts                  # Configuración del servidor Fastify
│   └── index.ts                   # Punto de entrada
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── uploads/                       # Archivos subidos permanentes
├── temp/                          # Archivos temporales
├── data/                          # Base de datos SQLite
│   └── app.db
│
├── tests/                         # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                          # Documentación
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── API_REFERENCE.md
│   ├── RAG_PIPELINE.md
│   ├── DATA_MODEL.md
│   └── DEPLOY_GUIDE.md
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Casos de Uso Principales (User Stories)

### 🟢 US1 — Gestión de Documentos Permanentes
- El usuario puede subir, listar, modificar y eliminar documentos (`PDF`, `CSV`, `XLSX`).
- Los documentos se almacenan en la base de conocimiento permanente y son indexados en el vector store.
- Permiten consultas futuras a través de RAG.

### 🟢 US2 — Documentos Temporales por Conversación
- Durante una conversación, el usuario puede subir archivos temporales.
- Estos documentos **no se guardan de forma permanente**, pero se utilizan para enriquecer el contexto del chat.
- Se eliminan al finalizar la sesión o chat.

### 🟢 US3 — Conversaciones RAG con Streaming
- El usuario puede mantener una conversación continua con el asistente.
- El asistente accede a la base de conocimiento (documentos + contexto).
- Las respuestas se transmiten por streaming en tiempo real.

### 🟢 US4 — Historial de Chats
- El sistema guarda el historial de conversaciones.
- El usuario puede consultar, filtrar y retomar chats anteriores.
- Los mensajes se almacenan junto con metadatos (fecha, tokens, fuente de conocimiento).

---