# SEN Web Application

> Hệ thống quản lý di sản văn hóa và game giáo dục - SEN (Sen Flower)

## 📋 Tổng Quan

SEN là một ứng dụng web kết hợp giữa hệ thống quản lý di sản văn hóa và game giáo dục tương tác, giúp người dùng khám phá và học tập về văn hóa Việt Nam một cách sinh động.

### Tính Năng Chính

- 🏛️ **Quản lý Di Sản**: Khám phá các di tích văn hóa và hiện vật lịch sử
- 🎮 **Game Tương Tác**: Chơi game theo chương với các màn chơi đa dạng
- 🤖 **AI Assistant**: Tương tác với trợ lý AI để học tập
- 📚 **Bộ Sưu Tập**: Quản lý bộ sưu tập cá nhân
- 🏆 **Thành Tựu**: Hoàn thành nhiệm vụ và nhận phần thưởng
- 👤 **Nhân Vật Sen**: Mascot tương tác với animation mượt mà

## 🚀 Bắt Đầu

### Yêu Cầu Hệ Thống

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API đang chạy tại `http://localhost:3000`

### Cài Đặt

```bash
# Clone repository
git clone https://github.com/Tunhoclaptrinh/Sen-Web.git
cd Sen-Web

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

### Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

### Build Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

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
│   │   └── favorite.service.js
│   ├── store/             # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── heritageSlice.js
│   │       ├── artifactSlice.js
│   │       ├── collectionSlice.js
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

### 4. Game System (Coming Soon)

- Chapter-based progression
- Multiple level types
- AI assistant integration
- Character collection
- Achievement system

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

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Docker

```bash
# Build image
docker build -t sen-web .

# Run container
docker run -p 3001:3001 sen-web
```

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

- 📧 Email: support@sen-game.com
- 🐛 Issues: [GitHub Issues](https://github.com/Tunhoclaptrinh/Sen-Web/issues)
- 📖 Docs: [Documentation](https://docs.sen-game.com)

---

**Version**: 2.0.0  
**Last Updated**: December 31, 2025  
**Status**: Production Ready
