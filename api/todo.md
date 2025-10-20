# API.md - Backend RAG System

Esta es la fuente de verdad y roadmap completo para la API del sistema RAG para productores agropecuarios. Este documento proporciona toda la información necesaria para que un LLM pueda generar la implementación completa del backend.

## Visión General del Proyecto

Sistema RAG (Retrieval-Augmented Generation) diseñado para productores agropecuarios que permite analizar documentos financieros (contratos, órdenes de compra, facturas, datos de ventas) mediante consultas en lenguaje natural.

**Dominio**: Gestión financiera agropecuaria
**Lenguaje principal**: Español
**Arquitectura**: Clean Architecture con DDD principles
**Ubicación**: `/api` dentro del monorepo

## Stack Tecnológico

### Core
- **Runtime**: Node.js 18+ / Bun (recomendado para mejor performance)
- **Framework**: Fastify 5.6+ (alta performance, TypeScript-first)
- **Lenguaje**: TypeScript 5+ (strict mode)
- **Dependency Injection**: tsyringe / awilix
- **Validation**: Zod / JSON Schema
- **ORM**: Prisma 5+

### Base de Datos
- **Relacional**: SQLite (desarrollo) / PostgreSQL (producción recomendado)
- **Vector Store**: ChromaDB (primaria) / FAISS (alternativa)
- **Cache**: Redis (opcional, para producción)

### RAG & LLM
- **Embeddings**: OpenAI text-embedding-3-small / text-embedding-ada-002
- **LLM Provider**: OpenAI GPT-4 / GPT-3.5-turbo / Ollama (local)
- **Orchestration**: LangChain.js / LlamaIndex.js
- **Document Processing**:
  - PDF: pdf-parse / pdfjs-dist
  - XLSX: xlsx / exceljs
  - CSV: papaparse / csv-parser
  - OCR: tesseract.js (opcional)

### Documentación y Testing
- **API Docs**: Swagger/OpenAPI 3.0 (@fastify/swagger)
- **Testing**: Vitest / Jest + Supertest
- **Linting**: ESLint + Prettier
- **Validación**: Zod schemas

### Monitoreo y Logging
- **Logging**: pino (integrado con Fastify)
- **Error Tracking**: Sentry (opcional)
- **Metrics**: Prometheus + Grafana (opcional)

---

## Arquitectura del Sistema

### Estructura de Carpetas (Clean Architecture)

