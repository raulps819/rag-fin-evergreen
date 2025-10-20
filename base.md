# Roadmap Frontend - Sistema RAG Agropecuario

## Visión General
Sistema de consulta inteligente tipo ChatGPT para productores agropecuarios que permite analizar contratos, órdenes de compra, facturas y ventas históricas mediante lenguaje natural.

## Stack Tecnológico
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: React Hooks (useState, useContext)
- **Cliente HTTP**: Fetch API / Axios
- **Tipado**: TypeScript

---

## Fase 1: Fundamentos y Estructura Base (Semana 1-2)

### 1.1 Configuración del Proyecto
- [x] Inicializar proyecto Next.js
- [x] Configurar Tailwind CSS
- [x] Configurar shadcn/ui
- [ ] Configurar estructura de carpetas
  ```
  src/
  ├── app/
  ├── components/
  │   ├── chat/
  │   ├── ui/
  │   └── layout/
  ├── hooks/
  ├── lib/
  ├── types/
  └── utils/
  ```

### 1.2 Componentes UI Base
- [ ] Layout principal con sidebar
- [ ] Header con información del usuario
- [ ] Componentes shadcn/ui necesarios:
  - Button
  - Input
  - Card
  - Dialog
  - Select
  - Textarea
  - Sonner (notificaciones)
  - Skeleton (loading states)

---

## Fase 2: Interfaz de Chat Principal (Semana 3-4)

### 2.1 Componentes de Chat
- [ ] **ChatContainer**: Contenedor principal del chat
- [ ] **MessageList**: Lista de mensajes con scroll virtual
- [ ] **Message**: Componente individual de mensaje
  - Mensaje del usuario (derecha)
  - Mensaje del asistente (izquierda)
  - Estados de carga (typing indicator)
  - Soporte para markdown/formato
- [ ] **ChatInput**: Input con autoexpand y botón enviar
  - Validación de input
  - Manejo de Enter/Shift+Enter
  - Character counter
- [ ] **SuggestedQuestions**: Chips con preguntas sugeridas

### 2.2 Funcionalidades de Chat
- [ ] Envío de mensajes
- [ ] Recepción de respuestas en streaming (si aplica)
- [ ] Historial de conversación
- [ ] Scroll automático a último mensaje
- [ ] Indicador de "escribiendo..."
- [ ] Manejo de errores en mensajes

---

## Fase 3: Consultas Especializadas (Semana 5-6)

### 3.1 Tipos de Consultas
Implementar UI específica para cada tipo de consulta:

#### Consultas de Gastos
- [ ] Filtros por periodo (día/semana/mes/trimestre/año)
- [ ] Filtros por categoría (fertilizantes, semillas, maquinaria, etc.)
- [ ] Visualización de totales

#### Comparación de Proveedores
- [ ] Tabla comparativa de precios
- [ ] Filtros por producto/categoría
- [ ] Ordenamiento por precio, calidad, historial

#### Análisis de Ventas
- [ ] Selector de rango de fechas
- [ ] Filtro por producto
- [ ] Toggle entre vista tabla/gráfica

### 3.2 Componentes de Visualización
- [ ] **DataTable**: Tabla de datos con sorting/filtering
- [ ] **ChartContainer**: Wrapper para gráficas
- [ ] **StatCard**: Tarjeta de estadística (KPI)
- [ ] **FilterPanel**: Panel de filtros reutilizable
- [ ] **DateRangePicker**: Selector de rango de fechas

---

## Fase 4: Visualización de Datos (Semana 7-8)

### 4.1 Integración de Gráficas
Librería sugerida: Recharts / Chart.js / Tremor

- [ ] **LineChart**: Tendencias temporales de ventas
- [ ] **BarChart**: Comparativas de gastos/ingresos
- [ ] **PieChart**: Distribución de gastos por categoría
- [ ] **AreaChart**: Volumen de ventas en el tiempo

### 4.2 Componentes de Análisis
- [ ] **TrendIndicator**: Indicador de tendencia (↑↓)
- [ ] **PercentageChange**: Cambio porcentual con color
- [ ] **ComparisonCard**: Comparación periodo vs periodo
- [ ] **InsightCard**: Tarjeta de insight/recomendación

---

## Fase 5: Documentos y Referencias (Semana 9)

### 5.1 Visor de Documentos
- [ ] **DocumentViewer**: Componente para mostrar PDFs
- [ ] **DocumentPreview**: Preview en modal/sidebar
- [ ] **DocumentList**: Lista de documentos referenciados
- [ ] **SourceCitation**: Citación de fuente en respuestas

### 5.2 Gestión de Documentos
- [ ] Listado de contratos
- [ ] Listado de órdenes de compra
- [ ] Listado de facturas
- [ ] Búsqueda y filtrado de documentos
- [ ] Vista detalle de documento

---

## Fase 6: Features Avanzadas (Semana 10-11)

### 6.1 Historial y Persistencia
- [ ] **ConversationHistory**: Sidebar con historial
- [ ] Guardar conversaciones
- [ ] Retomar conversaciones anteriores
- [ ] Búsqueda en historial
- [ ] Exportar conversación (PDF/TXT)

