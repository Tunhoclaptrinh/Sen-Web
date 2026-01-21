# SEN Web Application

> Hệ thống quản lý di sản văn hóa và game giáo dục - SEN (Sen Flower)

## 📋 Tổng Quan

SEN là một ứng dụng web kết hợp giữa hệ thống quản lý di sản văn hóa và game giáo dục tương tác, giúp người dùng khám phá và học tập về văn hóa Việt Nam một cách sinh động.

### Tính Năng Chính

- 🏛️ **Quản lý Di Sản**: Khám phá các di tích văn hóa và hiện vật lịch sử
- 🎮 **Game Tương Tác**: Chơi game theo chương với các màn chơi đa dạng
- 🤖 **AI Chat Assistant**: Trò chuyện với Sen AI - trợ lý AI thông minh tích hợp RAG, Vector Search, và Text-to-Speech
- 📚 **Bộ Sưu Tập**: Quản lý bộ sưu tập cá nhân
- 🏆 **Thành Tựu**: Hoàn thành nhiệm vụ và nhận phần thưởng
- 👤 **Nhân Vật Sen**: Mascot tương tác với animation mượt mà

## 🚀 Bắt Đầu

### 📦 Yêu Cầu Hệ Thống

**Cách 1: Docker (Khuyến Nghị)**

- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- Docker Compose v2+
- Git Bash hoặc WSL (cho Windows)

**Cách 2: Local Development**

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API đang chạy tại `http://localhost:3000`

---

### 🐳 Cách 1: Chạy Với Docker (Khuyến Nghị)

Docker giúp bạn chạy frontend **không cần cài đặt Node.js**.

#### Quick Start (Lần Đầu Chạy)

**Cách 1: Sử dụng Menu Tương Tác (Dễ nhất)**

```bash
# Clone repository
git clone https://github.com/Tunhoclaptrinh/Sen-Web.git
cd Sen-Web/Frontend

# Chạy menu tương tác
bash run.sh
```

Menu sẽ hiện ra:

```
==========================================
     SEN Frontend - Docker Runner
==========================================

  Select mode:

  [1] Build Images   (First time / Rebuild only)
  [2] Start Dev      (docker-compose up)
  [3] Start Prod     (docker-compose up -d)
  [4] View Logs
  [5] Stop All       (docker-compose down)
  [6] Exit

Select [1-6]:
```

**Lần đầu chạy:**

1. Gõ `bash run.sh`
2. Chọn **[1]** Build Images
3. Chọn **[2]** Start Dev
4. Browser tự động mở: `http://localhost:3001`

#### Tất Cả Lệnh Docker

```bash
# === MENU TƯƠNG TÁC ===
bash run.sh                # Hiện menu, chọn số [1-6]

# === CHẠY TRỰC TIẾP ===
bash run.sh build          # [1] Build Docker images
bash run.sh dev            # [2] Start dev server (Vite hot-reload)
bash run.sh prod           # [3] Start production (Nginx)
bash run.sh logs           # [4] View logs
bash run.sh down           # [5] Stop containers

# === TRỢ GIÚP ===
bash run.sh help           # Xem hướng dẫn
```

#### Docker Compose Modes

- **dev**: Development server với Vite hot-reload (port 3001)
- **prod**: Production build với Nginx (port 80)

#### Cấu Trúc Docker

```
Frontend/
├── Docker/
│   ├── Dev/
│   │   ├── docker-compose.yml    # Dev environment
│   │   └── Dockerfile            # Dev image with Vite
│   └── Production/
│       ├── docker-compose.yml    # Prod environment
│       ├── Dockerfile            # Multi-stage build
│       └── nginx.conf            # Nginx config
└── run.sh                         # Docker runner script
```

---

### 💻 Cách 2: Chạy Local (Không Dùng Docker)

#### Cài Đặt

```bash
# Clone repository
git clone https://github.com/Tunhoclaptrinh/Sen-Web.git
cd Sen-Web/Frontend

# Cài đặt dependencies
npm install

# Tạo file .env (optional)
nano .env
```