```
/api
├── src/
│   ├── application/           # Casos de uso (Use Cases)
│   │   ├── usecases/
│   │   │   ├── chat/
│   │   │   │   ├── SendMessageUseCase.ts
│   │   │   │   ├── StreamChatUseCase.ts
│   │   │   │   └── GetConversationUseCase.ts
│   │   │   ├── documents/
│   │   │   │   ├── UploadDocumentUseCase.ts
│   │   │   │   ├── ProcessDocumentUseCase.ts
│   │   │   │   ├── DeleteDocumentUseCase.ts
│   │   │   │   └── ListDocumentsUseCase.ts
│   │   │   ├── conversations/
│   │   │   │   ├── CreateConversationUseCase.ts
│   │   │   │   ├── ListConversationsUseCase.ts
│   │   │   │   └── DeleteConversationUseCase.ts
│   │   │   └── analytics/
│   │   │       ├── GenerateExpenseReportUseCase.ts
│   │   │       ├── CompareProvidersUseCase.ts
│   │   │       └── AnalyzeSalesUseCase.ts
│   │   ├── dtos/              # Data Transfer Objects
│   │   │   ├── ChatDTO.ts
│   │   │   ├── DocumentDTO.ts
│   │   │   ├── ConversationDTO.ts
│   │   │   └── AnalyticsDTO.ts
│   │   └── ports/             # Interfaces (puertos)
│   │       ├── IDocumentRepository.ts
│   │       ├── IConversationRepository.ts
│   │       ├── IVectorStore.ts
│   │       ├── ILLMProvider.ts
│   │       └── IDocumentParser.ts
│   │
│   ├── domain/                # Lógica de negocio pura
│   │   ├── entities/
│   │   │   ├── Document.ts
│   │   │   ├── Conversation.ts
│   │   │   ├── Message.ts
│   │   │   ├── DocumentChunk.ts
│   │   │   └── User.ts
│   │   ├── value-objects/
│   │   │   ├── DocumentType.ts
│   │   │   ├── MessageRole.ts
│   │   │   ├── ConversationStatus.ts
│   │   │   └── DocumentMetadata.ts
│   │   └── services/          # Servicios de dominio
│   │       ├── RAGService.ts
│   │       ├── ChunkingService.ts
│   │       └── QueryOptimizationService.ts
│   │
│   ├── infrastructure/        # Adaptadores externos
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   ├── repositories/
│   │   │   │   ├── PrismaDocumentRepository.ts
│   │   │   │   ├── PrismaConversationRepository.ts
│   │   │   │   └── PrismaMessageRepository.ts
│   │   │   └── seeders/
│   │   │
│   │   ├── vector-store/
│   │   │   ├── ChromaVectorStore.ts
│   │   │   ├── FAISSVectorStore.ts (alternativa)
│   │   │   └── VectorStoreFactory.ts
│   │   │
│   │   ├── llm/
│   │   │   ├── OpenAIProvider.ts
│   │   │   ├── OllamaProvider.ts
│   │   │   └── LLMProviderFactory.ts
│   │   │
│   │   ├── document-parsers/
│   │   │   ├── PDFParser.ts
│   │   │   ├── CSVParser.ts
│   │   │   ├── XLSXParser.ts
│   │   │   └── ParserFactory.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── LocalFileStorage.ts
│   │   │   ├── S3Storage.ts (opcional)
│   │   │   └── StorageFactory.ts
│   │   │
│   │   └── cache/
│   │       ├── RedisCache.ts
│   │       └── InMemoryCache.ts
│   │
│   ├── presentation/          # Capa HTTP (Fastify)
│   │   ├── routes/
│   │   │   ├── chat.routes.ts
│   │   │   ├── documents.routes.ts
│   │   │   ├── conversations.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── controllers/
│   │   │   ├── ChatController.ts
│   │   │   ├── DocumentsController.ts
│   │   │   ├── ConversationsController.ts
│   │   │   └── AnalyticsController.ts
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts
│   │   │   ├── authMiddleware.ts (opcional)
│   │   │   ├── validationMiddleware.ts
│   │   │   └── corsMiddleware.ts
│   │   ├── schemas/           # Zod/JSON schemas para validación
│   │   │   ├── chat.schema.ts
│   │   │   ├── document.schema.ts
│   │   │   └── conversation.schema.ts
│   │   └── plugins/
│   │       ├── swagger.plugin.ts
│   │       └── cors.plugin.ts
│   │
│   ├── config/                # Configuración
│   │   ├── database.config.ts
│   │   ├── llm.config.ts
│   │   ├── vector-store.config.ts
│   │   ├── server.config.ts
│   │   └── env.config.ts
│   │
│   ├── shared/                # Utilidades compartidas
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   ├── NotFoundError.ts
│   │   │   ├── ValidationError.ts
│   │   │   └── RAGError.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── text-splitter.ts
│   │   │   ├── embeddings.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       ├── index.ts
│   │       └── globals.d.ts
│   │
│   ├── di/                    # Dependency Injection
│   │   └── container.ts
│   │
│   └── server.ts              # Entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── seed.ts
│   └── migrate.ts
│
├── .env.example
├── .env
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Principios de Arquitectura

1. **Inversión de Dependencias**: Domain no depende de nada. Application depende de Domain. Infrastructure implementa interfaces de Application.
2. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica y bien definida.
3. **Inyección de Dependencias**: Uso de tsyringe/awilix para desacoplar componentes.
4. **Ports & Adapters**: Interfaces en Application, implementaciones en Infrastructure.
5. **Domain-Driven Design**: Entidades y Value Objects modelan el dominio del negocio.

---

## Modelos de Datos (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // cambiar a "postgresql" en producción
  url      = env("DATABASE_URL")
}

// ============= DOCUMENTOS =============

model Document {
  id            String   @id @default(cuid())
  filename      String
  originalName  String
  filepath      String
  mimeType      String
  size          Int
  documentType  DocumentType
  status        DocumentStatus @default(PROCESSING)

  // Metadatos extraídos
  metadata      Json?
  textContent   String?  // Texto extraído completo
  pageCount     Int?

  // Control de versión
  version       Int      @default(1)
  isTemporary   Boolean  @default(false)

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  processedAt   DateTime?
  expiresAt     DateTime? // Para documentos temporales

  // Relaciones
  chunks        DocumentChunk[]
  conversations Conversation[]
  userId        String?

  @@index([documentType])
  @@index([status])
  @@index([isTemporary])
  @@index([createdAt])
}

model DocumentChunk {
  id            String   @id @default(cuid())
  documentId    String
  document      Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  content       String
  chunkIndex    Int

  // Metadatos del chunk
  pageNumber    Int?
  startChar     Int?
  endChar       Int?
  metadata      Json?

  // Vector embedding (referencia, el vector real está en ChromaDB)
  embeddingId   String?  // ID en el vector store

  createdAt     DateTime @default(now())

  @@index([documentId])
  @@index([embeddingId])
}

enum DocumentType {
  CONTRACT
  PURCHASE_ORDER
  INVOICE
  SALES_RECORD
  OTHER
}

enum DocumentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// ============= CONVERSACIONES =============

model Conversation {
  id            String   @id @default(cuid())
  title         String?
  status        ConversationStatus @default(ACTIVE)

  // Contexto
  systemPrompt  String?

  // Documentos asociados (contexto permanente o temporal)
  documents     Document[]

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastMessageAt DateTime?

  // Relaciones
  messages      Message[]
  userId        String?

  @@index([status])
  @@index([createdAt])
  @@index([lastMessageAt])
}

model Message {
  id              String   @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  role            MessageRole
  content         String

  // Metadatos RAG
  sources         Json?    // Referencias a documentos/chunks usados
  confidence      Float?
  tokensUsed      Int?

  // Metadatos de visualización (para frontend)
  chartData       Json?
  tableData       Json?

  createdAt       DateTime @default(now())

  @@index([conversationId])
  @@index([createdAt])
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum ConversationStatus {
  ACTIVE
  ARCHIVED
  DELETED
}

// ============= USUARIOS (OPCIONAL) =============

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?

  // Preferencias
  preferences   Json?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ============= ANALYTICS & CACHE (OPCIONAL) =============

model QueryCache {
  id            String   @id @default(cuid())
  queryHash     String   @unique
  query         String
  response      Json

  hitCount      Int      @default(1)

  createdAt     DateTime @default(now())
  expiresAt     DateTime

  @@index([queryHash])
  @@index([expiresAt])
}
```

