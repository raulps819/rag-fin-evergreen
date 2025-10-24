# RAG Fin Evergreen

Sistema RAG (Retrieval-Augmented Generation) para productores agrícolas. Interfaz inteligente tipo ChatGPT para analizar contratos, órdenes de compra, facturas y datos históricos de ventas usando lenguaje natural.

## 🚀 Inicio Rápido con Docker

### Prerequisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- OpenAI API Key

### Instalación en 3 pasos

```bash
# 1. Clonar y configurar
git clone <repo-url>
cd rag-fin-evergreen

# 2. Configurar variables de entorno
make dev-setup
# Editar api/.env y agregar tu OPENAI_API_KEY

# 3. Iniciar servicios
make dev
```

Acceder a:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432 (user: rag_user, db: rag_financial)
- **ChromaDB**: http://localhost:8001

### Comandos útiles

```bash
make help          # Ver todos los comandos disponibles
make up            # Iniciar servicios
make down          # Detener servicios
make logs          # Ver logs
make logs-api      # Ver logs del API
make health        # Verificar salud de servicios
make backup-db     # Backup de base de datos
```

## 📖 Documentación

- **[DOCKER.md](./DOCKER.md)**: Guía completa de Docker
- **[app/README.md](./app/README.md)**: Frontend (Next.js)
- **[api/README.md](./api/README.md)**: Backend (FastAPI)

## 🏗️ Arquitectura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Next.js   │───▶│   FastAPI   │───▶│  ChromaDB   │
│   :3000     │    │   :8000     │    │   :8001     │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
                    ┌─────▼──────┐
                    │ PostgreSQL │
                    │   :5432    │
                    └────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python 3.12
- **Database**: PostgreSQL 16
- **Vector Store**: ChromaDB
- **AI**: OpenAI (Embeddings + Chat)
- **Deployment**: Docker + Docker Compose

## 📝 Desarrollo Local (sin Docker)

Ver documentación específica en cada carpeta:

- Frontend: `cd app && pnpm dev`
- Backend: `cd api && uvicorn app.main:app --reload`

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Ver archivo [LICENSE](./LICENSE)