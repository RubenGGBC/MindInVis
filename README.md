# MindInVis

Aplicación web para mind mapping con integración de LLM, basada en ChatInVis.

## Estructura del Proyecto

```
MindInVis/
├── client/         # Frontend (React + Vite)
├── server/         # Backend (Node.js + Express)
├── shared/         # Código compartido
├── database/       # Migraciones y seeds
└── docs/          # Documentación
```

## Stack Tecnológico

### Frontend
- React 18
- Vite
- Zustand/Redux (state management)
- D3.js/Vis.js (visualización de mind map)
- TailwindCSS/Styled Components

### Backend
- Node.js + Express
- LangChain (integración LLM)
- PostgreSQL/MongoDB (base de datos)
- JWT (autenticación)

### APIs LLM
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)

## Desarrollo

### Instalación

```bash
# Instalar dependencias de todo el proyecto
npm install

# Instalar solo frontend
cd client && npm install

# Instalar solo backend
cd server && npm install
```

### Desarrollo Local

```bash
# Iniciar todo (frontend + backend)
npm run dev

# Solo frontend
npm run dev:client

# Solo backend
npm run dev:server
```

### Build para Producción

```bash
npm run build
```

## Arquitectura

### Frontend
- **Components**: Componentes React reutilizables
- **Services**: Comunicación con API backend
- **Store**: Estado global de la aplicación
- **Hooks**: Custom hooks de React

### Backend
- **Controllers**: Lógica de controladores de rutas
- **Services**: Lógica de negocio (LLM, Mindmap, etc.)
- **Models**: Modelos de datos
- **Routes**: Definición de endpoints API
- **Middleware**: Autenticación, validación, error handling

### Shared
- **Constants**: Constantes compartidas (iconos, estilos de prompts)
- **Types**: Definiciones de tipos TypeScript
- **Utils**: Utilidades compartidas

## Migración desde ChatInVis

Los siguientes componentes han sido migrados:

- `MindmapManager.js` → `server/src/services/mindmap/MindmapManager.js`
- `LLMManagerBackground.js` → `server/src/services/llm/LLMManager.js`
- `PromptBuilder.js` → `server/src/services/llm/PromptBuilder.js`
- Modelos (Problem, Intervention, Consequence) → `server/src/models/`
- Utils → `server/src/utils/` y `shared/utils/`

## Licencia

MIT