---

## API Endpoints Specification

### Base URL
```
http://localhost:3001/api/v1
```

### Autenticación
Opcional en MVP. Para producción, implementar JWT o API Key.

---

### 1. Chat Endpoints

#### `POST /api/v1/chat/message`
Enviar un mensaje y obtener respuesta del asistente.

**Request Body**:
```typescript
{
  conversationId?: string;  // Opcional, se crea nuevo si no existe
  message: string;
  documentIds?: string[];   // IDs de documentos para contexto
  streamResponse?: boolean; // Default: false
}
```

**Response** (No streaming):
```typescript
{
  conversationId: string;
  message: {
    id: string;
    role: "assistant";
    content: string;
    sources?: Array<{
      documentId: string;
      documentName: string;
      chunkId: string;
      relevanceScore: number;
      excerpt: string;
    }>;
    chartData?: ChartData;
    tableData?: TableData;
    tokensUsed: number;
  };
  createdAt: string;
}
```

**Response** (Streaming - SSE):
```typescript
// Server-Sent Events stream
event: token
data: {"token": "Hola"}

event: token
data: {"token": " mundo"}

event: sources
data: {"sources": [...]}

event: done
data: {"messageId": "msg_123", "tokensUsed": 450}
```

**Errores**:
- `400`: Mensaje vacío o inválido
- `404`: Conversación no encontrada
- `500`: Error en LLM o RAG pipeline

---

#### `POST /api/v1/chat/stream`
Alternativa con streaming mediante Server-Sent Events.

**Request/Response**: Igual que anterior con `streamResponse: true`

---

### 2. Conversations Endpoints

#### `GET /api/v1/conversations`
Listar todas las conversaciones.

**Query Params**:
```typescript
{
  limit?: number;     // Default: 50
  offset?: number;    // Default: 0
  status?: "active" | "archived" | "deleted";
  sortBy?: "createdAt" | "lastMessageAt";
  order?: "asc" | "desc"; // Default: desc
}
```

