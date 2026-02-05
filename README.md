# SleekTools

> **Instant micro-tools for daily quick tasks** — Fast, private, and beautiful tools that work instantly in your browser.

![SleekTools Banner](https://via.placeholder.com/800x200/0f172a/0ea5e9?text=SleekTools)

## ✨ Features

- 🚀 **Instant** — No sign-ups, no waiting, just tools
- 🔒 **Private** — Client-side processing, no data collection
- 🎨 **Beautiful** — Clean, modern UI with dark mode
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- ⚡ **Fast** — Optimized for speed with lazy loading
- 🔌 **Modular** — Easily extensible plugin architecture

## 🛠️ Available Tools

### Phase 1 (MVP)
- **JSON Formatter** — Format, validate, and beautify JSON
- **Image Crop & Compress** — Crop, resize, and compress images
- **Quick Chat** — Create instant, private chat rooms

### Phase 2 (Coming Soon)
- QR Generator
- Markdown Preview
- Split Bill Calculator
- Pomodoro Timer
- Base64 Encoder
- Regex Tester
- Diff Checker
- Color Picker
- URL Encoder

## 🏗️ Architecture

```
sleektools/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # Shared UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── styles/        # Global styles
│   │   ├── tools/         # Individual tool modules
│   │   │   ├── json/
│   │   │   ├── crop/
│   │   │   └── chat/
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── tool-registry.js
│   └── ...
│
└── backend/           # Spring Boot
    └── src/main/java/com/sleektools/
        ├── config/        # Configuration classes
        ├── controller/    # REST controllers
        ├── exception/     # Exception handling
        ├── modules/       # Feature modules
        │   └── chat/
        └── scheduler/     # Scheduled tasks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws/chat
```

## 🔧 Adding a New Tool

1. **Create tool folder:**
   ```
   src/tools/your-tool/
   ├── index.jsx      # Main component
   └── config.js      # Tool configuration
   ```

2. **Define configuration:**
   ```javascript
   // config.js
   export default {
     id: 'your-tool',
     name: 'Your Tool',
     description: 'Tool description',
     category: 'Category',
     tags: ['tag1', 'tag2'],
     clientSide: true,
   }
   ```

3. **Register in tool-registry.js:**
   ```javascript
   {
     id: 'your-tool',
     name: 'Your Tool',
     description: 'Tool description',
     icon: YourIcon,
     path: '/tools/your-tool',
     component: lazy(() => import('./tools/your-tool')),
     category: 'Category',
     tags: ['tag1', 'tag2'],
     status: 'active',
     clientSide: true,
   }
   ```

That's it! The tool will automatically appear on the homepage and have its route configured.

## 📦 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Frontend (Netlify)

```bash
# Build command
npm run build

# Publish directory
dist
```

### Backend (Docker)

```dockerfile
# Dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# Build and run
docker build -t sleektools-backend .
docker run -p 8080:8080 sleektools-backend
```

### Backend (Railway/Render)

1. Connect GitHub repository
2. Set build command: `mvn clean install -DskipTests`
3. Set start command: `java -jar target/sleektools-backend-1.0.0.jar`
4. Configure environment variables

## 📡 API Endpoints

### Health Check
```
GET /api/health
GET /api/info
```

### Rooms
```
POST   /api/rooms              # Create room
GET    /api/rooms/:id          # Get room info
GET    /api/rooms/:id/exists   # Check if room exists
POST   /api/rooms/:id/validate-pin
GET    /api/rooms/:id/participants
GET    /api/rooms/stats
```

### WebSocket
```
ws://localhost:8080/ws/chat/{roomId}
```

## 🎨 Design System

### Colors
- Primary: `#0ea5e9` (Sky Blue)
- Background: `#0f172a` (Dark Slate)
- Surface: `#1e293b` (Slate)

### Typography
- Font: Inter, system-ui
- Mono: JetBrains Mono

### Components
- Buttons: `btn-primary`, `btn-secondary`, `btn-ghost`
- Cards: `glass-card`, `tool-card`
- Inputs: `input`, `input-mono`, `code-editor`
- Badges: `badge-success`, `badge-error`, `badge-warning`, `badge-info`

## 🔒 Security & Privacy

- No user accounts or authentication required
- No permanent data storage
- Client-side processing when possible
- Rooms auto-expire after 6 hours
- Optional PIN protection for chat rooms
- No analytics or tracking

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- Create an issue for bug reports
- Start a discussion for feature requests

---

Built with ❤️ for the web
