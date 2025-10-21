# Chat API Documentation

## Overview

The Chat API provides RAG (Retrieval-Augmented Generation) capabilities for querying agricultural financial documents using natural language.

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### 1. Standard Chat Query

Send a query and receive a complete response with sources.

**Endpoint:** `POST /api/chat`

**Request Body:**
```json
{
  "query": "¿Cuánto gasté en fertilizantes el mes pasado?",
  "documentTypes": ["INVOICE", "PURCHASE_ORDER"],
  "topK": 5,
  "dateRange": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-12-31T23:59:59Z"
  }
}
```

**Parameters:**
- `query` (required, string, 1-1000 chars): User's natural language question
- `documentTypes` (optional, array): Filter by document types
  - Possible values: `CONTRACT`, `PURCHASE_ORDER`, `INVOICE`, `SALES_RECORD`, `OTHER`
- `topK` (optional, number, 1-20, default: 5): Number of relevant chunks to retrieve
- `dateRange` (optional, object): Filter documents by date range
  - `from` (date-time): Start date
  - `to` (date-time): End date

**Response:**
```json
{
  "answer": "Según los documentos, gastaste $15,000 pesos en fertilizantes el mes pasado.",
  "sources": [
    {
      "id": "doc-123-chunk-0",
      "documentId": "doc-123",
      "content": "Factura de compra de fertilizantes...",
      "score": 0.89,
      "metadata": {
        "documentType": "INVOICE",
        "originalName": "factura-fertilizantes-sept.pdf",
        "pageNumber": 1,
        "chunkIndex": 0
      }
    }
  ],
  "metadata": {
    "modelUsed": "gpt-4o-mini",
    "retrievalTime": 234,
    "generationTime": 1567,
    "totalTokens": 450
  }
}
```

### 2. Streaming Chat Query

Send a query and receive a streaming response (Server-Sent Events).

**Endpoint:** `POST /api/chat/stream`

**Request Body:** Same as standard chat query

**Response:** SSE (text/event-stream)

```
data: {"type":"sources","sources":[...]}

data: {"type":"chunk","content":"Según"}

data: {"type":"chunk","content":" los"}

data: {"type":"chunk","content":" documentos"}

data: {"type":"done","metadata":{...}}

data: [DONE]
```

**Event Types:**
- `sources`: Initial event with retrieved document chunks
- `chunk`: Text chunk from LLM response
- `done`: Final event with metadata
- `[DONE]`: Stream termination marker

## Example Usage

### cURL - Standard Query

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Cuáles son mis principales proveedores?",
    "topK": 3
  }'
```

### cURL - Streaming Query

```bash
curl -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Resume mis gastos del último trimestre",
    "topK": 5
  }'
```

### JavaScript/TypeScript - Standard Query

```typescript
const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '¿Cuánto vendí de maíz este año?',
    documentTypes: ['SALES_RECORD'],
    topK: 5,
  }),
});

const data = await response.json();
console.log(data.answer);
console.log('Sources:', data.sources);
```

### JavaScript/TypeScript - Streaming Query

```typescript
const response = await fetch('http://localhost:3001/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Analiza mis gastos en insumos agrícolas',
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        console.log('Stream complete');
        break;
      }

      try {
        const event = JSON.parse(data);

        if (event.type === 'sources') {
          console.log('Sources:', event.sources);
        } else if (event.type === 'chunk') {
          process.stdout.write(event.content);
        } else if (event.type === 'done') {
          console.log('\nMetadata:', event.metadata);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }
}
```

### Python - Standard Query

```python
import requests

response = requests.post(
    'http://localhost:3001/api/chat',
    json={
        'query': '¿Cuáles fueron mis mayores gastos en el último mes?',
        'topK': 5
    }
)

data = response.json()
print(f"Answer: {data['answer']}")
print(f"Sources: {len(data['sources'])}")
```

### Python - Streaming Query

```python
import requests
import json

response = requests.post(
    'http://localhost:3001/api/chat/stream',
    json={'query': 'Resume mi actividad comercial'},
    stream=True
)

for line in response.iter_lines():
    if line:
        decoded = line.decode('utf-8')
        if decoded.startswith('data: '):
            data = decoded[6:]
            if data == '[DONE]':
                break

            try:
                event = json.loads(data)
                if event.get('type') == 'chunk':
                    print(event['content'], end='', flush=True)
            except json.JSONDecodeError:
                pass

print()  # New line at end
```

## Error Handling

### Validation Errors (400)

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error",
  "details": [
    {
      "field": "query",
      "message": "Query is required"
    }
  ]
}
```

### Internal Server Errors (500)

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Failed to generate response"
}
```

## Performance Tips

1. **Use appropriate topK**: Start with 3-5 chunks, increase if needed
2. **Filter by document type**: Reduces search space and improves relevance
3. **Use streaming for long responses**: Better UX for complex queries
4. **Add date filters**: Improves performance and relevance

## Query Examples (Spanish)

### Financial Analysis
- "¿Cuánto gasté en fertilizantes el mes pasado?"
- "¿Cuáles son mis principales proveedores?"
- "Resume mis gastos del último trimestre"
- "¿Cuál fue mi mayor compra este año?"

### Sales Analysis
- "¿Cuánto vendí de maíz este año?"
- "¿Quiénes son mis mejores clientes?"
- "Compara mis ventas de este año con el año pasado"

### Contract Analysis
- "¿Qué contratos tengo vigentes?"
- "¿Cuándo vence mi contrato con [proveedor]?"
- "Resume los términos de mi contrato actual"

### Comparative Analysis
- "Compara los precios de fertilizantes entre diferentes proveedores"
- "¿Cómo han variado mis gastos en los últimos 6 meses?"