**Cấu hình .env (optional):**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

#### Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

#### Build Production

```bash
npm run build
```

Build output trong folder `dist/`

#### Preview Production Build

```bash
npm run preview
```

---

### 🛠️ Scripts NPM

| Command              | Mô tả                                     |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Chạy Vite development server (hot-reload) |
| `npm run build`      | Build production (TypeScript + Vite)      |
| `npm run preview`    | Preview production build locally          |
| `npm run lint`       | Lint code với ESLint                      |
| `npm run format`     | Format code với Prettier                  |
| `npm run type-check` | TypeScript type checking                  |
| `npm test`           | Chạy tests với Vitest                     |

---

## 📁 Cấu Trúc Thư Mục

```
sen-web/
├── public/                 # Static files
├── src/
│   ├── assets/            # Images, styles, fonts
│   │   ├── images/
│   │   │   ├── background/    # Background images
│   │   │   ├── character/     # Sen character sprites
│   │   │   └── logo.png
│   │   └── styles/
│   │       ├── global.css
│   │       └── antd-override.css
│   ├── components/        # React components
│   │   ├── common/           # Reusable components
│   │   │   ├── DataTable/
│   │   │   ├── FormModal/
│   │   │   ├── SearchBar/
│   │   │   ├── Loading/
│   │   │   ├── EmptyState/
│   │   │   ├── AIChatPanel/         # 🆕 AI Chat interface
│   │   │   ├── AIChatFloatingButton/ # 🆕 Floating chat button
│   │   │   └── guards/
│   │   ├── Background/       # Animated background
│   │   ├── SenCharacter/     # Sen mascot component
│   │   └── GlobalCharacterOverlay/
│   ├── config/            # Configuration files
│   │   ├── axios.config.ts   # API client config
│   │   ├── constants.ts      # App constants
│   │   └── env.config.js     # Environment config
│   ├── contexts/          # React contexts
│   │   └── GlobalCharacterContext.jsx
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useCRUD.js
│   │   ├── useDebounce.js
│   │   ├── useFetch.js
│   │   ├── useFilters.js
│   │   ├── usePagination.js
│   │   ├── useSearch.js
│   │   └── usePermission.js
│   ├── layouts/           # Layout components
│   │   ├── MainLayout/       # Public layout
│   │   ├── AdminLayout/      # Admin layout
│   │   └── AuthLayout/       # Auth layout
│   ├── pages/             # Page components
│   │   ├── Home/
│   │   ├── Auth/             # Login, Register
│   │   ├── Heritage/         # Heritage sites
│   │   ├── Artifact/         # Artifacts
│   │   ├── Profile/          # User profile
│   │   ├── Admin/            # Admin pages
│   │   ├── CharacterShowcase/ # Character demo
│   │   ├── AIChatDemo/       # 🆕 AI Chat demo page
│   │   └── NotFound/
│   ├── routes/            # Routing configuration
│   │   └── routes.config.tsx
│   ├── services/          # API services
│   │   ├── base.service.ts   # Base service class
│   │   ├── auth.service.js
│   │   ├── heritage.service.js
│   │   ├── artifact.service.js
│   │   ├── user.service.js
│   │   ├── collection.service.js
│   │   ├── ai.service.ts     # 🆕 AI Chat API service
│   │   └── favorite.service.js
│   ├── store/             # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── heritageSlice.js
│   │       ├── artifactSlice.js
│   │       ├── collectionSlice.js
│   │       ├── aiSlice.ts        # 🆕 AI Chat state management
│   │       └── uiSlice.js
│   ├── types/             # TypeScript types
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── heritage.types.ts
│   │   ├── artifact.types.ts
│   │   ├── api.types.ts
│   │   └── collection.types.ts
│   └── utils/             # Utility functions
│       ├── formatters.js
│       ├── helpers.js
│       └── validators.js
├── App.tsx                # Root component
├── main.jsx              # Entry point
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies
└── README.md             # This file
```

## 🛠️ Công Nghệ Sử Dụng

### Frontend Core

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing

### State Management

- **Redux Toolkit** - State management
- **React Redux** - React bindings