### 6.2 Configuración y Preferencias
- [ ] Panel de configuración de usuario
- [ ] Preferencias de notificaciones
- [ ] Tema claro/oscuro
- [ ] Idioma (ES/EN si aplica)

### 6.3 Sugerencias Inteligentes
- [ ] Autocompletado de consultas
- [ ] Sugerencias contextuales
- [ ] Preguntas de seguimiento
- [ ] Templates de consultas comunes

---

## Fase 7: Optimización y UX (Semana 12)

### 7.1 Performance
- [ ] Implementar React.memo en componentes pesados
- [ ] Lazy loading de componentes
- [ ] Virtualización de listas largas
- [ ] Optimización de imágenes
- [ ] Code splitting por rutas

### 7.2 Estados de Carga y Errores
- [ ] Skeleton screens para carga inicial
- [ ] Loading spinners contextuales
- [ ] Error boundaries
- [ ] Empty states con ilustraciones
- [ ] Retry mechanisms

### 7.3 Accesibilidad
- [ ] Navegación por teclado
- [ ] ARIA labels
- [ ] Contraste de colores (WCAG AA)
- [ ] Lectores de pantalla
- [ ] Focus management

---

## Fase 8: Responsive y Mobile (Semana 13)

### 8.1 Adaptación Mobile
- [ ] Layout responsive
- [ ] Sidebar colapsable/drawer en mobile
- [ ] Touch gestures
- [ ] Optimización de inputs táctiles
- [ ] Menu hamburguesa

### 8.2 PWA (Opcional)
- [ ] Service Worker
- [ ] Manifest.json
- [ ] Offline capabilities básicas
- [ ] Install prompt

---

## Fase 9: Testing y QA (Semana 14)

### 9.1 Testing
- [ ] Unit tests (componentes clave)
- [ ] Integration tests (flujos principales)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Visual regression tests (opcional)

### 9.2 QA Manual
- [ ] Testing cross-browser
- [ ] Testing en dispositivos reales
- [ ] Pruebas de usabilidad con usuarios
- [ ] Fix de bugs encontrados

---

## Fase 10: Deployment y Monitoreo (Semana 15)

### 10.1 Preparación para Producción
- [ ] Configurar variables de entorno
- [ ] Optimización de build
- [ ] Setup de CI/CD
- [ ] Configurar analytics
- [ ] Error tracking (Sentry/LogRocket)

### 10.2 Deployment
- [ ] Deploy en Vercel/Netlify
- [ ] Configurar dominio
- [ ] Setup de monitoring
- [ ] Documentation de deployment

---

## Componentes Clave por Prioridad

### Prioridad Alta (MVP)
1. ChatContainer + MessageList + Message
2. ChatInput
3. Layout principal
4. Conexión con API backend
5. Estados de carga básicos

### Prioridad Media
1. DataTable para resultados
2. Gráficas básicas (Line/Bar)
3. FilterPanel
4. ConversationHistory
5. DocumentViewer

### Prioridad Baja
1. Exportación de datos
2. PWA features
3. Temas personalizados
4. Analytics avanzados
5. Gamificación/tours

---

## Ejemplos de Flujos de Usuario

### Flujo 1: Consulta Simple
```
Usuario → Escribe pregunta → Enter → Loading → Respuesta del asistente
```

### Flujo 2: Consulta con Análisis
```
Usuario → Pregunta sobre gastos → Loading →
Respuesta + Gráfica + Tabla → Usuario puede filtrar/explorar
```

### Flujo 3: Consulta con Documentos
```
Usuario → Pregunta sobre contrato → Loading →
Respuesta + Referencias → Click en referencia →
Modal con documento → Highlight de sección relevante
```

---

## Notas Técnicas

### Estado Global Necesario
```typescript
interface AppState {
  user: User;
  currentConversation: Conversation;
  conversationHistory: Conversation[];
  filters: FilterState;
  preferences: UserPreferences;
}
```

### API Endpoints Requeridos
- `POST /api/chat` - Enviar mensaje
- `GET /api/conversations` - Historial
- `GET /api/documents` - Listar documentos
- `GET /api/analytics` - Datos para gráficas
- `POST /api/query` - Consultas estructuradas

### Consideraciones de Diseño
- Mantener consistencia con ChatGPT/Claude para familiaridad
- Usar terminología del sector agropecuario
- Priorizar velocidad de respuesta
- Diseño limpio y profesional
- Iconografía clara y reconocible

---

## Métricas de Éxito

- Tiempo de carga inicial < 3s
- Time to interactive < 5s
- Respuesta del chat < 2s (sin contar backend)
- Lighthouse score > 90
- 0 errores críticos de accesibilidad
- Soporte para navegadores modernos (últimas 2 versiones)

---

## Próximos Pasos Inmediatos

1. Completar setup de componentes shadcn/ui necesarios
2. Crear estructura de carpetas definitiva
3. Implementar ChatContainer básico
4. Conectar con API de prueba/mock
5. Iterar en base a feedback