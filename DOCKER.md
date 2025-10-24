# 🐳 Guía de Docker - RAG Fin Evergreen

Esta guía explica cómo ejecutar el proyecto completo usando Docker y Docker Compose.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Prerequisitos](#prerequisitos)
- [Inicio Rápido](#inicio-rápido)
- [Configuración](#configuración)
- [Comandos Útiles](#comandos-útiles)
- [Volúmenes Persistentes](#volúmenes-persistentes)
- [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura

El proyecto está dockerizado en 3 servicios independientes:

```
┌─────────────────────────────────────────────────┐
│  rag-fin-evergreen                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐    ┌──────────────┐          │
│  │   app        │───▶│   api        │          │
│  │  (Next.js)   │    │  (FastAPI)   │          │
│  │  :3000       │    │  :8000       │          │
│  └──────────────┘    └──────┬───┬───┘          │
│                              │   │              │
│                     ┌────────▼   │              │
│                     │  chromadb  │              │
│                     │  :8001     │              │
│                     └────────────┘              │
│                              ┌───▼──────┐       │
│                              │ postgres │       │
│                              │  :5432   │       │
│                              └──────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Servicios

1. **postgres** (PostgreSQL Database)
   - Puerto: `5432`
   - Versión: PostgreSQL 16 Alpine
   - Base de datos: `rag_financial`
   - Usuario: `rag_user`
   - Almacenamiento: Volumen persistente

2. **app** (Next.js Frontend)
   - Puerto: `3000`
   - Framework: Next.js 15 con App Router
   - Build: Multi-stage con standalone output

3. **api** (FastAPI Backend)
   - Puerto: `8000`
   - Framework: FastAPI + Python 3.12
   - Base de datos: PostgreSQL (auto-detecta desde DATABASE_URL)
   - Healthcheck: `/health` endpoint

4. **chromadb** (Vector Store)
   - Puerto: `8001` (mapeado desde 8000 interno)
   - Imagen oficial: `chromadb/chroma:latest`
   - Almacenamiento: Volumen persistente

## 📦 Prerequisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- (Opcional) GNU Make para usar Makefile

### Verificar instalación

```bash
docker --version
docker-compose --version
```

## 🚀 Inicio Rápido

### 1. Clonar y configurar variables de entorno

```bash
# Copiar archivos de ejemplo
cp api/.env.example api/.env
cp app/.env.example app/.env.local

# Editar api/.env y agregar tu OpenAI API key
nano api/.env  # o usa tu editor preferido
```

**Variables importantes en `api/.env`:**

```env
OPENAI_API_KEY=sk-tu-api-key-aquí
DATABASE_URL=postgresql://rag_user:rag_password_change_me@postgres:5432/rag_financial
POSTGRES_PASSWORD=rag_password_change_me
CHROMA_URL=http://chromadb:8000
```

**⚠️ IMPORTANTE:** Cambia `rag_password_change_me` por una contraseña segura en producción.

### 2. Construir e iniciar servicios

```bash
# Construir imágenes y levantar todos los servicios
docker-compose up --build

# O en modo background (detached)
docker-compose up -d --build
```

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **API (Swagger Docs)**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432 (usuario: `rag_user`, db: `rag_financial`)
- **ChromaDB**: http://localhost:8001

### 4. Verificar que todo funciona

```bash
# Verificar estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api
```

## ⚙️ Configuración

### Variables de Entorno

#### API (`api/.env`)

```env
# Environment
ENV=development

# Server
PORT=8000

# Database (IMPORTANTE: 4 slashes para Docker)
DATABASE_URL=sqlite:////data/app.db

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here

# Chroma Vector Store (nombre del servicio Docker)
CHROMA_URL=http://chromadb:8000

# RAG Configuration
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K=5
```

#### Frontend (`app/.env.local`)

```env
# URL del backend (desde el navegador del host)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Timeout en milisegundos
NEXT_PUBLIC_API_TIMEOUT=30000
```

### Personalizar docker-compose.yml

#### Cambiar puertos

```yaml
services:
  app:
    ports:
      - "3001:3000"  # Exponer en puerto 3001

  api:
    ports:
      - "8080:8000"  # Exponer en puerto 8080
```

#### Agregar más variables de entorno

```yaml
services:
  api:
    environment:
      - ENV=production
      - LOG_LEVEL=info
      - CUSTOM_VAR=value
```

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up

# Iniciar en background
docker-compose up -d

# Detener servicios (preserva volúmenes)
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA TODOS LOS DATOS)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart api

# Reconstruir un servicio específico
docker-compose up -d --build api
```

### Logs y Debugging

```bash
# Ver logs de todos los servicios
docker-compose logs

# Seguir logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f api

# Últimas 100 líneas
docker-compose logs --tail=100 api

# Logs con timestamps
docker-compose logs -t
```

### Acceso a Contenedores

```bash
# Abrir shell en contenedor de API
docker-compose exec api bash

# Abrir shell en contenedor de app
docker-compose exec app sh

# Ejecutar comando en contenedor
docker-compose exec api python -c "print('Hello from API')"

# Ejecutar comando como root
docker-compose exec --user root api bash
```

### Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect rag-fin-evergreen_sqlite-data

# Ver uso de espacio
docker system df -v

# Limpiar volúmenes huérfanos (⚠️ cuidado)
docker volume prune
```

### Health Checks

```bash
# Verificar salud de servicios
docker-compose ps

# Inspeccionar salud de un contenedor
docker inspect --format='{{.State.Health.Status}}' rag-api

# Ver logs de health check
docker inspect --format='{{json .State.Health}}' rag-api | jq
```

## 💾 Volúmenes Persistentes

El proyecto usa volúmenes Docker nombrados para persistir datos:

### 1. `postgres-data`

- **Propósito**: Base de datos PostgreSQL con metadatos
- **Ubicación interna**: `/var/lib/postgresql/data`
- **Contiene**: Documentos, conversaciones, mensajes

### 2. `chroma-data`

- **Propósito**: ChromaDB vector embeddings
- **Ubicación interna**: `/chroma/chroma`
- **Contiene**: Vectores de documentos, índices

### Backup de Volúmenes

```bash
# Backup de PostgreSQL con Makefile (recomendado)
make backup-db

# Backup manual
docker-compose exec -T postgres pg_dump -U rag_user rag_financial > ./backups/postgres_$(date +%Y%m%d).sql

# Backup de volumen completo
docker run --rm -v rag-fin-evergreen_postgres-data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres-volume-$(date +%Y%m%d).tar.gz -C /data .
```

### Restaurar desde Backup

```bash
# Restaurar con Makefile
make restore-db BACKUP_FILE=./backups/postgres_20250123.sql

# Restaurar manualmente
docker-compose exec -T postgres psql -U rag_user -d rag_financial < ./backups/postgres_20250123.sql

# Restaurar volumen completo desde tar
docker run --rm -v rag-fin-evergreen_postgres-data:/data -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/postgres-volume-20250123.tar.gz -C /data
```

### Inspeccionar Datos

```bash
# Conectar a PostgreSQL
make exec-postgres
# o
docker-compose exec postgres psql -U rag_user -d rag_financial

# Ver tablas
\dt

# Ver datos
SELECT * FROM documents;
SELECT * FROM conversations LIMIT 10;

# Salir
\q

# Ver colecciones de ChromaDB
docker-compose exec chromadb curl http://localhost:8000/api/v1/collections
```

## 🐛 Troubleshooting

### Problema: El servicio API no inicia

**Síntomas**: Error "connection refused" o "unhealthy"

**Soluciones**:

```bash
# Ver logs detallados
docker-compose logs api

# Verificar que ChromaDB está saludable primero
docker-compose ps chromadb

# Reiniciar ChromaDB
docker-compose restart chromadb

# Reconstruir API sin caché
docker-compose build --no-cache api
docker-compose up -d api
```

### Problema: Frontend no conecta con API

**Síntomas**: Errores de CORS o timeout en el navegador

**Soluciones**:

1. Verificar `NEXT_PUBLIC_API_URL` en `app/.env.local`:

```env
# Debe apuntar al puerto del HOST, no al interno
NEXT_PUBLIC_API_URL=http://localhost:8000
```

2. Verificar que API está corriendo:

```bash
curl http://localhost:8000/health
```

3. Verificar CORS en API:

```bash
docker-compose logs api | grep CORS
```

### Problema: ChromaDB connection timeout

**Síntomas**: API no puede conectar con ChromaDB

**Soluciones**:

```bash
# Verificar que ChromaDB está corriendo
docker-compose ps chromadb

# Verificar logs de ChromaDB
docker-compose logs chromadb

# Verificar conectividad desde API
docker-compose exec api curl http://chromadb:8000/api/v1/heartbeat

# Si falla, reiniciar ambos servicios
docker-compose restart chromadb api
```

### Problema: Permisos en volúmenes

**Síntomas**: "Permission denied" al escribir en `/data`

**Soluciones**:

```bash
# Entrar como root y arreglar permisos
docker-compose exec --user root api chown -R apiuser:apiuser /data

# Verificar permisos
docker-compose exec api ls -la /data
```

### Problema: Falta espacio en disco

**Síntomas**: "No space left on device"

**Soluciones**:

```bash
# Ver uso de espacio
docker system df

# Limpiar imágenes y contenedores no usados
docker system prune -a

# Limpiar volúmenes no usados (⚠️ cuidado)
docker volume prune
```

### Problema: Build falla en Next.js

**Síntomas**: Error durante `npm run build`

**Soluciones**:

```bash
# Verificar que hay suficiente memoria
docker stats

# Limpiar caché de Next.js localmente
cd app && rm -rf .next node_modules
cd .. && docker-compose build --no-cache app

# Aumentar memoria de Docker (Docker Desktop -> Settings)
```

### Limpiar todo y empezar de cero

```bash
# Detener servicios
docker-compose down

# Eliminar volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Limpiar sistema completo
docker system prune -a --volumes

# Reconstruir desde cero
docker-compose up --build
```

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [ChromaDB Documentation](https://docs.trychroma.com/)

## 🆘 Soporte

Si encuentras problemas no cubiertos aquí:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica configuración de `.env`
3. Consulta issues en el repositorio
4. Revisa documentación individual de cada servicio
