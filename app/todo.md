# Plan de Integración Frontend-Backend

Este documento detalla el plan completo para conectar el frontend Next.js con el backend FastAPI, basado en las historias de usuario implementadas en el backend.

---

## Objetivos Principales

1. **Conectar el frontend con los endpoints del backend FastAPI**
2. **Crear página de Settings para gestión de documentos**
3. **Implementar gestión completa de conversaciones**
4. **Añadir visualización de fuentes (sources) en mensajes**
5. **Preparar infraestructura para futuras funcionalidades (streaming, analytics)**

---

## Estado Actual del Backend

### Endpoints Implementados (según HU1-HU4)

✅ **Health**
- `GET /health` - Health check

✅ **Documents** (HU1, HU2)
- `POST /documents/upload` - Subir documento (file, is_temporary)
- `GET /documents` - Listar documentos procesados

✅ **Chat** (HU3)
- `POST /chat/message` - Enviar mensaje y obtener respuesta RAG

✅ **Conversations** (HU4)
- `POST /conversations` - Crear nueva conversación
- `GET /conversations` - Listar todas las conversaciones
- `GET /conversations/{id}` - Obtener conversación con mensajes
- `DELETE /conversations/{id}` - Eliminar conversación

### Pendientes en Backend (HU5-HU8)
- HU5: Streaming SSE (`POST /chat/stream`)
- HU6: Documentos temporales (ya soportado en upload)
- HU7: Analítica financiera (`POST /analytics/expenses`)
- HU8: QA y despliegue

---

## Fase 1: Configuración Base de API

### 1.1 Variables de Entorno

**Archivo**: `app/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Tareas**:
- [ ] Crear archivo `.env.local` con URL del backend
- [ ] Añadir `.env.local` a `.gitignore` si no está
- [ ] Documentar variables en README del frontend

---

### 1.2 Cliente HTTP Base

**Archivo**: `app/src/lib/api-client.ts`

Crear un cliente HTTP centralizado con:
- Base URL configurable
- Headers por defecto
- Manejo de errores consistente
- Timeouts
- Tipos TypeScript para respuestas

**Tareas**:
- [ ] Crear `api-client.ts` con fetch wrapper
- [ ] Implementar manejo de errores HTTP
- [ ] Añadir interceptores para logging (desarrollo)
- [ ] Configurar timeouts

---

## Fase 2: Tipos TypeScript Actualizados

### 2.1 Actualizar Tipos de Chat

**Archivo**: `app/src/types/chat.ts`

Actualizar para coincidir con schemas del backend:

```typescript
// Añadir tipos compatibles con backend
export interface DocumentSource {
  document_id: string;      // Backend usa snake_case
  filename: string;
  chunk_index: number;
  content: string;
  relevance_score?: number;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  answer: string;
  conversation_id: string;
  sources?: DocumentSource[];
  created_at: string;  // ISO string desde backend
}
```

**Tareas**:
- [ ] Añadir tipo `DocumentSource` compatible con backend
- [ ] Crear tipos `ChatRequest` y `ChatResponse`
- [ ] Mantener tipos actuales del frontend (usar mappers)
- [ ] Crear funciones de conversión backend ↔ frontend

---

### 2.2 Crear Tipos de Documentos

**Archivo**: `app/src/types/document.ts` (nuevo)

```typescript
export interface DocumentUpload {
  id: string;
  filename: string;
  file_type: string;
  chunk_count: number;
  upload_date: string;
  is_temporary: boolean;
}