### UI Framework

- **Ant Design 5** - UI components
- **Ant Design Icons** - Icon library
- **Framer Motion** - Animations

### Graphics & Animation

- **PixiJS 7** - 2D rendering
- **@pixi/react** - React wrapper for PixiJS

### API & Data

- **Axios** - HTTP client
- **Day.js** - Date formatting

### Maps & Charts

- **Leaflet** - Maps
- **React Leaflet** - React wrapper
- **Recharts** - Charts

## 📦 Các Module Chính

### 1. Authentication System

- JWT-based authentication
- Multi-tab logout sync
- Auto token refresh
- Role-based access control (RBAC)

### 2. Heritage Management

- CRUD operations for heritage sites
- Advanced filtering & search
- Server-side pagination
- Image gallery
- Timeline events

### 3. Artifact Management

- Full CRUD with image upload
- Category management
- Condition tracking
- Related artifacts
- Reviews & ratings

### 4. AI Chat System

- **AIChatPanel**: Full-featured chat interface
  - Real-time messaging với Redux state management
  - Audio playback (base64 → HTMLAudioElement)
  - Message history với auto-scroll
  - Typing indicator & loading states
  - Minimize/maximize panel
  - Clear history
  - Keyboard shortcuts (Enter: send, Shift+Enter: new line)
  
- **AIChatFloatingButton**: Global floating button
  - Badge hiển thị unread count
  - Tooltip & hover effects
  - Typing indicator animation
  - Context-aware (level, artifact, heritage)

- **Redux Integration**:
  - `aiSlice`: State management (chatHistory, currentCharacter, isTyping, error)
  - `ai.service.ts`: API calls tới Backend `/api/ai/chat`
  - Thunks: `sendChatMessage`, `fetchChatHistory`, `clearChatHistory`

- **Backend Integration**:
  - Backend Express (`ai.controller.js`) proxy tới Sen_AI FastAPI
  - Sen_AI RAG pipeline: Reflection → Routing → Vector Search → Reranking → GPT-4o-mini → gTTS
  - Response: `{answer, audio_base64, route, score, context_used}`
  - Saves to `db.json` for persistence

### 5. Game System
- **Sequential Chapters**
- **Purchase Mechanism**
- **Interactive Gameplay**
- **AI Assistant**
- **Character Collection**
- **Achievement System**

### 5. User Collections

- Personal collections
- Favorites management
- Public/private collections
- Share functionality

### 6. Admin CMS

- User management
- Content management
- Statistics dashboard
- Import/Export tools

## 🎨 Tính Năng Đặc Biệt

### 🤖 Sen AI Chat Assistant (NEW)

**Trò chuyện thông minh với AI tích hợp RAG Pipeline**

Sen AI là trợ lý thông minh giúp người dùng tìm hiểu về di sản văn hóa Việt Nam qua chat tự nhiên. Hệ thống kết hợp nhiều công nghệ AI tiên tiến:

#### 🔧 Công Nghệ

- **RAG (Retrieval Augmented Generation)**: Tìm kiếm thông tin chính xác từ database
- **Vector Search**: MongoDB Vector Search với embeddings
- **Semantic Routing**: Định tuyến câu hỏi thông minh (general/heritage-specific)
- **Reranking**: Sắp xếp lại kết quả tìm kiếm để chọn context tốt nhất
- **GPT-4o-mini**: Generate câu trả lời tự nhiên
- **Text-to-Speech**: Phát âm thanh tiếng Việt với gTTS

#### 🎯 Tính Năng

- ✅ Chat real-time với typing indicator
- ✅ Phát audio câu trả lời (play/pause)
- ✅ Lịch sử hội thoại tự động lưu
- ✅ Context-aware (level, artifact, heritage site)
- ✅ Responsive design (desktop & mobile)
- ✅ Keyboard shortcuts (Enter/Shift+Enter)
- ✅ Minimize/maximize panel
- ✅ Clear history

#### 🚀 Sử Dụng Nhanh

**Thêm vào bất kỳ trang nào:**

