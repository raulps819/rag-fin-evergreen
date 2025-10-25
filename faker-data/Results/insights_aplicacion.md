# Insights clave del stack RAG

## Arquitectura y flujo principal
- FastAPI (`api/app/main.py`) expone endpoints de salud, carga de documentos, chat y conversaciones, levantando migraciones al inicio y gestionando CORS para facilitar despliegues híbridos.
- `app/core/container.py` implementa un contenedor DI manual que detecta en tiempo de ejecución si debe usar PostgreSQL o SQLite, comparte clientes de OpenAI/Chroma y permite instanciar `ChatUseCase` bajo demanda para pruebas.
- El flujo de chat (`app/application/usecases/chat.py`) persiste cada turno, expande queries opcionalmente, busca embeddings en Chroma y construye contexto (historial o documentos) antes de llamar al LLM.
- El caso de uso de carga (`app/application/usecases/upload_document.py`) transforma documentos en chunks y metadatos, guarda la metadata en la base y sincroniza embeddings en el vector store, formando la base documental del RAG.

## Optimizaciones implementadas
- **Clientes OpenAI persistentes**: tanto `OpenAIChatService` como `OpenAIEmbeddingService` crean el cliente una sola vez para evitar sobrecarga de httpx y reutilizar conexiones.
- **Prompt financiero especializado**: el prompt por defecto en `openai_chat.py` establece tono, idioma y reglas de precisión/negación de alucinaciones.
- **Heurística de contexto**: si no hay chunks relevantes, el chat cae elegantemente al historial conversacional en lugar de responder “sin datos”.
- **Filtro de relevancia**: los resultados de Chroma convierten distancias a similitud y descartan chunks por debajo de `MIN_RELEVANCE`, reduciendo ruido antes de llegar al LLM.
- **Query expansion**: `OpenAIQueryExpansionService` usa un modelo liviano (gpt‑4o‑mini) para añadir sinónimos y términos en inglés/español, mejorando la recuperación en dominios mixtos.
- **Procesamiento tabular resiliente**: `DocumentProcessor` intenta múltiples codificaciones y genera un chunk por fila para CSV/Excel, preservando estructura numérica y evitando errores de Unicode.
- **Chunking semántico**: al trocear texto busca delimitadores de oración para romper cerca del final de frase y añade overlap configurable para mantener coherencia.
- **Metadatos enriquecidos**: cada chunk almacena `document_id`, `chunk_index`, `filename` y `file_type`, lo que simplifica trazabilidad en las citas.
- **Migraciones automáticas**: durante el `lifespan` se ejecuta `run_migrations`, garantizando que la base SQLite esté alineada sin pasos manuales.

## Puntos fuertes actuales
1. **Separación por capas y puertos**: ports/adapters claros permiten sustituir el vector store o el LLM sin tocar los use cases.
2. **Observabilidad básica**: hay logs para expansiones, similitudes, llamadas al LLM y escenarios sin contexto, útiles para depurar recuperaciones deficientes.
3. **Soporte multibase**: la capa de datos puede apuntar a PostgreSQL en producción y SQLite localmente sin cambiar código.
4. **Resiliencia en ingestión**: soporte para PDF, CSV y Excel, con validaciones de texto vacío y formatos no soportados.
5. **Experiencia de usuario coherente**: el prompt fuerza respuestas en español amable, y el chat ofrece disculpas/indicaciones cuando falla el LLM.

## Debilidades detectadas
1. **Dependencia fuerte de OpenAI**: no hay interfaz para alternar modelos open‑source ni mecanismo de fallback cuando la API falla.
2. **Ausencia de control de costos**: `max_completion_tokens=10000` en el chat puede disparar costos; no se limita por tipo de pregunta ni tamaño de contexto.
3. **Métricas y tracing**: no hay instrumentación Prometheus/OpenTelemetry para medir latencias de embeddings, búsquedas o completions.
4. **Gestión de errores en ingestión**: los `ValueError` por documentos vacíos o encoding fallido no se contextualizan para el usuario final ni se registran con más detalle.
5. **Persistencia inconsistente**: las migraciones solo cubren SQLite mientras los repositorios están pensados para PostgreSQL, lo que puede dejar esquemas divergentes.
6. **Sin políticas de limpieza**: no existe retención/expiración de conversaciones, documentos temporales o embeddings huérfanos.

## Aspectos por mejorar
1. **Streaming y manejo de tokens**: habilitar respuestas en streaming y ajustar `max_completion_tokens` dinámicamente según `len(context)` / complejidad de la pregunta.
2. **Fallback multi-modelo**: exponer en configuración modelos alternos (Azure, DeepSeek, local) y circuit breakers cuando OpenAI no responda.
3. **Validaciones previas al LLM**: incorporar chequeos automáticos (por ejemplo, verificar que los montos recuperados sigan el formato esperado) antes de enviar la respuesta al usuario.
4. **Instrumentación y alertas**: agregar contadores de búsquedas vacías, histogramas de similitud y traces distribuidos para detectar cuellos de botella en Chroma o embeddings.
5. **Gestión de datos sensibles**: añadir mascaramiento/redacción para campos críticos en los chunks y en los logs, reduciendo riesgo de fuga de información.
6. **Workflows de ingestión masiva**: orquestar procesos background (RQ/Celery) para documentos grandes y añadir versionado de embeddings para facilitar reindexaciones.
7. **Evaluación continua**: integrar la matriz de evaluación creada previamente en pipelines de regresión para detectar alucinaciones/errores antes de desplegar nuevos prompts o modelos.
