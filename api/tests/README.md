# Tests

Este directorio contiene los tests para el backend del asistente financiero.

## Estructura

```
tests/
├── unit/                 # Tests unitarios
│   ├── test_document_processor.py
│   ├── test_upload_document_usecase.py
│   └── test_chat_usecase.py
├── integration/          # Tests de integración
│   ├── test_documents_api.py
│   └── test_chat_api.py
├── fixtures/             # Fixtures compartidas
└── conftest.py           # Configuración de pytest
```

## Ejecutar tests

### Todos los tests

```bash
pytest
```

### Solo tests unitarios

```bash
pytest -m unit
```

### Solo tests de integración

```bash
pytest -m integration
```

### Con cobertura

```bash
pytest --cov=app --cov-report=html
```

El reporte HTML estará en `htmlcov/index.html`

### Test específico

```bash
pytest tests/unit/test_document_processor.py::TestDocumentProcessor::test_chunk_text_basic
```

### Modo verbose

```bash
pytest -v
```

### Mostrar prints

```bash
pytest -s
```

## Tests implementados

### HU1 - Subir documento y vectorizar

**Tests unitarios:**
- `test_document_processor.py` - Procesamiento de documentos (PDF, CSV, chunking)
- `test_upload_document_usecase.py` - Lógica de negocio de upload

**Tests de integración:**
- `test_documents_api.py` - Endpoints `/documents/upload` y `/documents`

### HU3 - Chat básico

**Tests unitarios:**
- `test_chat_usecase.py` - Lógica de negocio de chat RAG

**Tests de integración:**
- `test_chat_api.py` - Endpoint `/chat/message`

## Fixtures disponibles

Definidas en `conftest.py`:

- `temp_db` - Base de datos temporal SQLite
- `db_client` - Cliente de base de datos para tests
- `mock_embedding_service` - Mock de servicio de embeddings
- `mock_chat_service` - Mock de servicio de chat
- `mock_vector_store` - Mock de vector store
- `sample_document` - Documento de ejemplo
- `sample_pdf_content` - Contenido PDF de ejemplo
- `sample_csv_content` - Contenido CSV de ejemplo
- `test_client` - Cliente HTTP para tests de API

## Notas

- Los tests usan mocks para servicios externos (OpenAI, Chroma)
- La base de datos se crea en memoria para tests
- Los tests son independientes entre sí
- Se usa `pytest-asyncio` para tests asíncronos