```tsx
import { AIChatFloatingButton } from '@/components/common';

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <AIChatFloatingButton />
    </div>
  );
}
```

**Sử dụng với context (nâng cao):**

```tsx
// Trong trang Game
<AIChatFloatingButton 
  context={{ level_id: currentLevel.id }} 
/>

// Trong trang Artifact
<AIChatFloatingButton 
  context={{ artifact_id: artifact.id }} 
/>

// Trong trang Heritage
<AIChatFloatingButton 
  context={{ heritage_site_id: site.id }} 
/>
```

#### 📁 Components

**1. AIChatFloatingButton** (`src/components/common/AIChatFloatingButton/`)
- Floating button mở chat panel
- Badge hiển thị số tin nhắn chưa đọc
- Typing indicator khi AI đang trả lời

**2. AIChatPanel** (`src/components/common/AIChatPanel/`)
- Giao diện chat đầy đủ
- Bubble messages (user/assistant)
- Audio playback controls
- Auto-scroll, minimize, clear history

#### 🔄 Architecture Flow

```
Frontend (React + Redux)
    ↓
    POST /api/ai/chat {message, context}
    ↓
Backend (Express - Port 3000)
    ↓
    POST localhost:8000/process_query
    ↓
Sen_AI (FastAPI - Port 8000)
    ↓
    RAG Pipeline:
    1. Query Reflection (cải thiện câu hỏi)
    2. Semantic Routing (general/heritage)
    3. Vector Search (MongoDB)
    4. Reranking (chọn context tốt nhất)
    5. GPT-4o-mini (generate answer)
    6. gTTS (text-to-speech)
    ↓
    Response: {answer, audio_base64, route, score}
    ↓
Backend lưu db.json
    ↓
Frontend hiển thị + phát audio
```

#### 📋 API Format

**Request tới Backend:**
```json
{
  "message": "Múa rối nước là gì?",
  "context": {
    "characterId": 1,
    "levelId": 5,
    "artifactId": 10
  }
}
```

**Response từ Backend:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_123",
      "content": "Múa rối nước là loại hình nghệ thuật...",
      "audio": "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0...",
      "sender": "assistant",
      "timestamp": "2025-01-10T10:30:00Z"
    },
    "character": {
      "id": 1,
      "name": "Minh",
      "avatar": "/api/uploads/minh.png"
    }
  }
}
```

#### 🧪 Testing

**1. Khởi động các services:**

```bash
# Terminal 1: Sen_AI
cd Sen_AI
source venv/bin/activate
python app_fastapi.py
# → http://localhost:8000

# Terminal 2: Backend
cd Backend
npm run dev
# → http://localhost:3000

# Terminal 3: Frontend
cd Frontend
npm run dev
# → http://localhost:5173
```

**2. Test health endpoints:**

```bash
# Sen_AI health
curl http://localhost:8000/health
# → {"status": "healthy", "service": "sen-ai"}

# Backend API
curl http://localhost:3000/api
# → API info

# Test chat trực tiếp
curl -X POST http://localhost:8000/process_query \
  -H "Content-Type: application/json" \
  -d '{"query": "Múa rối nước là gì?"}'
```

**3. Test trên Frontend:**
- Mở http://localhost:5173
- Click nút chat floating (góc phải dưới)
- Gửi câu hỏi: "Múa rối nước là gì?"
- Kiểm tra:
  - ✅ Tin nhắn hiển thị
  - ✅ AI trả lời sau vài giây
  - ✅ Nút audio hiện ra → click phát âm thanh
  - ✅ Lịch sử được lưu (reload vẫn còn)

#### 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Chat không gửi được | Kiểm tra Backend đang chạy: `curl http://localhost:3000/api` |
| AI không trả lời | Kiểm tra Sen_AI: `curl http://localhost:8000/health` |
| Audio không phát | Browser chặn autoplay - click nút play thủ công |
| Lỗi CORS | Kiểm tra Backend CORS config cho port 5173 |

#### ⚙️ Configuration

**Backend** (`Backend/.env`):
```env
PYTHON_SERVICE_URL=http://localhost:8000/process_query
```