export interface DocumentListResponse {
  documents: DocumentUpload[];
  total: number;
}
```

**Tareas**:
- [ ] Crear archivo `types/document.ts`
- [ ] Definir tipos para upload y listado
- [ ] Añadir tipos para formulario de upload

---

### 2.3 Actualizar Tipos de Conversaciones

**Archivo**: `app/src/types/chat.ts` (actualizar)

```typescript
export interface ConversationMetadata {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends ConversationMetadata {
  messages: Message[];
}

export interface ConversationListResponse {
  conversations: ConversationMetadata[];
  total: number;
}
```

**Tareas**:
- [ ] Actualizar tipo `Conversation` para incluir campos del backend
- [ ] Separar metadata de detail
- [ ] Crear tipos de respuesta de API

---

## Fase 3: Servicios de API

### 3.1 Servicio de Documentos

**Archivo**: `app/src/services/documents.ts` (nuevo)

Funciones:
- `uploadDocument(file: File, isTemporary?: boolean): Promise<DocumentUpload>`
- `listDocuments(): Promise<DocumentListResponse>`
- `deleteDocument(id: string): Promise<void>` (si backend lo implementa)

**Tareas**:
- [ ] Crear servicio de documentos
- [ ] Implementar `uploadDocument` con FormData
- [ ] Implementar `listDocuments`
- [ ] Añadir manejo de errores específicos (tipo de archivo, tamaño)
- [ ] Añadir progress callback para upload

---

### 3.2 Servicio de Chat

**Archivo**: `app/src/services/chat.ts` (nuevo)

Funciones:
- `sendMessage(message: string, conversationId?: string): Promise<ChatResponse>`
- `streamMessage(message: string, conversationId?: string): AsyncGenerator<string>` (preparar para HU5)

**Tareas**:
- [ ] Crear servicio de chat
- [ ] Implementar `sendMessage`
- [ ] Añadir transformación de respuesta (backend → frontend types)
- [ ] Preparar estructura para streaming (HU5 futuro)

---

### 3.3 Servicio de Conversaciones

**Archivo**: `app/src/services/conversations.ts` (nuevo)

Funciones:
- `createConversation(): Promise<ConversationMetadata>`
- `listConversations(): Promise<ConversationListResponse>`
- `getConversation(id: string): Promise<ConversationDetail>`
- `deleteConversation(id: string): Promise<void>`

**Tareas**:
- [ ] Crear servicio de conversaciones
- [ ] Implementar todas las funciones CRUD
- [ ] Añadir caché opcional para lista de conversaciones
- [ ] Implementar ordenamiento por fecha

---

### 3.4 Servicio de Health Check

**Archivo**: `app/src/services/health.ts` (nuevo)

Funciones:
- `checkHealth(): Promise<{ status: string }>`

**Tareas**:
- [ ] Crear servicio simple de health check
- [ ] Usar en startup de la app para verificar backend

---

## Fase 4: Integración de Chat Existente

### 4.1 Actualizar ChatContainer

**Archivo**: `app/src/components/chat/chat-container.tsx`

Cambios:
- Reemplazar mock API con servicio real
- Integrar conversation_id en el estado
- Mostrar sources en mensajes
- Manejar errores de red adecuadamente

**Tareas**:
- [ ] Importar servicio de chat
- [ ] Reemplazar mock en `handleSendMessage` (líneas 36-54)
- [ ] Añadir estado para `conversationId`
- [ ] Crear conversación si no existe
- [ ] Transformar respuesta del backend a tipos frontend
- [ ] Pasar sources a componente Message
- [ ] Mejorar manejo de errores con tipos específicos

---

### 4.2 Actualizar Componente Message

**Archivo**: `app/src/components/chat/message.tsx`

Añadir visualización de sources:
- Badge o lista de documentos citados
- Preview del contenido relevante
- Score de relevancia (opcional)

**Tareas**:
- [ ] Leer archivo `message.tsx` actual
- [ ] Añadir sección de sources al final del mensaje
- [ ] Crear componente `MessageSources` o inline
- [ ] Diseñar UI para mostrar documento + extracto
- [ ] Añadir tooltip o expandible para contenido completo

---

### 4.3 Persistencia de Conversación Activa

**Archivo**: `app/src/hooks/use-chat.ts` (nuevo) o actualizar ChatContainer

Gestionar:
- Conversación actual en localStorage o context
- Crear nueva conversación al iniciar chat
- Recuperar conversación existente

**Tareas**:
- [ ] Decidir: ¿Hook custom o Context API?
- [ ] Implementar persistencia de `conversationId` en localStorage
- [ ] Auto-crear conversación en primer mensaje
- [ ] Limpiar conversación al "Nuevo Chat"

---

## Fase 5: Página de Settings

### 5.1 Crear Ruta de Settings

**Archivo**: `app/src/app/settings/page.tsx` (nuevo)

Estructura:
- Header con título "Configuración"
- Sección "Base de Conocimiento"
- Sección "Preferencias" (futuro)

**Tareas**:
- [ ] Crear directorio `app/settings/`
- [ ] Crear `page.tsx` con layout básico
- [ ] Añadir navegación desde AppSidebar
- [ ] Diseñar layout responsive

---

### 5.2 Componente de Upload de Documentos

**Archivo**: `app/src/components/settings/document-upload.tsx` (nuevo)

Funcionalidades:
- Drag & drop zone
- File picker
- Tipos de archivo aceptados: PDF, CSV, XLSX
- Progress bar durante upload
- Validación de tamaño/tipo
- Opción "Documento temporal"

**Tareas**:
- [ ] Crear componente `DocumentUpload`
- [ ] Implementar drag & drop con HTML5 API
- [ ] Validar tipo de archivo en cliente
- [ ] Mostrar preview del nombre antes de subir
- [ ] Integrar con servicio `uploadDocument`
- [ ] Mostrar progress bar
- [ ] Toast de éxito/error
- [ ] Checkbox "Marcar como temporal" (HU6)

---

### 5.3 Componente de Lista de Documentos

**Archivo**: `app/src/components/settings/document-list.tsx` (nuevo)

Mostrar:
- Tabla o cards con documentos
- Columnas: Nombre, Tipo, Chunks, Fecha, Temporal
- Acciones: Eliminar (si backend lo implementa)
- Estado de carga (skeleton)

**Tareas**:
- [ ] Crear componente `DocumentList`
- [ ] Usar `shadcn/ui` Table component
- [ ] Integrar con servicio `listDocuments`
- [ ] Formatear fechas con date-fns o similar
- [ ] Añadir badge para temporales
- [ ] Implementar refresh manual
- [ ] Añadir botón eliminar (preparar para futuro endpoint)
- [ ] Skeleton loading state

---

### 5.4 Página Completa de Settings

**Archivo**: `app/src/app/settings/page.tsx`

Integración:
- DocumentUpload en la parte superior
- DocumentList debajo
- Auto-refresh de lista después de upload exitoso

**Tareas**:
- [ ] Componer página con ambos componentes
- [ ] Implementar callback para refresh
- [ ] Añadir título y descripción
- [ ] Responsive design (stack en mobile)

---

## Fase 6: Gestión de Conversaciones en Sidebar

### 6.1 Actualizar AppSidebar

**Archivo**: `app/src/components/layout/app-sidebar.tsx`

Añadir:
- Lista de conversaciones (últimas 10-20)
- Botón "Nueva Conversación"
- Selección de conversación activa
- Botón eliminar por conversación

**Tareas**:
- [ ] Leer archivo actual del sidebar
- [ ] Integrar servicio `listConversations`
- [ ] Renderizar lista de conversaciones
- [ ] Implementar selección (highlight activa)
- [ ] Añadir botón "Nueva Conversación"
- [ ] Implementar eliminación con confirmación
- [ ] Actualizar lista al eliminar/crear

---

### 6.2 Hook de Gestión de Conversaciones

**Archivo**: `app/src/hooks/use-conversations.ts` (nuevo)

Encapsular:
- Lista de conversaciones
- Conversación activa
- Crear nueva
- Seleccionar existente
- Eliminar

**Tareas**:
- [ ] Crear hook custom
- [ ] Integrar con servicios
- [ ] Manejar estado de carga
- [ ] Implementar caché/refetch
- [ ] Sincronizar con localStorage

---

### 6.3 Cargar Conversación en Chat

**Archivo**: `app/src/components/chat/chat-container.tsx`

Al seleccionar una conversación:
- Cargar mensajes desde backend
- Mostrar en MessageList
- Mantener conversationId activo

**Tareas**:
- [ ] Añadir prop `conversationId` a ChatContainer
- [ ] Cargar conversación en useEffect al cambiar ID
- [ ] Integrar con servicio `getConversation`
- [ ] Transformar mensajes backend → frontend
- [ ] Scroll al final al cargar
- [ ] Loading state durante carga

---

## Fase 7: Mejoras de UX

### 7.1 Loading States

**Archivos múltiples**

Añadir:
- Skeleton en lista de documentos
- Spinner en lista de conversaciones
- Typing indicator en chat
- Progress bar en uploads

**Tareas**:
- [ ] Añadir skeletons en DocumentList
- [ ] Añadir skeletons en ConversationList
- [ ] Mejorar loading indicator en chat (typing animation)
- [ ] Progress bar en DocumentUpload

---

### 7.2 Error Handling Mejorado

**Archivo**: `app/src/lib/error-handler.ts` (nuevo)

Centralizar:
- Mapeo de errores HTTP a mensajes amigables
- Toasts consistentes
- Logging de errores

**Tareas**:
- [ ] Crear handler de errores centralizado
- [ ] Mapear códigos HTTP a mensajes en español
- [ ] Integrar con servicios
- [ ] Añadir error boundaries en React

---

### 7.3 Feedback Visual

**Archivos múltiples**

Mejorar:
- Toasts para operaciones exitosas
- Confirmaciones antes de eliminar
- Estados vacíos (empty states)

**Tareas**:
- [ ] Toast al subir documento
- [ ] Toast al crear/eliminar conversación
- [ ] Diálogo de confirmación para eliminar
- [ ] Empty states en listas vacías
- [ ] Ilustraciones o iconos para estados vacíos

---

## Fase 8: Preparación para Funcionalidades Futuras

### 8.1 Infraestructura para Streaming (HU5)

**Archivo**: `app/src/services/chat.ts`

Preparar:
- Función `streamMessage` con AsyncGenerator
- Manejo de EventSource
- Actualización incremental del mensaje

**Tareas**:
- [ ] Investigar EventSource en Next.js
- [ ] Crear función base para streaming
- [ ] Documentar para implementación futura
- [ ] No implementar completamente aún

---

### 8.2 Estructura para Analytics (HU7)

**Archivos**:
- `app/src/services/analytics.ts` (nuevo, placeholder)
- `app/src/types/analytics.ts` (nuevo, placeholder)

**Tareas**:
- [ ] Crear archivos placeholder
- [ ] Documentar endpoints esperados
- [ ] Definir tipos básicos
- [ ] No implementar UI aún

---

## Fase 9: Testing

### 9.1 Tests de Servicios

**Archivos**: `app/src/services/*.test.ts`

Tests:
- Mock de fetch para cada servicio
- Casos de éxito y error
- Transformación de datos

**Tareas**:
- [ ] Configurar Jest o Vitest si no está
- [ ] Tests para `documents.ts`
- [ ] Tests para `chat.ts`
- [ ] Tests para `conversations.ts`
- [ ] Mock de responses del backend

---

### 9.2 Tests de Componentes

**Archivos**: `app/src/components/**/*.test.tsx`

Tests:
- DocumentUpload: drag & drop, validación
- DocumentList: rendering, acciones
- ChatContainer: envío de mensajes, estados
- Sidebar: navegación entre conversaciones

**Tareas**:
- [ ] Configurar React Testing Library
- [ ] Tests de DocumentUpload
- [ ] Tests de DocumentList
- [ ] Tests de integración de ChatContainer

---

## Fase 10: Documentación

### 10.1 Actualizar README

**Archivo**: `app/README.md`

Añadir:
- Instrucciones de configuración de .env.local
- URL del backend necesaria
- Comandos de desarrollo
- Estructura de la integración

**Tareas**:
- [ ] Sección "Configuración del Backend"
- [ ] Variables de entorno requeridas
- [ ] Endpoints utilizados
- [ ] Troubleshooting común

---

### 10.2 Documentar Arquitectura

**Archivo**: `app/ARCHITECTURE.md` (nuevo) o actualizar base.md

Documentar:
- Flujo de datos frontend → backend
- Estructura de servicios
- Gestión de estado
- Tipos y transformaciones

**Tareas**:
- [ ] Crear o actualizar documentación de arquitectura
- [ ] Diagramas de flujo (opcional)
- [ ] Explicar decisiones técnicas

---

## Checklist General de Implementación

### Setup Inicial
- [ ] Crear `.env.local` con API_URL
- [ ] Instalar dependencias adicionales si son necesarias
- [ ] Verificar CORS en backend

### Servicios y Tipos
- [ ] Implementar cliente HTTP base
- [ ] Actualizar tipos TypeScript
- [ ] Crear servicio de documentos
- [ ] Crear servicio de chat
- [ ] Crear servicio de conversaciones
- [ ] Crear servicio de health

### Integración de Chat
- [ ] Reemplazar mock en ChatContainer
- [ ] Añadir visualización de sources
- [ ] Gestionar conversationId
- [ ] Mejorar manejo de errores

### Página de Settings
- [ ] Crear ruta /settings
- [ ] Componente DocumentUpload
- [ ] Componente DocumentList
- [ ] Integrar ambos en página
- [ ] Añadir link en sidebar

### Gestión de Conversaciones
- [ ] Actualizar AppSidebar con lista
- [ ] Implementar selección de conversación
- [ ] Cargar conversación en chat
- [ ] Botón "Nueva Conversación"
- [ ] Eliminar conversación

### UX y Polish
- [ ] Loading states en todos los componentes
- [ ] Error handling centralizado
- [ ] Toasts y feedback visual
- [ ] Empty states
- [ ] Responsive design verificado

### Testing
- [ ] Tests de servicios
- [ ] Tests de componentes clave
- [ ] Test de integración end-to-end (manual)

### Documentación
- [ ] Actualizar README
- [ ] Documentar arquitectura
- [ ] Comentarios en código complejo

---

## Priorización

### Sprint 1 (Alta Prioridad)
1. Setup inicial (API client, env)
2. Tipos TypeScript actualizados
3. Servicios básicos (documents, chat)
4. Integración de chat real
5. Página de settings básica (upload + lista)

### Sprint 2 (Media Prioridad)
6. Gestión de conversaciones en sidebar
7. Cargar conversación en chat
8. Visualización de sources
9. Loading states y error handling

### Sprint 3 (Baja Prioridad)
10. Tests
11. Documentación completa
12. Polish de UX
13. Preparación para streaming

---

## Notas Técnicas

### Diferencias Backend vs Frontend

**Backend (Python/FastAPI)**:
- snake_case para campos
- ISO strings para fechas
- UUIDs como strings

**Frontend (TypeScript/React)**:
- camelCase para tipos (mantener convención JS)
- Date objects internamente
- Transformación en servicios

**Estrategia**: Los servicios hacen la transformación, los componentes trabajan con tipos frontend.

### CORS

El backend ya tiene CORS habilitado con `allow_origins=["*"]`. Para producción, especificar el dominio del frontend.

### Persistencia de Conversación

Usar `localStorage` para mantener el `conversationId` activo entre recargas de página. Al cargar la app, verificar si existe una conversación guardada y cargarla.

### Documentos Temporales (HU6)

El backend ya soporta `is_temporary` en el upload. Añadir checkbox en el formulario de upload. Considerar implementar limpieza automática o manual en el futuro.

---

## Recursos

- **Documentación Backend**: `/api/README.md`
- **Schemas Backend**: `/api/app/presentation/schemas/`
- **Documentación Frontend**: `/app/base.md`
- **API Docs (Swagger)**: `http://localhost:8000/docs`

---

## Contacto y Soporte

Para preguntas sobre la implementación, revisar:
1. Este archivo `todo.md`
2. Historias de usuario en `/api/README.md`
3. Documentación de arquitectura en `/api/CLAUDE.md`
4. Código de referencia en `/api/tests/integration/`
