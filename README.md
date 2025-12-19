# MindInVis

A web application for mind mapping with LLM integration, based on ChatInVis.

## Project Structure

```
MindInVis/
├── client/         # Frontend (React + Vite)
├── server/         # Backend (Node.js + Express)
├── shared/         # Shared code
├── database/       # Migrations and seeds
└── docs/           # Documentation
```

## Tech Stack

### Frontend
- React 18
- Vite
- Zustand/Redux (state management)
- D3.js/Vis.js (mind map visualization)
- TailwindCSS/Styled Components

### Backend
- Node.js + Express
- LangChain (LLM integration)
- PostgreSQL/MongoDB (database)
- JWT (authentication)

### LLM APIs
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)

## Development

### Installation

```bash
# Install dependencies for the entire project
npm install

# Install only frontend
cd client && npm install

# Install only backend
cd server && npm install
```

### Local Development

```bash
# Start everything (frontend + backend)
npm run dev

# Only frontend
npm run dev:client

# Only backend
npm run dev:server
```

### Production Build

```bash
npm run build
```

## Architecture

### Frontend
- **Components**: Reusable React components
- **Services**: Backend API communication
- **Store**: Global application state
- **Hooks**: Custom React hooks

### Backend
- **Controllers**: Route controller logic
- **Services**: Business logic (LLM, Mindmap, etc.)
- **Models**: Data models
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, validation, error handling

### Shared
- **Constants**: Shared constants (icons, prompt styles)
- **Types**: TypeScript type definitions
- **Utils**: Shared utilities

## Migration from ChatInVis

The following components have been migrated:

- `MindmapManager.js` → `server/src/services/mindmap/MindmapManager.js`
- `LLMManagerBackground.js` → `server/src/services/llm/LLMManager.js`
- `PromptBuilder.js` → `server/src/services/llm/PromptBuilder.js`
- Models (Problem, Intervention, Consequence) → `server/src/models/`
- Utils → `server/src/utils/` and `shared/utils/`

## License

MIT