**Frontend** (`Frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Sen_AI** (`Sen_AI/.env`):
```env
OPENAI_API_KEY=your_openai_key
MONGODB_URI=your_mongodb_uri
```

#### 🎓 Demo Page

Demo page đầy đủ tại: `/ai-demo` (cần thêm route trong `routes.config.tsx`)

```tsx
import AIChatDemoPage from '@/pages/AIChatDemo';

// Thêm vào routes
{
  path: '/ai-demo',
  element: <AIChatDemoPage />
}
```

#### 🔮 Future Enhancements

- 🎤 Voice input (speech-to-text)
- 🖼️ Image upload & analysis
- 🌐 Multi-language support
- 💬 Quick reply suggestions
- 📊 Conversation analytics
- 🔄 Export/share conversations

---

### Sen Character Mascot

- Fully animated 2D character
- Customizable accessories
- Talking animation
- Drag & drop positioning
- Breathing & idle animations
- Multiple expressions

### Background System

- Animated traditional elements
- Layered composition
- Smooth transitions
- Customizable themes

### Advanced Components

- **DataTable**: Server-side pagination, sorting, filtering
- **FormModal**: Reusable CRUD forms
- **SearchBar**: Advanced search with filters
- **LoadingState**: Multiple loading variants
- **EmptyState**: Customizable empty states

## 🔐 Authentication Flow

```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Token stored in localStorage: sen_token
// User data stored in localStorage: sen_user
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: xs (480px), sm (768px), md (1024px), lg (1200px)
- Touch-friendly UI
- Optimized performance

## 🧪 Testing

```bash
# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## � Production Deployment (Vercel)

### Quick Deploy

```bash
cd Frontend

# Option 1: CLI
npm i -g vercel
vercel

# Option 2: GitHub (KHUYẾN NGHỊ)
# 1. Push to GitHub
# 2. Import to Vercel
# 3. Auto deploy on every push
```

### Environment Variables

Thêm trong **Vercel Dashboard → Settings → Environment Variables**:

```env
VITE_API_BASE_URL=https://sen-backend-xxx.railway.app/api
VITE_API_TIMEOUT=30000
```

### Files Used

Vercel tự động:
- `vercel.json` → Rewrite rules (SPA routing)
- `package.json` → Build command: `npm run build`
- Build output: `dist/`

### Verify Deployment

```bash
# Vercel sẽ cho URL
https://sen-frontend-xxx.vercel.app

# Test trong browser
```

### Auto Deploy from GitHub

1. Push code lên GitHub
2. Import project to Vercel
3. Mỗi lần push → Auto deploy
4. Preview deployments for PRs

### Features

Vercel cung cấp:
- **Global CDN**: Fast worldwide
- **Auto HTTPS**: Free SSL
- **Preview Deploys**: Test PRs before merge
- **Analytics**: Web vitals tracking

**Cost**: FREE (unlimited bandwidth & deployments)

---

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error**

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Update VITE_API_BASE_URL in .env
```

**2. Build Errors**

```bash
# Clear cache
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf .vite
```

**3. TypeScript Errors**

```bash
# Regenerate types
npm run type-check
```

## 📚 API Documentation

Full API documentation: [API_ENDPOINTS.md](./API_ENDPOINTS.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Development Team**: Sen Development Team
- **Contact**: support@sen-game.com
- **GitHub**: [Tunhoclaptrinh](https://github.com/Tunhoclaptrinh)

## 📞 Support

- 📧 Email: support@sen.com
- 🐛 Issues: [GitHub Issues](https://github.com/Tunhoclaptrinh/Sen-Web/issues)
- 📖 Docs: [Documentation](https://docs.sen-game.com)

---

**Version**: 2.0.0  
**Last Updated**: January 10, 2026  
**Status**: Production Ready

**New in v2.0.0**:
- 🤖 AI Chat Assistant với RAG Pipeline
- 🎵 Text-to-Speech tiếng Việt
- 📱 Responsive chat interface
- 🔄 Real-time messaging với Redux

