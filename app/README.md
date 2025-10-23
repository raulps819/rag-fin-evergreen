# 🧠 Asistente Financiero con IA (Frontend)

Frontend Next.js 15 para el asistente financiero inteligente con RAG. Interfaz estilo ChatGPT para consultar documentos financieros usando lenguaje natural.

## Requisitos Previos

- Node.js 18+ y pnpm (o npm)
- Backend FastAPI corriendo en `http://localhost:8000` (ver `/api/README.md`)

## Configuración Inicial

### 1. Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# URL del backend FastAPI
NEXT_PUBLIC_API_URL=http://localhost:8000

# Timeout para requests (ms)
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 2. Instalar Dependencias

```bash
pnpm install
# o
npm install
```

## Getting Started

Primero, asegúrate de que el backend esté corriendo (ver `/api/README.md`).

Luego, inicia el servidor de desarrollo:

```bash
pnpm dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Arquitectura

### Estructura del Proyecto

```
app/
├── src/
│   ├── app/              # Next.js App Router (páginas)
│   ├── components/       # Componentes React
│   │   ├── chat/        # Interfaz de chat
│   │   ├── layout/      # Layout y sidebar
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilidades (api-client, etc.)
│   ├── services/        # Servicios de API
│   ├── types/           # Tipos TypeScript
│   └── hooks/           # Custom React hooks
└── public/              # Archivos estáticos
```

### Integración con Backend

El frontend se comunica con el backend FastAPI mediante:

- **API Client**: `src/lib/api-client.ts` - Cliente HTTP centralizado
- **Servicios**: `src/services/` - Funciones específicas por dominio
- **Tipos**: `src/types/` - Tipos TypeScript que mapean schemas del backend

### Endpoints Utilizados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/documents/upload` | POST | Subir documento |
| `/documents` | GET | Listar documentos |
| `/chat/message` | POST | Enviar mensaje RAG |
| `/conversations` | GET/POST | Gestionar conversaciones |
| `/conversations/{id}` | GET/DELETE | Detalle/eliminar conversación |

Ver documentación completa en `/api/README.md`

## Tecnologías

- **Framework**: Next.js 15.5.5 con App Router
- **React**: 19.1.0
- **UI**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **Iconos**: lucide-react
- **Notificaciones**: sonner
- **Tema**: next-themes
- **Build**: Turbopack

## Comandos Disponibles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Iniciar producción
pnpm start

# Linting
pnpm lint
```

## Troubleshooting

### Error: "Cannot connect to backend"

1. Verifica que el backend esté corriendo: `http://localhost:8000/docs`
2. Revisa la variable `NEXT_PUBLIC_API_URL` en `.env.local`
3. Verifica CORS en el backend (ya configurado por defecto)

### Error: "Module not found"

```bash
# Limpia dependencias y reinstala
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build falla en producción

Asegúrate de que `.env.local` tenga las variables correctas o usa variables de entorno en tu plataforma de deployment.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
