# SmartAllies Frontend

React + TypeScript Progressive Web App for incident reporting.

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PWA** - Installable with push notifications

## Features

✅ **Core Chat Workflow** - Interactive chatbot for all 3 incident types
✅ **Image Upload** - Camera + file upload support  
✅ **Floor Plan Selector** - Clickable pin placement for facility incidents
✅ **PWA Support** - Installable app with service worker
✅ **Push Notifications** - Browser notification support
⏳ **Voice Input** - WebSpeech API (optional enhancement)

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Service worker for PWA
├── src/
│   ├── components/
│   │   ├── chat/              # Chat components
│   │   ├── floor-plan/        # Floor plan selector
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API services
│   ├── types/                 # TypeScript types
│   ├── config/                # Configuration
│   ├── utils/                 # Helper functions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Configuration

### API Endpoint

The frontend proxies API requests to the backend. Configure in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

### Theme Color

Primary color is set to `#fa5b35` in:
- `tailwind.config.js`
- `manifest.json`
- `index.html` (theme-color meta tag)

## PWA Features

### Installation

The app can be installed on mobile devices and desktops. The browser will show an install prompt when criteria are met.

### Service Worker

Automatically registers on app load. Caches essential files for offline access.

### Push Notifications

Requests notification permission on first load. Ready for push notification integration.

## Components

### ChatInterface

Main chat component that orchestrates the conversation flow.

### MessageList

Displays conversation history with user/assistant messages.

### MessageInput

Input field with image upload (camera + file) and send button.

### ActionButtons

Displays suggested actions based on bot response.

### FloorPlanSelector

Interactive floor plan with clickable pin placement for facility incidents.

## Development

### Hot Reload

Vite provides instant hot module replacement during development.

### Type Checking

```bash
npm run build
```

This runs TypeScript compiler before building.

### Adding New Components

Components follow the structure:
- Place in appropriate folder (`components/chat`, `components/ui`, etc.)
- Use TypeScript with explicit types
- Follow naming conventions (PascalCase for components)

## API Integration

The frontend communicates with the backend via `/api/chat` endpoint.

**Request:**
```typescript
{
  sessionId: string;
  message: string;
  imageUrl?: string;
}
```

**Response:**
```typescript
{
  message: string;
  incidentType?: 'HUMAN' | 'FACILITY' | 'EMERGENCY';
  workflowState: WorkflowState;
  suggestedActions?: string[];
  resources?: string[];
  metadata?: Record<string, unknown>;
}
```

## Troubleshooting

### Port Already in Use

Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3000, // Change from 5173
}
```

### API Connection Issues

1. Ensure backend is running on `http://localhost:8080`
2. Check proxy configuration in `vite.config.ts`
3. Verify CORS settings in backend

### PWA Not Installing

1. Must be served over HTTPS (or localhost)
2. manifest.json must be valid
3. Service worker must register successfully
4. Check browser DevTools > Application > Manifest

## Next Steps

1. ✅ Core chat workflow implemented
2. ✅ Image upload integrated
3. ✅ Floor plan selector ready
4. ✅ PWA configured
5. ⏳ Add voice input (WebSpeech API)
6. ⏳ Add real floor plan images
7. ⏳ Implement backend image upload endpoint
8. ⏳ Add more comprehensive error handling
9. ⏳ Add loading states and animations

## License

Proprietary - SmartAllies