**Response**:
```typescript
{
  conversations: Array<{
    id: string;
    title?: string;
    status: string;
    messageCount: number;
    lastMessage?: {
      content: string;
      createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

---

#### `GET /api/v1/conversations/:id`
Obtener una conversación completa con todos sus mensajes.

**Response**:
```typescript
{
  id: string;
  title?: string;
  status: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    sources?: Array<DocumentReference>;
    chartData?: ChartData;
    tableData?: TableData;
    createdAt: string;
  }>;
  documents: Array<{
    id: string;
    filename: string;
    documentType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

#### `POST /api/v1/conversations`
Crear una nueva conversación.

**Request Body**:
```typescript
{
  title?: string;
  systemPrompt?: string;
  documentIds?: string[];
}
```

**Response**:
```typescript
{
  id: string;
  title?: string;
  status: "active";
  createdAt: string;
}
```

---

#### `PATCH /api/v1/conversations/:id`
Actualizar una conversación (título, status, etc.).

**Request Body**:
```typescript
{
  title?: string;
  status?: "active" | "archived" | "deleted";
}
```

---

#### `DELETE /api/v1/conversations/:id`
Eliminar una conversación (soft delete).

**Response**: `204 No Content`

---

### 3. Documents Endpoints

#### `POST /api/v1/documents/upload`
Subir uno o varios documentos.

**Request**: `multipart/form-data`
```typescript
{
  files: File[];              // Archivos a subir
  documentType: DocumentType; // CONTRACT | INVOICE | PURCHASE_ORDER | SALES_RECORD | OTHER
  isTemporary?: boolean;      // Default: false
  conversationId?: string;    // Para documentos temporales de una sesión
  metadata?: {                // Metadatos opcionales
    provider?: string;
    date?: string;
    amount?: number;
    [key: string]: any;
  };
}
```

**Response**:
```typescript
{
  documents: Array<{
    id: string;
    filename: string;
    originalName: string;
    documentType: string;
    size: number;
    status: "processing" | "completed" | "failed";
    createdAt: string;
  }>;
}
```

**Proceso asíncrono**:
1. Guardar archivo en disco/S3
2. Crear registro en BD con status="processing"
3. Extraer texto en background
4. Generar chunks
5. Generar embeddings
6. Guardar en vector store
7. Actualizar status="completed"

---

#### `GET /api/v1/documents`
Listar documentos.

**Query Params**:
```typescript
{
  type?: DocumentType;
  status?: DocumentStatus;
  isTemporary?: boolean;
  conversationId?: string;
  limit?: number;
  offset?: number;
  search?: string;  // Buscar por nombre
}
```

**Response**:
```typescript
{
  documents: Array<{
    id: string;
    filename: string;
    originalName: string;
    documentType: string;
    status: string;
    size: number;
    pageCount?: number;
    metadata?: object;
    createdAt: string;
    processedAt?: string;
  }>;
  total: number;
}
```

---

#### `GET /api/v1/documents/:id`
Obtener detalles de un documento.

**Response**:
```typescript
{
  id: string;
  filename: string;
  originalName: string;
  filepath: string;
  mimeType: string;
  size: number;
  documentType: string;
  status: string;
  metadata?: object;
  textContent?: string;  // Texto extraído (opcional, puede ser largo)
  pageCount?: number;
  chunkCount: number;
  createdAt: string;
  processedAt?: string;
}
```

---

#### `GET /api/v1/documents/:id/download`
Descargar el archivo original.

**Response**: Binary stream del archivo

---

#### `DELETE /api/v1/documents/:id`
Eliminar un documento (físicamente + BD + vector store).

**Response**: `204 No Content`

---

#### `GET /api/v1/documents/:id/chunks`
Obtener los chunks de un documento (útil para debugging).

**Response**:
```typescript
{
  chunks: Array<{
    id: string;
    content: string;
    chunkIndex: number;
    pageNumber?: number;
    embeddingId?: string;
  }>;
  total: number;
}
```

---

### 4. Analytics Endpoints

#### `POST /api/v1/analytics/expenses`
Generar análisis de gastos.

**Request Body**:
```typescript
{
  startDate?: string;     // ISO 8601
  endDate?: string;       // ISO 8601
  category?: string;      // fertilizantes, semillas, maquinaria, etc.
  groupBy?: "day" | "week" | "month" | "quarter" | "year";
}
```

**Response**:
```typescript
{
  summary: {
    totalExpenses: number;
    avgPerPeriod: number;
    topCategory: string;
  };
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  timeline: Array<{
    period: string;
    amount: number;
  }>;
  chartData: ChartData;
}
```

---

#### `POST /api/v1/analytics/providers`
Comparar proveedores.

**Request Body**:
```typescript
{
  productCategory?: string;
  providers?: string[];
  metric?: "price" | "quality" | "frequency";
}
```

**Response**:
```typescript
{
  comparison: Array<{
    provider: string;
    avgPrice: number;
    orderCount: number;
    lastOrderDate: string;
    reliability: number;
  }>;
  tableData: TableData;
}
```

---

#### `POST /api/v1/analytics/sales`
Analizar ventas.

**Request Body**:
```typescript
{
  startDate?: string;
  endDate?: string;
  product?: string;
  groupBy?: "day" | "week" | "month";
}
```

**Response**:
```typescript
{
  summary: {
    totalSales: number;
    totalRevenue: number;
    avgPrice: number;
    trend: "up" | "down" | "stable";
  };
  timeline: Array<{
    period: string;
    sales: number;
    revenue: number;
  }>;
  chartData: ChartData;
}
```

---

### 5. Health & Status Endpoints

#### `GET /api/v1/health`
Health check del sistema.

**Response**:
```typescript
{
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: "up" | "down";
    vectorStore: "up" | "down";
    llm: "up" | "down";
  };
  version: string;
}
```

---

#### `GET /api/v1/status`
Status detallado del sistema (admin only).

**Response**:
```typescript
{
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  database: {
    documentCount: number;
    conversationCount: number;
    messageCount: number;
  };
  vectorStore: {
    chunkCount: number;
    size: number;
  };
}
```

---

## Sistema RAG (Retrieval-Augmented Generation)

### Pipeline de Procesamiento de Documentos

1. **Upload & Storage**
   - Recibir archivo multipart
   - Validar tipo MIME y tamaño
   - Guardar en filesystem/S3
   - Crear registro en BD

2. **Text Extraction**
   - PDF: `pdf-parse` o `pdfjs-dist`
   - XLSX: `xlsx` o `exceljs`
   - CSV: `papaparse`
   - Extraer metadatos (fecha, total, proveedor, etc.)

3. **Text Chunking**
   - Estrategia: RecursiveCharacterTextSplitter
   - Tamaño de chunk: 800-1200 caracteres
   - Overlap: 200 caracteres
   - Preservar contexto semántico

4. **Embedding Generation**
   - Modelo: `text-embedding-3-small` (1536 dims) o `ada-002` (1536 dims)
   - Generar embedding para cada chunk
   - Batch processing (10-20 chunks a la vez)

5. **Vector Store Indexing**
   - Guardar embeddings en ChromaDB
   - Metadata: documentId, chunkIndex, pageNumber, documentType
   - Collection por tipo de documento (opcional)

### Pipeline de Query (RAG)

1. **Query Processing**
   - Recibir pregunta del usuario
   - Generar embedding de la pregunta

2. **Retrieval**
   - Buscar top-k chunks similares (k=5-10)
   - Filtrar por:
     - Documento específico (si se proporciona)
     - Tipo de documento
     - Relevancia > umbral (0.7)
   - Reranking opcional

3. **Context Building**
   - Construir contexto con chunks recuperados
   - Agregar metadatos de documentos
   - Formatear para el LLM

4. **LLM Prompting**
   - System prompt específico del dominio
   - Inyectar contexto recuperado
   - Instrucciones de formato (JSON si es análisis)

5. **Response Generation**
   - Streaming o respuesta completa
   - Parsear respuesta del LLM
   - Extraer referencias a fuentes
   - Generar chartData/tableData si aplica

6. **Post-processing**
   - Guardar mensaje en BD
   - Trackear tokens usados
   - Cache opcional

### Prompt Engineering

#### System Prompt Base
```
Eres un asistente especializado en análisis financiero para productores agropecuarios.
Tu tarea es ayudar a analizar documentos como contratos, facturas, órdenes de compra y registros de ventas.

DIRECTRICES:
- Responde siempre en español
- Sé preciso con números y fechas
- Cita las fuentes cuando uses información de documentos
- Si no tienes información suficiente, dilo claramente
- Usa terminología del sector agropecuario
- Formatea cantidades monetarias en pesos argentinos (ARS) si aplica

CONTEXTO DISPONIBLE:
{context}

DOCUMENTOS DE REFERENCIA:
{documents}
```

#### Prompt para Análisis de Gastos
```
Analiza los gastos del productor según los documentos proporcionados.

TAREA:
- Calcula el total de gastos en el periodo solicitado
- Agrupa por categoría (fertilizantes, semillas, maquinaria, etc.)
- Identifica tendencias
- Genera datos para gráfica de barras

FORMATO DE RESPUESTA:
{
  "summary": "Texto explicativo del análisis",
  "totalExpenses": number,
  "breakdown": [...],
  "chartData": {...}
}
```

### Estrategias de Optimización

1. **Chunking Inteligente**
   - Para facturas: separar por línea de item
   - Para contratos: separar por cláusula
   - Para CSV: agrupar filas relacionadas

2. **Metadata Enrichment**
   - Extraer fechas automáticamente
   - Detectar proveedores/clientes
   - Categorizar automáticamente

3. **Query Expansion**
   - Expandir sinónimos agropecuarios
   - Traducir términos técnicos

4. **Caching**
   - Cache de embeddings de queries frecuentes
   - Cache de respuestas completas (hash de query)

---

## Configuración del Entorno

### Variables de Entorno (.env)

```bash
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL="file:./dev.db"  # SQLite
# DATABASE_URL="postgresql://user:password@localhost:5432/rag_agro" # PostgreSQL

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Ollama (alternativa local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION=rag_agro_docs

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_MIME_TYPES=application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info

# RAG Settings
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.7

# Rate Limiting (opcional)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000  # 1 minuto
```

---

## Comandos de Desarrollo

```bash
# Instalación
npm install
# o
pnpm install
# o (recomendado)
bun install

# Desarrollo
npm run dev
# Con auto-reload
npm run dev:watch

# Build
npm run build

# Producción
npm run start

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed

# Docker (opcional)
docker-compose up -d      # Levantar servicios (Postgres, ChromaDB, Redis)
docker-compose down       # Bajar servicios
```

### Scripts package.json

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx scripts/seed.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Patrones y Convenciones de Código

### 1. Dependency Injection con tsyringe

```typescript
// src/di/container.ts
import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Database
container.registerSingleton<PrismaClient>('PrismaClient', PrismaClient);

// Repositories
container.registerSingleton<IDocumentRepository>(
  'IDocumentRepository',
  PrismaDocumentRepository
);

// Services
container.registerSingleton<RAGService>('RAGService', RAGService);

// Use Cases
container.register('SendMessageUseCase', SendMessageUseCase);

export { container };
```

### 2. Use Case Pattern

```typescript
// src/application/usecases/chat/SendMessageUseCase.ts
import { inject, injectable } from 'tsyringe';

interface SendMessageInput {
  conversationId?: string;
  message: string;
  documentIds?: string[];
}

@injectable()
export class SendMessageUseCase {
  constructor(
    @inject('IConversationRepository') private conversationRepo: IConversationRepository,
    @inject('RAGService') private ragService: RAGService,
    @inject('ILLMProvider') private llmProvider: ILLMProvider
  ) {}

  async execute(input: SendMessageInput): Promise<MessageDTO> {
    // 1. Validar input
    // 2. Obtener/crear conversación
    // 3. Ejecutar RAG pipeline
    // 4. Guardar mensaje
    // 5. Retornar respuesta
  }
}
```

### 3. Repository Pattern

```typescript
// src/infrastructure/database/repositories/PrismaDocumentRepository.ts
import { inject, injectable } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

@injectable()
export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(@inject('PrismaClient') private prisma: PrismaClient) {}

  async create(data: CreateDocumentDTO): Promise<Document> {
    return this.prisma.document.create({ data });
  }

  async findById(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({ where: { id } });
  }

  // ... más métodos
}
```

### 4. Error Handling

```typescript
// src/shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// Middleware
export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code
    });
  }

  request.log.error(error);
  return reply.status(500).send({ error: 'Internal server error' });
};
```

### 5. Validation con Zod

```typescript
// src/presentation/schemas/chat.schema.ts
import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid().optional(),
  message: z.string().min(1).max(4000),
  documentIds: z.array(z.string().cuid()).optional(),
  streamResponse: z.boolean().default(false)
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
```

### 6. Controller Pattern

```typescript
// src/presentation/controllers/ChatController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ChatController {
  constructor(
    @inject('SendMessageUseCase') private sendMessageUseCase: SendMessageUseCase
  ) {}

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const input = sendMessageSchema.parse(request.body);
    const result = await this.sendMessageUseCase.execute(input);
    return reply.status(200).send(result);
  }
}
```

---

## Testing Strategy

### Unit Tests
- Testear Use Cases aisladamente (mock de repositorios)
- Testear servicios de dominio
- Testear parsers de documentos
- Coverage mínimo: 80%

### Integration Tests
- Testear endpoints completos
- Usar base de datos en memoria
- Testear RAG pipeline end-to-end

### E2E Tests
- Testear flujos completos de usuario
- Upload documento → procesar → chat → obtener respuesta

```typescript
// tests/integration/chat.test.ts
import { describe, it, expect } from 'vitest';
import { build } from '../helper';

describe('Chat API', () => {
  it('should send message and get response', async () => {
    const app = await build();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/message',
      payload: {
        message: '¿Cuánto gasté en fertilizantes el mes pasado?'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('conversationId');
    expect(response.json().message).toHaveProperty('content');
  });
});
```

---

## Roadmap de Implementación

### Fase 1: Fundamentos (Semana 1-2)
- [ ] Setup del proyecto (TypeScript + Fastify + Prisma)
- [ ] Configuración de estructura de carpetas (Clean Architecture)
- [ ] Configuración de DI (tsyringe)
- [ ] Setup de Prisma con SQLite
- [ ] Modelos de datos (schema.prisma)
- [ ] Configuración de variables de entorno
- [ ] Setup de Swagger/OpenAPI
- [ ] Configuración de logging (pino)
- [ ] Configuración de testing (Vitest)
- [ ] Health check endpoint

### Fase 2: Documentos Permanentes (Semana 3-4)
- [ ] Implementar DocumentRepository
- [ ] Endpoint POST /documents/upload
- [ ] Implementar PDFParser
- [ ] Implementar CSVParser
- [ ] Implementar XLSXParser
- [ ] Servicio de chunking de texto
- [ ] Integración con OpenAI Embeddings API
- [ ] Setup de ChromaDB (Docker)
- [ ] Implementar ChromaVectorStore adapter
- [ ] Pipeline completo: upload → extract → chunk → embed → store
- [ ] Endpoints GET /documents (list, detail)
- [ ] Endpoint DELETE /documents/:id
- [ ] Background job processing (opcional: Bull/BullMQ)
- [ ] Tests de integración para documentos

### Fase 3: Documentos Temporales (Semana 5)
- [ ] Modificar schema para soportar isTemporary
- [ ] Lógica de expiración de documentos temporales
- [ ] Asociar documentos temporales a conversaciones
- [ ] Cron job para limpieza de archivos expirados
- [ ] Tests para documentos temporales

### Fase 4: RAG Core (Semana 6-7)
- [ ] Implementar RAGService (retrieval logic)
- [ ] Integración con OpenAI Chat API
- [ ] Implementar LLMProvider interface
- [ ] Implementar OpenAIProvider
- [ ] Implementar OllamaProvider (alternativa local)
- [ ] Prompt engineering (system prompts)
- [ ] Context building from retrieved chunks
- [ ] Query embedding generation
- [ ] Similarity search en vector store
- [ ] Reranking de resultados (opcional)
- [ ] Tests del RAG pipeline

### Fase 5: Chat con Streaming (Semana 8)
- [ ] Implementar ConversationRepository
- [ ] Implementar MessageRepository
- [ ] Endpoint POST /conversations (crear)
- [ ] Endpoint POST /chat/message (sin streaming)
- [ ] Guardar mensajes user + assistant en BD
- [ ] Implementar streaming con SSE
- [ ] Endpoint POST /chat/stream (con streaming)
- [ ] Manejo de tokens y tracking
- [ ] Source attribution (referencias a chunks)
- [ ] Tests de chat endpoints

### Fase 6: Historial de Conversaciones (Semana 9)
- [ ] Endpoint GET /conversations (listar)
- [ ] Endpoint GET /conversations/:id (detalle + mensajes)
- [ ] Endpoint PATCH /conversations/:id (actualizar)
- [ ] Endpoint DELETE /conversations/:id (soft delete)
- [ ] Filtros por fecha, status
- [ ] Paginación
- [ ] Tests de endpoints de conversaciones

### Fase 7: Analytics (Semana 10-11)
- [ ] Diseñar prompts para análisis de gastos
- [ ] Endpoint POST /analytics/expenses
- [ ] Parsing de respuestas estructuradas (JSON)
- [ ] Generación de ChartData
- [ ] Diseñar prompts para comparación de proveedores
- [ ] Endpoint POST /analytics/providers
- [ ] Generación de TableData
- [ ] Endpoint POST /analytics/sales
- [ ] Extracción de metadatos de documentos (fechas, montos)
- [ ] Tests de analytics

### Fase 8: Optimización (Semana 12)
- [ ] Implementar caching de queries (Redis o in-memory)
- [ ] Implementar caching de embeddings
- [ ] Query batching
- [ ] Connection pooling
- [ ] Rate limiting
- [ ] Compression de responses
- [ ] Profiling y optimización de queries
- [ ] Load testing

### Fase 9: Documentación y Deployment (Semana 13-14)
- [ ] Completar documentación Swagger
- [ ] Escribir README completo
- [ ] Guía de deployment
- [ ] Configurar Docker Compose (Postgres + ChromaDB + Redis)
- [ ] Dockerfile para la API
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Setup de monitoring (Prometheus + Grafana)
- [ ] Error tracking (Sentry)
- [ ] Documentación de API en Postman/Insomnia

### Fase 10: Features Avanzadas (Opcional, Semana 15+)
- [ ] Autenticación JWT
- [ ] Multi-tenancy (múltiples productores)
- [ ] Permisos y roles
- [ ] Webhooks para notificaciones
- [ ] Export de datos (Excel, PDF)
- [ ] OCR para documentos escaneados (tesseract.js)
- [ ] Soporte multi-idioma
- [ ] Fine-tuning de embeddings
- [ ] Feedback loop (thumbs up/down en respuestas)
- [ ] A/B testing de prompts

---

## Dependencias Completas (package.json)

```json
{
  "name": "rag-agro-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "fastify": "^5.6.1",
    "@fastify/cors": "^9.0.1",
    "@fastify/multipart": "^8.0.0",
    "@fastify/swagger": "^8.12.0",
    "@fastify/swagger-ui": "^2.0.0",
    "@prisma/client": "^5.7.0",
    "tsyringe": "^4.8.0",
    "reflect-metadata": "^0.2.1",
    "zod": "^3.22.4",
    "pino": "^8.16.2",
    "pino-pretty": "^10.3.1",
    "dotenv": "^16.3.1",
    "openai": "^4.20.1",
    "langchain": "^0.1.0",
    "@langchain/openai": "^0.0.10",
    "chromadb": "^1.7.3",
    "pdf-parse": "^1.1.1",
    "xlsx": "^0.18.5",
    "papaparse": "^5.4.1",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "@types/node": "^20.10.5",
    "@types/papaparse": "^5.3.14",
    "@types/pdf-parse": "^1.1.4",
    "vitest": "^1.0.4",
    "@vitest/coverage-v8": "^1.0.4",
    "prisma": "^5.7.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "prettier": "^3.1.1"
  }
}
```

---

## Criterios de Éxito

### Performance
- Tiempo de respuesta chat (sin streaming): < 3s
- Tiempo de procesamiento de documento (PDF 10 páginas): < 30s
- Latencia de retrieval: < 500ms
- Throughput: > 100 req/s

### Quality
- Precisión de retrieval: > 85% (eval manual)
- Cobertura de test: > 80%
- TypeScript strict mode: 0 errores
- ESLint: 0 warnings en producción

### Reliability
- Uptime: > 99%
- Error rate: < 1%
- Manejo graceful de errores LLM
- Retry logic para servicios externos

### Scalability
- Soportar 1000+ documentos
- Soportar 100+ conversaciones concurrentes
- Vector store con 100k+ chunks

---

## Consideraciones de Producción

### Seguridad
- Validación estricta de inputs
- Sanitización de uploads (antivirus scanning)
- Rate limiting por IP
- CORS configurado correctamente
- Headers de seguridad (helmet)
- Secrets en variables de entorno (nunca en código)
- API Keys con rotación

### Monitoring
- Healthchecks configurados
- Métricas de Prometheus (request count, latency, errors)
- Logging estructurado con pino
- Error tracking con Sentry
- Alertas para errores críticos

### Backup
- Backup diario de SQLite/PostgreSQL
- Backup de vector store
- Backup de archivos en S3

### Deployment
- Docker container
- Docker Compose para servicios
- Environment-based config
- Rolling deployments
- Zero-downtime deploys

---

## Próximos Pasos Inmediatos

1. ✅ Crear este documento (API.md)
2. ⬜ Configurar estructura de carpetas base
3. ⬜ Instalar dependencias core (Fastify, Prisma, tsyringe)
4. ⬜ Configurar TypeScript estricto
5. ⬜ Crear schema.prisma
6. ⬜ Implementar server.ts básico con health check
7. ⬜ Configurar DI container
8. ⬜ Implementar primer endpoint de prueba
9. ⬜ Setup de tests con Vitest
10. ⬜ Configurar Docker Compose para ChromaDB

---

## Referencias y Recursos

### Documentación Oficial
- Fastify: https://fastify.dev
- Prisma: https://prisma.io/docs
- LangChain.js: https://js.langchain.com
- ChromaDB: https://docs.trychroma.com
- OpenAI API: https://platform.openai.com/docs

### Tutoriales RAG
- Building RAG with LangChain: https://python.langchain.com/docs/use_cases/question_answering/
- Vector databases comparison: https://superlinked.com/vector-db-comparison/

### Clean Architecture
- Clean Architecture en Node.js: https://medium.com/@dev.mariojose/nodejs-clean-architecture-...
- DDD con TypeScript: https://khalilstemmler.com/articles/domain-driven-design-intro/

---

**Última actualización**: 2025-10-20
**Versión**: 1.0.0
**Autor**: Sistema RAG Agropecuario Team
