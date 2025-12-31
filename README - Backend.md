# 🏛️ SEN Backend - Game Giáo Dục Văn Hóa Việt Nam

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production%20ready-success.svg)

**Backend API cho game giáo dục tương tác khám phá lịch sử và văn hóa Việt Nam**

[Tính Năng](#-tính-năng-chính) • [Cài Đặt](#-cài-đặt--chạy) • [API Docs](#-api-documentation) • [Kiến Trúc](#-kiến-trúc-hệ-thống) • [Contributing](#-contributing)

</div>

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Công Nghệ](#-công-nghệ)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt & Chạy](#-cài-đặt--chạy)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Game System](#-game-system)
- [AI Assistant](#-ai-assistant)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [Changelog](#-changelog)
- [Support](#-support)
- [License](#-license)

---

## 🎯 Giới Thiệu

**SEN** (Sen - Hoa Văn Hóa Việt Nam) là một hệ thống backend hiện đại được xây dựng bằng Node.js và Express.js, cung cấp API cho game giáo dục tương tác nhằm giúp người chơi khám phá và học hỏi về lịch sử, văn hóa Việt Nam thông qua trải nghiệm game hóa (gamification).

### 🌟 Điểm Nổi Bật

- 🎮 **Screen-based Gameplay**: Hệ thống màn chơi đa dạng với nhiều loại tương tác
- 🤖 **AI Chatbot**: Trợ lý AI thông minh với nhân vật lịch sử Việt Nam
- 🌸 **Sen Flower System**: Cơ chế cánh hoa sen độc đáo để mở khóa nội dung
- 🏛️ **Digital Museum**: Bảo tàng số hóa cá nhân với artifacts đã thu thập
- 📱 **QR Code Scanning**: Tích hợp AR tại các di tích thực tế
- 🎓 **Full Gamification**: Badges, achievements, leaderboard, rewards
- 🔐 **Secure Authentication**: JWT-based với RBAC (Role-Based Access Control)
- 📊 **Advanced CMS**: Hệ thống quản trị nội dung mạnh mẽ cho admin

---

## ✨ Tính Năng Chính

### 1. 🏛️ Quản Lý Di Sản Văn Hóa

- **Heritage Sites Management**
  - Tìm kiếm di tích gần bạn (GPS-based search)
  - Thông tin chi tiết về di tích lịch sử
  - Timeline các sự kiện quan trọng
  - Đánh giá và bình luận
  
- **Artifacts & Collections**
  - Khám phá hiện vật lịch sử
  - Tạo bộ sưu tập cá nhân
  - Phân loại theo thời kỳ, khu vực
  - Tìm kiếm và lọc nâng cao

- **Exhibitions**
  - Triển lãm trực tuyến
  - Triển lãm tạm thời và thường trực
  - Tương tác đa phương tiện

### 2. 🎮 Game System (Unified Architecture)

- **Chapter System (Sen Flower Layers)**
  - 3 lớp cánh hoa sen tượng trưng cho 3 chương game
  - Chapter 1: Sen Hồng - Ký Ức Đầu Tiên (Cội Nguồn)
  - Chapter 2: Sen Vàng - Thời Hoàng Kim (Giao Thoa)
  - Chapter 3: Sen Trắng - Di Sản Bất Tử (Vươn Xa)

- **Level System (Screen-based)**
  - Màn chơi với nhiều screens tuần tự
  - 6 loại screen: DIALOGUE, HIDDEN_OBJECT, QUIZ, TIMELINE, IMAGE_VIEWER, VIDEO
  - Navigation linh hoạt giữa các screens
  - Checkpoint và save progress

- **AI Characters**
  - NPCs lịch sử Việt Nam (Chú Tễu, Thị Kính, Thánh Gióng...)
  - 2 trạng thái: Mất trí nhớ ↔ Hồi phục
  - Context-aware conversations
  - Personality-driven responses

- **Rewards & Progression**
  - Cánh hoa sen (petals) để mở khóa chapters
  - Sen coins để mua items
  - Experience points và leveling
  - Unlock characters và museum items

- **Museum System**
  - Bảo tàng cá nhân với artifacts thu thập
  - Thu nhập thụ động từ museum
  - Upgrade và mở rộng

- **Badges & Achievements**
  - 50+ badges có thể đạt được
  - Achievement tracking
  - Milestone rewards

- **Leaderboard**
  - Weekly, monthly, all-time rankings
  - Multiple categories (levels, collections, badges)

### 3. 🤖 AI Assistant System

- **Context-Aware Chatbot**
  - Chat theo ngữ cảnh level đang chơi
  - Hiểu biết về artifacts và heritage sites
  - Cung cấp hints và giải thích

- **AI Character Personas**
  - Mỗi character có personality riêng
  - Chuyển đổi persona theo progress
  - Duy trì conversation history

- **Knowledge Integration**
  - Knowledge base từ level content
  - Dynamic response generation
  - Educational guidance

### 4. 🎓 Learning & Quests

- **Learning Paths**
  - Structured learning modules
  - Progress tracking
  - Quizzes and assessments

- **Quest System**
  - Daily, weekly quests
  - Achievement-based quests
  - Exploration quests
  - Rewards and completion tracking

### 5. 👥 User Management

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Customer)
  - Secure password hashing (bcrypt)
  - Session management

- **User Profiles**
  - Personal information
  - Avatar upload
  - Address management
  - Preferences and settings

- **Social Features**
  - Favorites system (artifacts, sites, exhibitions)
  - Reviews and ratings
  - Collections sharing
  - Notifications

### 6. 🎨 Admin CMS (Content Management System)

- **Level CMS**
  - Visual level editor
  - Screen templates
  - Drag-and-drop screen ordering
  - Preview and validation
  - Clone and bulk import
  - Export to JSON/XLSX

- **Chapter Management**
  - Create and edit chapters
  - Order and organize levels
  - Set unlock requirements
  - Reward configuration

- **Character Management**
  - Create AI characters
  - Define personas (amnesia & restored)
  - Upload avatars
  - Configure dialogue patterns

- **Asset Management**
  - Upload images, videos, audio
  - Organize media library
  - Usage tracking
  - Bulk operations

### 7. 📤 Import/Export

- **Data Import**
  - XLSX spreadsheet import
  - JSON bulk import
  - Validation and error reporting
  - Preview before import

- **Data Export**
  - Export to XLSX
  - Export to JSON
  - Export to CSV
  - Filtered exports

### 8. 📱 QR Code Scanning

- **AR Integration**
  - Scan QR codes at real heritage sites
  - Unlock bonus content
  - Special rewards
  - Check-in tracking

---

## 🛠️ Công Nghệ

### Core Technologies

| Category              | Technology                          | Version | Purpose                          |
| --------------------- | ----------------------------------- | ------- | -------------------------------- |
| **Runtime**           | Node.js                             | 18+     | Server runtime                   |
| **Framework**         | Express.js                          | 4.18.2  | Web framework                    |
| **Authentication**    | jsonwebtoken                        | 9.0.2   | JWT authentication               |
| **Password Hashing**  | bcryptjs                            | 2.4.3   | Secure password storage          |
| **Validation**        | express-validator                   | 7.0.1   | Request validation               |
| **File Upload**       | multer                              | 2.0.2   | Multipart form data handling     |
| **Image Processing**  | sharp                               | 0.34.5  | Image optimization               |
| **Excel Import**      | xlsx                                | 0.18.5  | Excel file processing            |
| **CSV Export**        | json2csv                            | 6.0.0   | CSV generation                   |
| **UUID Generator**    | uuid                                | 9.0.1   | Unique ID generation             |
| **Environment**       | dotenv                              | 16.3.1  | Environment variables            |
| **CORS**              | cors                                | 2.8.5   | Cross-origin resource sharing    |
| **Dev Tool**          | nodemon                             | 3.0.1   | Auto-restart development server  |

### Database

- **Development:** JSON File Storage (`database/db.json`)
- **Production (Planned):** MongoDB / PostgreSQL
- **Abstraction Layer:** Custom Database class with advanced querying

### Architecture Pattern

- **MVC + Service Layer**
  - Models: JSON schemas with validation
  - Views: JSON API responses
  - Controllers: HTTP request handlers
  - Services: Business logic layer
  - Middleware: Authentication, validation, query parsing

---

## 📦 Yêu Cầu Hệ Thống

### Minimum Requirements

```
Node.js: >= 18.0.0
NPM: >= 9.0.0
RAM: 512MB
Storage: 100MB
```

### Recommended

```
Node.js: >= 20.0.0
NPM: >= 10.0.0
RAM: 2GB
Storage: 500MB
```

### Operating System

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+, Debian 10+, CentOS 8+)

---

## 🚀 Cài Đặt & Chạy

### Bước 1: Clone Repository

```bash
git clone https://github.com/Tunhoclaptrinh/Sen-Web.git
cd Sen-Web/backend
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

### Bước 3: Cấu Hình Environment

```bash
# Copy file example
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
nano .env
```

### Bước 4: Seed Database (Optional)

```bash
# Tạo dữ liệu mẫu
npm run seed
```

### Bước 5: Chạy Server

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

Server sẽ chạy tại: **`http://localhost:3000`**

### Bước 6: Kiểm Tra Health Check

```bash
# Sử dụng curl
curl http://localhost:3000/api/health

# Hoặc trình duyệt
# Truy cập: http://localhost:3000/api
```

Kết quả mong đợi:

```json
{
  "status": "OK",
  "message": "Sen API is running"
}
```

---

## 📁 Cấu Trúc Dự Án

```
sen-backend/
│
├── 📁 config/                          # Configuration Files
│   ├── database.js                     # Database abstraction & CRUD
│   └── endpoints.js                    # API endpoints reference
│
├── 📁 controllers/                     # HTTP Request Handlers
│   ├── auth.controller.js              # Authentication
│   ├── user.controller.js              # User management
│   ├── heritage_site.controller.js     # Heritage sites
│   ├── artifact.controller.js          # Artifacts
│   ├── category.controller.js          # Categories
│   ├── exhibition.controller.js        # Exhibitions
│   ├── collection.controller.js        # Personal collections
│   ├── favorite.controller.js          # Favorites (unified)
│   ├── review.controller.js            # Reviews & ratings
│   ├── game.controller.js              # Game system (unified)
│   ├── ai.controller.js                # AI assistant
│   ├── learning.controller.js          # Learning modules
│   ├── quest.controller.js             # Quest system
│   ├── notification.controller.js      # Notifications
│   ├── upload.controller.js            # File uploads
│   ├── timeline.controller.js          # Timeline events
│   ├── address.controller.js           # Address management
│   ├── cultural_category.controller.js # Cultural categories
│   ├── importExport.controller.js      # Import/Export
│   ├── level_cms.controller.js         # Level CMS (Admin)
│   ├── chapter_cms.controller.js       # Chapter CMS (Admin)
│   ├── character_cms.controller.js     # Character CMS (Admin)
│   └── asset_cms.controller.js         # Asset CMS (Admin)
│
├── 📁 middleware/                      # Express Middleware
│   ├── auth.middleware.js              # JWT validation, protect routes
│   ├── rbac.middleware.js              # Role-based access control
│   ├── query.middleware.js             # Query parsing (JSON Server style)
│   ├── validation.middleware.js        # Schema validation
│   └── logger.middleware.js            # Request logging
│
├── 📁 routes/                          # Express Routes
│   ├── index.js                        # Route aggregator
│   ├── auth.routes.js                  # Authentication endpoints
│   ├── user.routes.js                  # User management
│   ├── heritage_site.routes.js         # Heritage sites
│   ├── artifact.routes.js              # Artifacts
│   ├── category.routes.js              # Categories
│   ├── exhibition.routes.js            # Exhibitions
│   ├── collection.routes.js            # Collections
│   ├── favorite.routes.js              # Favorites (unified)
│   ├── review.routes.js                # Reviews
│   ├── game.routes.js                  # Game system (unified)
│   ├── ai.routes.js                    # AI assistant
│   ├── learning.routes.js              # Learning paths
│   ├── quest.routes.js                 # Quest system
│   ├── notification.routes.js          # Notifications
│   ├── upload.routes.js                # Upload endpoints
│   │
│   └── 📁 admin/                       # Admin Routes
│       ├── index.js                    # Admin route aggregator
│       ├── level.routes.js             # Level CMS
│       ├── chapter.routes.js           # Chapter CMS
│       ├── character.routes.js         # Character CMS
│       └── asset.routes.js             # Asset CMS
│
├── 📁 services/                        # Business Logic Layer
│   ├── user.service.js                 # User logic
│   ├── heritage_site.service.js        # Heritage sites logic
│   ├── artifact.service.js             # Artifacts logic
│   ├── category.service.js             # Categories logic
│   ├── exhibition.service.js           # Exhibitions logic
│   ├── favorite.service.js             # Favorites logic
│   ├── review.service.js               # Reviews logic
│   ├── game.service.js                 # Game logic (unified)
│   ├── ai.service.js                   # AI assistant logic
│   ├── learning.service.js             # Learning logic
│   ├── quest.service.js                # Quest logic
│   ├── notification.service.js         # Notifications logic
│   ├── upload.service.js               # File upload logic
│   ├── timeline.service.js             # Timeline logic
│   ├── address.service.js              # Address logic
│   ├── promotion.service.js            # Promotions logic
│   ├── importExport.service.js         # Import/Export logic
│   ├── level_cms.service.js            # Level CMS logic
│   ├── chapter_cms.service.js          # Chapter CMS logic
│   ├── character_cms.service.js        # Character CMS logic
│   └── asset_cms.service.js            # Asset CMS logic
│
├── 📁 schemas/                         # Data Validation Schemas
│   ├── index.js                        # Schema aggregator
│   ├── user.schema.js                  # User validation
│   ├── heritage_site.schema.js         # Heritage site schema
│   ├── artifact.schema.js              # Artifact schema
│   ├── category.schema.js              # Category schema
│   ├── cultural_category.schema.js     # Cultural category schema
│   ├── exhibition.schema.js            # Exhibition schema
│   ├── collection.schema.js            # Collection schema
│   ├── favorite.schema.js              # Favorite schema
│   ├── review.schema.js                # Review schema
│   ├── timeline.schema.js              # Timeline schema
│   ├── notification.schema.js          # Notification schema
│   ├── address.schema.js               # Address schema
│   ├── scan_object.schema.js           # Scan object schema
│   ├── shop_item.schema.js             # Shop item schema
│   ├── game_chapter.schema.js          # Chapter schema
│   ├── game_level.schema.js            # Level schema
│   ├── game_character.schema.js        # Character schema
│   └── game_progress.schema.js         # Progress schema
│
├── 📁 utils/                           # Utility Functions
│   ├── helpers.js                      # JWT, password, distance calc
│   └── constants.js                    # Application constants
│
├── 📁 database/                        # Data Storage
│   ├── db.json                         # Main database (Development)
│   ├── db.json.backup                  # Database backup
│   └── 📁 uploads/                     # Uploaded files
│       ├── avatars/
│       ├── artifacts/
│       └── heritage-sites/
│
├── 📁 docs/                            # Documentation
│   ├── API_ENDPOINTS.md                # Complete API documentation
│   ├── ARCHITECTURE.md                 # System architecture
│   ├── GAME_SYSTEM_README.md           # Game system guide
│   ├── CONTRIBUTING.md                 # Contribution guidelines
│   ├── POC_PLAN.md                     # Proof of concept plan
│   └── Sample Level Data.md            # Level creation examples
│
├── 📄 server.js                        # Express server entry point
├── 📄 package.json                     # Dependencies & scripts
├── 📄 package-lock.json                # Locked dependencies
├── 📄 .env.example                     # Environment variables template
├── 📄 .gitignore                       # Git ignore rules
└── 📄 README.md                        # This file
```

---

## 📖 API Documentation

### Base URL

```
Development: http://localhost:3000/api
Production: https://api.sen.vn/api
```

### Standard Response Format

#### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* resource or array */ },
  "pagination": { /* if applicable */ }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ],
  "statusCode": 400
}
```

#### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Response Headers:**

```
Content-Type: application/json
X-Total-Count: 150
Link: <http://api.sen.vn/api/artifacts?_page=2&_limit=20>; rel="next",
      <http://api.sen.vn/api/artifacts?_page=8&_limit=20>; rel="last"
```

### Query Parameters (JSON Server Style)

Our API supports powerful query parameters for filtering, searching, sorting, and pagination:

#### 🔍 Pagination

| Parameter | Type     | Default | Description                    | Example                        |
|-----------|----------|---------|--------------------------------|--------------------------------|
| `_page`   | integer  | 1       | Page number (1-based)          | `?_page=2`                     |
| `_limit`  | integer  | 10      | Items per page (max 100)       | `?_limit=20`                   |
| `_start`  | integer  | 0       | Starting index (alternative)   | `?_start=20&_limit=10`         |
| `_end`    | integer  | -       | Ending index (alternative)     | `?_start=0&_end=20`            |

**Examples:**

```bash
# Get page 2 with 20 items per page
GET /api/artifacts?_page=2&_limit=20

# Get items 20-40
GET /api/artifacts?_start=20&_end=40

# Get first 50 items
GET /api/artifacts?_limit=50
```

#### 🔎 Full-Text Search

| Parameter | Type   | Description                           | Example                    |
|-----------|--------|---------------------------------------|----------------------------|
| `q`       | string | Search across all text fields         | `?q=pottery`               |

**Examples:**

```bash
# Search for "pottery" in all fields
GET /api/artifacts?q=pottery

# Search for "Hội An"
GET /api/heritage-sites?q=Hội%20An

# Search with pagination
GET /api/artifacts?q=ancient&_page=1&_limit=10
```

#### 🔧 Filtering

**Exact Match:**

```bash
# Filter by exact value
GET /api/artifacts?category=pottery
GET /api/reviews?rating=5
GET /api/users?role=admin
```

**Operators:**

| Operator  | Description              | Example                              |
|-----------|--------------------------|--------------------------------------|
| `_gte`    | Greater than or equal    | `?rating_gte=4`                      |
| `_lte`    | Less than or equal       | `?price_lte=1000`                    |
| `_gt`     | Greater than             | `?views_gt=100`                      |
| `_lt`     | Less than                | `?age_lt=30`                         |
| `_ne`     | Not equal                | `?status_ne=deleted`                 |
| `_like`   | Contains (case-insensitive) | `?name_like=ancient`              |
| `_in`     | In array                 | `?category_in=pottery,sculpture`     |

**Examples:**

```bash
# Artifacts with rating >= 4
GET /api/artifacts?rating_gte=4

# Heritage sites with name containing "Hội"
GET /api/heritage-sites?name_like=Hội

# Reviews with rating between 3 and 5
GET /api/reviews?rating_gte=3&rating_lte=5

# Artifacts in multiple categories
GET /api/artifacts?category_in=pottery,sculpture,painting

# Users excluding deleted status
GET /api/users?status_ne=deleted

# Levels with difficulty less than 5
GET /api/game/levels?difficulty_lt=5
```

#### 📊 Sorting

| Parameter | Type   | Description                      | Example                    |
|-----------|--------|----------------------------------|----------------------------|
| `_sort`   | string | Field name to sort by            | `?_sort=name`              |
| `_order`  | string | Sort order: `asc` or `desc`      | `?_order=desc`             |

**Examples:**

```bash
# Sort by name ascending (A-Z)
GET /api/artifacts?_sort=name&_order=asc

# Sort by rating descending (highest first)
GET /api/artifacts?_sort=rating&_order=desc

# Sort by created date (newest first)
GET /api/reviews?_sort=created_at&_order=desc

# Multiple sort (not directly supported, use comma)
GET /api/artifacts?_sort=category,rating&_order=asc,desc
```

#### 🔗 Relations (Embed/Expand)

| Parameter | Type   | Description                           | Example                    |
|-----------|--------|---------------------------------------|----------------------------|
| `_embed`  | string | Include child resources               | `?_embed=artifacts`        |
| `_expand` | string | Include parent resource               | `?_expand=heritage_site`   |

**Examples:**

```bash
# Get heritage site with embedded artifacts
GET /api/heritage-sites/1?_embed=artifacts

# Get artifact with expanded heritage site info
GET /api/artifacts/1?_expand=heritage_site

# Multiple embeds
GET /api/heritage-sites/1?_embed=artifacts,reviews,timelines

# Combination of embed and expand
GET /api/artifacts?_expand=category&_embed=reviews
```

#### 📌 Field Selection

| Parameter | Type   | Description                      | Example                         |
|-----------|--------|----------------------------------|---------------------------------|
| `_fields` | string | Select specific fields only      | `?_fields=id,name,image`        |

**Examples:**

```bash
# Get only id, name, and image fields
GET /api/artifacts?_fields=id,name,image

# Reduce payload size for listings
GET /api/heritage-sites?_fields=id,name,location,rating
```

#### 🌍 Geolocation (Custom)

| Parameter  | Type    | Description                  | Example                    |
|------------|---------|------------------------------|----------------------------|
| `lat`      | float   | Latitude                     | `?lat=15.8801`             |
| `lon`      | float   | Longitude                    | `?lon=108.3380`            |
| `radius`   | integer | Search radius in km          | `?radius=10`               |

**Examples:**

```bash
# Find heritage sites within 10km of coordinates
GET /api/heritage-sites/nearby?lat=15.8801&lon=108.3380&radius=10

# Find artifacts near location
GET /api/artifacts/nearby?lat=21.0285&lon=105.8542&radius=5
```

#### 🎯 Complex Query Examples

**Combining Multiple Parameters:**

```bash
# Search for "pottery" artifacts, rating >= 4, sorted by rating, page 1
GET /api/artifacts?q=pottery&rating_gte=4&_sort=rating&_order=desc&_page=1&_limit=10

# Heritage sites in "Quảng Nam", with reviews, sorted by name
GET /api/heritage-sites?province=Quảng%20Nam&_embed=reviews&_sort=name&_order=asc

# Recent reviews (last 30 days), rating >= 4, with user info
GET /api/reviews?created_at_gte=2025-11-03&rating_gte=4&_expand=user&_sort=created_at&_order=desc

# Active users, admin role, sorted by registration date
GET /api/users?isActive=true&role=admin&_sort=created_at&_order=desc

# Game levels in chapter 1, difficulty <= 3, sorted by order
GET /api/game/chapters/1/levels?difficulty_lte=3&_sort=order&_order=asc
```

**Advanced Filtering:**

```bash
# Artifacts with multiple conditions
GET /api/artifacts?category=pottery&condition=excellent&era_like=dynasty&price_gte=0&price_lte=1000

# Heritage sites with rating and location
GET /api/heritage-sites?rating_gte=4.5&province=Huế&_embed=artifacts,timelines

# Reviews with specific criteria
GET /api/reviews?rating_in=4,5&type=artifact&verified=true&_sort=created_at&_order=desc
```

### API Endpoints Overview

| Module                 | Base Path                   | Description                    |
| ---------------------- | --------------------------- | ------------------------------ |
| **Authentication**     | `/api/auth`                 | User authentication            |
| **Users**              | `/api/users`                | User management                |
| **Heritage Sites**     | `/api/heritage-sites`       | Heritage sites & monuments     |
| **Artifacts**          | `/api/artifacts`            | Cultural artifacts             |
| **Categories**         | `/api/categories`           | Content categories             |
| **Exhibitions**        | `/api/exhibitions`          | Exhibitions & events           |
| **Collections**        | `/api/collections`          | Personal collections           |
| **Favorites**          | `/api/favorites`            | Favorites (unified)            |
| **Reviews**            | `/api/reviews`              | Reviews & ratings              |
| **Game System**        | `/api/game`                 | Game mechanics (unified)       |
| **AI Assistant**       | `/api/ai`                   | AI chatbot                     |
| **Learning**           | `/api/learning`             | Learning modules               |
| **Quests**             | `/api/quests`               | Quest system                   |
| **Notifications**      | `/api/notifications`        | User notifications             |
| **Upload**             | `/api/upload`               | File upload                    |
| **Admin - Levels**     | `/api/admin/levels`         | Level CMS                      |
| **Admin - Chapters**   | `/api/admin/chapters`       | Chapter CMS                    |
| **Admin - Characters** | `/api/admin/characters`     | Character CMS                  |
| **Admin - Assets**     | `/api/admin/assets`         | Asset management               |

### Quick Examples

#### 1. Authentication

```bash
# Register
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "email": "nguyenvana@sen.com",
  "password": "123456",
  "phone": "0123456789"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "nguyenvana@sen.com",
  "password": "123456"
}

# Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "nguyenvana@sen.com",
    "role": "customer"
  }
}
```

#### 2. Game System

```bash
# Get user progress
GET /api/game/progress
Authorization: Bearer <token>

# Get chapters
GET /api/game/chapters
Authorization: Bearer <token>

# Get levels by chapter
GET /api/game/chapters/1/levels
Authorization: Bearer <token>

# Start a level
POST /api/game/levels/1/start
Authorization: Bearer <token>

# Navigate to next screen
POST /api/game/levels/1/next-screen
Authorization: Bearer <token>
{
  "currentScreenId": "screen_01"
}

# Submit quiz answer
POST /api/game/levels/1/submit-answer
Authorization: Bearer <token>
{
  "screenId": "screen_03",
  "selectedOptionId": "option_a"
}

# Complete level
POST /api/game/levels/1/complete
Authorization: Bearer <token>
{
  "score": 85,
  "timeSpent": 180
}
```

#### 3. AI Assistant

```bash
# Chat with AI
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Chú Tễu ơi, ta nên làm gì?",
  "context": {
    "levelId": 1,
    "screenType": "HIDDEN_OBJECT"
  }
}

# Response
{
  "success": true,
  "data": {
    "response": "Hãy tìm cái quạt mo của ta! Nó nằm ở đâu đó trong phòng này.",
    "character": {
      "id": 1,
      "name": "Chú Tễu",
      "avatar": "teu_bw.png"
    }
  }
}
```

#### 4. Heritage Sites

```bash
# Get all heritage sites
GET /api/heritage-sites?_page=1&_limit=10

# Search by name
GET /api/heritage-sites?q=Hội An

# Filter by category
GET /api/heritage-sites?category=Architectural%20Heritage

# Get nearby sites (GPS-based)
GET /api/heritage-sites/nearby?lat=15.8801&lon=108.3380&radius=10

# Get site details
GET /api/heritage-sites/1

# Get site's artifacts
GET /api/heritage-sites/1/artifacts
```

### Complete API Documentation

For detailed API documentation with all endpoints, request/response schemas, and examples, see:

👉 **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**

---

## 🏗️ Kiến Trúc Hệ Thống

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT APPLICATIONS                    │
│          (Web Browser, Mobile App, Desktop)             │
└────────────────────────┬────────────────────────────────┘
                         │
                HTTP/HTTPS (REST API)
                         │
┌────────────────────────▼────────────────────────────────┐
│                  EXPRESS.JS SERVER                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         MIDDLEWARE STACK                         │  │
│  │  • CORS & Security                               │  │
│  │  • Request Logging                               │  │
│  │  • Body Parser                                   │  │
│  │  • Query Parser (Pagination, Filter, Search)     │  │
│  │  • Authentication (JWT)                          │  │
│  │  • Authorization (RBAC)                          │  │
│  │  • Validation                                    │  │
│  │  • Error Handling                                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         ROUTING LAYER                            │  │
│  │  • Public Routes (Heritage, Artifacts)           │  │
│  │  • Protected Routes (Game, AI, User)             │  │
│  │  • Admin Routes (CMS)                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         CONTROLLER LAYER                         │  │
│  │  • Handle HTTP Requests/Responses                │  │
│  │  • Validate Parameters                           │  │
│  │  • Call Service Layer                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         SERVICE LAYER (Business Logic)           │  │
│  │  • Game Logic                                    │  │
│  │  • AI Processing                                 │  │
│  │  • Data Transformation                           │  │
│  │  • Complex Calculations                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         DATABASE LAYER (Data Access)             │  │
│  │  • CRUD Operations                               │  │
│  │  • Advanced Queries                              │  │
│  │  • Pagination & Filtering                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              DATA STORAGE                               │
│  • Development: db.json                                 │
│  • Production: MongoDB / PostgreSQL                     │
│  • Uploads: File System                                 │
└─────────────────────────────────────────────────────────┘
```

### Architecture Pattern: MVC + Service Layer

```
Request → Route → Middleware → Controller → Service → Database
                                    ↓
Response ← Controller ← Service ← Database
```

### Complete Architecture Documentation

For detailed architecture documentation, patterns, and design decisions, see:

👉 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🎮 Game System

### Chapter & Level Structure

```
CHAPTERS (Sen Flower Layers)
│
├── Chapter 1: Sen Hồng - Ký Ức Đầu Tiên
│   ├── Level 1: Ký Ức Chú Tễu
│   ├── Level 2: ...
│   ├── Level 3: ...
│   ├── Level 4: ...
│   └── Level 5: ...
│
├── Chapter 2: Sen Vàng - Thời Hoàng Kim
│   ├── Level 6: ...
│   └── ...
│
└── Chapter 3: Sen Trắng - Di Sản Bất Tử
    └── ...
```

### Screen Types

Each level contains multiple screens executed sequentially:

| Screen Type       | Description                      | Interaction                   |
| ----------------- | -------------------------------- | ----------------------------- |
| `STORY`           | Narrative storytelling           | Read and continue             |
| `DIALOGUE`        | Character conversation           | Chat with AI character        |
| `HIDDEN_OBJECT`   | Find hidden items                | Tap/click to find items       |
| `QUIZ`            | Multiple choice questions        | Select correct answer         |
| `TIMELINE`        | Order historical events          | Drag and drop events          |
| `IMAGE_VIEWER`    | View images/photos               | Swipe through gallery         |
| `VIDEO`           | Watch video content              | Play video                    |

### Game Flow Example

```javascript
// Level structure
{
  "level_id": "lvl_bacbo_muaroi_01",
  "name": "Ký Ức Chú Tễu",
  "chapter_id": 1,
  "type": "mixed",
  "ai_character_id": 1,
  
  "screens": [
    {
      "id": "screen_01",
      "type": "STORY",
      "content": { "text": "..." },
      "next_screen_id": "screen_02"
    },
    {
      "id": "screen_02",
      "type": "DIALOGUE",
      "ai_enabled": true,
      "next_screen_id": "screen_03"
    },
    {
      "id": "screen_03",
      "type": "HIDDEN_OBJECT",
      "items": [
        { "id": "item1", "coordinates": { "x": 15, "y": 45 }, "points": 10 }
      ],
      "required_items": 2,
      "next_screen_id": "screen_04"
    },
    {
      "id": "screen_04",
      "type": "QUIZ",
      "question": "Chú Tễu là ai?",
      "options": [
        { "id": "opt_a", "text": "Nhạc sĩ", "is_correct": true, "points": 20 }
      ],
      "next_screen_id": "screen_05"
    }
  ],
  
  "rewards": {
    "petals": 2,
    "coins": 100,
    "character": "teu_full_color",
    "badge": "memory_keeper"
  }
}
```

### Progression System

- **Sen Petals (Cánh Hoa Sen)**: Unlock new chapters
- **Sen Coins**: Buy shop items, upgrade museum
- **Experience Points**: Level up user rank
- **Characters**: Collect and unlock AI characters
- **Badges**: Achievement badges
- **Museum Items**: Artifacts for personal museum

For complete game system documentation:

👉 **[GAME_SYSTEM_README.md](./GAME_SYSTEM_README.md)**

---

## 🤖 AI Assistant

### AI Character System

Each AI character has two states:

#### State 1: Amnesia (Mất Trí Nhớ)

- Displayed when level is not completed
- Black & white avatar
- Confused persona
- Limited knowledge

```javascript
{
  "avatar_locked": "teu_bw.png",
  "persona_amnesia": "Hỡi ôi... Ta là ai? Đây là đâu? Ký ức của ta... mờ mịt..."
}
```

#### State 2: Restored (Hồi Phục)

- Displayed after level completion
- Full color avatar
- Clear memory
- Full knowledge about their history

```javascript
{
  "avatar_unlocked": "teu_color.png",
  "persona_restored": "Ta nhớ ra rồi! Ta là Chú Tễu, nhạc sĩ tài ba thời Bắc Bộ mưa dầm!"
}
```

### Context-Aware Conversations

AI responses are based on:

- Current level being played
- Screen type (DIALOGUE, HIDDEN_OBJECT, QUIZ)
- Level knowledge base
- User progress
- Character personality

### AI Endpoints

```bash
# Chat with AI
POST /api/ai/chat
{
  "message": "Chú Tễu ơi, làm sao để tìm quạt mo?",
  "context": {
    "levelId": 1,
    "screenType": "HIDDEN_OBJECT",
    "screenId": "screen_03"
  }
}

# Get chat history
GET /api/ai/history?levelId=1

# Ask for hint
POST /api/ai/hint
{
  "levelId": 1,
  "screenId": "screen_03"
}

# Clear chat history
DELETE /api/ai/history?levelId=1
```

---

## 🗄️ Database Schema

### Collections

```
Database Collections (db.json):

{
  // User Management
  users: [],
  addresses: [],
  
  // Heritage & Culture
  heritage_sites: [],
  artifacts: [],
  timelines: [],
  exhibitions: [],
  categories: [],
  cultural_categories: [],
  
  // User Content
  collections: [],
  reviews: [],
  favorites: [],
  notifications: [],
  
  // Game System
  game_chapters: [],
  game_levels: [],
  game_characters: [],
  game_progress: [],
  game_sessions: [],
  scan_objects: [],
  shop_items: [],
  
  // Learning
  learning_modules: [],
  game_quests: [],
  user_progress: [],
  
  // Other
  promotions: [],
  ai_chat_history: []
}
```

### Key Relationships

```
users (1) ────────> (*) game_progress
      (1) ────────> (*) collections
      (1) ────────> (*) favorites
      (1) ────────> (*) reviews

heritage_sites (1) ────> (*) artifacts
               (1) ────> (*) timelines

game_chapters (1) ─────> (*) game_levels
              (1) ─────> (*) game_progress

game_levels (*) ───────> (1) game_chapters
            (1) ───────> (*) game_sessions
```

### Database Operations

```javascript
// Basic CRUD
db.findAll(collection)
db.findById(collection, id)
db.findOne(collection, query)
db.findMany(collection, query)
db.create(collection, data)
db.update(collection, id, data)
db.delete(collection, id)

// Advanced Queries
db.findAllAdvanced(collection, {
  filter: { category: 'pottery', rating_gte: 4 },
  q: 'ancient',           // Full-text search
  sort: 'rating',         // Sort field
  order: 'desc',          // Sort order
  page: 1,                // Page number
  limit: 10,              // Items per page
  embed: 'artifacts',     // Embed relations
  expand: 'category'      // Expand relations
})
```

---

## 🔐 Authentication

### JWT Authentication Flow

```
1. User Login
   ↓
2. Verify Credentials
   ↓
3. Generate JWT Token (30-day expiry)
   ↓
4. Return Token to Client
   ↓
5. Client Stores Token (localStorage/sessionStorage)
   ↓
6. Include Token in Authorization Header
   Authorization: Bearer <token>
   ↓
7. Server Validates Token (protect middleware)
   ↓
8. Attach User to req.user
   ↓
9. Continue to Route Handler
```

### Role-Based Access Control (RBAC)

```javascript
// User Roles
const ROLES = {
  ADMIN: 'admin',        // Full system access
  CUSTOMER: 'customer'   // Limited access
};

// Permission Matrix
const PERMISSIONS = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    heritage_sites: ['create', 'read', 'update', 'delete'],
    artifacts: ['create', 'read', 'update', 'delete'],
    game: {
      levels: ['create', 'read', 'update', 'delete'],
      chapters: ['create', 'read', 'update', 'delete'],
      characters: ['create', 'read', 'update', 'delete']
    }
  },
  
  customer: {
    heritage_sites: ['read'],
    artifacts: ['read'],
    collections: ['create', 'read', 'update', 'delete'], // Own only
    reviews: ['create', 'read', 'update', 'delete'],     // Own only
    game: ['play']
  }
};
```

### Middleware Usage

```javascript
// Public route (no auth)
router.get('/api/heritage-sites', heritageSiteController.getAll);

// Protected route (auth required)
router.get('/api/game/progress', 
  protect,                        // Verify JWT
  gameController.getProgress
);

// Admin only route
router.post('/api/admin/levels', 
  protect,                        // Verify JWT
  authorize('admin'),             // Check role
  levelController.create
);

// Ownership check
router.delete('/api/collections/:id',
  protect,                        // Verify JWT
  checkOwnership('collections'),  // Verify ownership
  collectionController.delete
);
```

### Test Accounts

```
Admin Account:
Email: admin@sen.com
Password: 123456
Role: admin

Customer Account:
Email: huong.do@sen.com
Password: 123456
Role: customer
```

---

## 🧪 Testing

### Test Structure (Planned)

```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── middleware/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    └── game-flow.test.js
```

### Manual Testing

```bash
# Health Check
curl http://localhost:3000/api/health

# Register User
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@sen.com",
    "password": "123456",
    "phone": "0123456789"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@sen.com",
    "password": "123456"
  }'

# Get Protected Resource
curl http://localhost:3000/api/game/progress \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚀 Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PORT=3000
JWT_SECRET=your_very_strong_secret_key_here_minimum_32_chars
JWT_EXPIRE=30d
CLIENT_URL=https://yourdomain.com
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t sen-backend .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_secret \
  sen-backend
```

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name sen-api

# Save process list
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (min 32 characters)
- [ ] Configure CORS for specific origins
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Enable response compression
- [ ] Configure proper logging
- [ ] Set up monitoring (uptime, errors)
- [ ] Database backup strategy
- [ ] Error tracking (Sentry, etc.)
- [ ] Load balancing (if needed)
- [ ] CDN for static assets

---

## 🔧 Environment Variables

### Required Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRE=30d

# Database
DATABASE_PATH=./database/db.json

# CORS
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=2097152
UPLOAD_PATH=./database/uploads
```

### Optional Variables

```bash
# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Email (Future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password

# External APIs (Future)
AI_API_KEY=your_ai_api_key
MAPS_API_KEY=your_maps_api_key
```

---

## 📜 Scripts

### Available NPM Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node utils/seedData.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.js\""
  }
}
```

### Usage

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Seed database with sample data
npm run seed

# Run tests
npm test

# Watch tests
npm run test:watch

# Test coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**

```bash
git clone https://github.com/Tunhoclaptrinh/Sen-Web.git
cd Sen-Web/backend
```

2. **Create a Feature Branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make Your Changes**

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

4. **Test Your Changes**

```bash
npm test
npm run lint
```

5. **Commit Your Changes**

```bash
git add .
git commit -m "feat: add amazing feature"
```

**Commit Message Format:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

6. **Push to Your Fork**

```bash
git push origin feature/amazing-feature
```

7. **Open a Pull Request**

- Go to the original repository
- Click "New Pull Request"
- Select your feature branch
- Describe your changes
- Submit for review

### Code Style Guidelines

```javascript
// Use ES6+ features
const { id } = req.params;
const artifacts = [...existingArtifacts, newArtifact];

// Async/Await over Promises
async getUser(id) {
  const user = await db.findById('users', id);
  return user;
}

// Descriptive naming
const calculateAverageRating = (reviews) => { ... };
const isUserAuthenticated = () => { ... };

// Error handling
try {
  const result = await service.method();
  res.json(result);
} catch (error) {
  next(error);
}

// Comments for complex logic
// Calculate distance using Haversine formula
const distance = calculateDistance(lat1, lon1, lat2, lon2);
```

### Need Help?

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines
- Open an issue for questions
- Join our community discussions

---

## 📝 Changelog

### Version 2.0.0 (December 3, 2025)

**🎉 Major Release - Unified Game System**

**New Features:**

- ✨ Screen-based gameplay system with 7 screen types
- 🤖 AI chatbot with context-aware conversations
- 🎮 Unified game system (chapters, levels, progress)
- 🌸 Sen Flower progression system
- 🏛️ Digital museum with passive income
- 📱 QR code scanning for AR experiences
- 🎨 Complete Admin CMS for content creation
- 📤 Import/Export functionality (XLSX, JSON, CSV)
- 🏆 Badges and achievements system
- 📊 Leaderboard system
- 🎯 Quest system with daily/weekly quests

**Improvements:**

- 🔧 Enhanced error handling with detailed messages
- 🔧 Better pagination with Link headers
- 🔧 Schema-based validation for all endpoints
- 🔧 Improved query parsing (JSON Server style)
- 🔧 Optimized database queries
- 🔧 Better file upload handling with Sharp
- 🔧 Enhanced logging middleware

**Architecture:**

- 🏗️ MVC + Service Layer pattern
- 🏗️ Modular route organization
- 🏗️ Middleware pipeline optimization
- 🏗️ Database abstraction layer

**Documentation:**

- 📚 Complete API documentation (2000+ lines)
- 📚 Architecture documentation (2500+ lines)
- 📚 Game system guide
- 📚 Sample level data

**Breaking Changes:**

- ⚠️ Unified favorites system (removed separate entities)
- ⚠️ Unified game system (consolidated multiple services)
- ⚠️ Changed API response format (standardized)

---

## 📞 Support

### Getting Help

- 📧 **Email:** dev@sen.com
- 💬 **GitHub Issues:** [Report Bug or Request Feature](https://github.com/Tunhoclaptrinh/Sen-Web/issues)
- 📚 **Documentation:** [Project Wiki](https://github.com/Tunhoclaptrinh/Sen-Web/wiki)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Tunhoclaptrinh/Sen-Web/discussions)

### Reporting Issues

When reporting an issue, please include:

1. **Environment:**
   - Node.js version
   - Operating system
   - npm version

2. **Description:**
   - What happened?
   - What did you expect to happen?

3. **Steps to Reproduce:**
   - Step-by-step instructions

4. **Additional Context:**
   - Error messages
   - Screenshots
   - Logs

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 Sen Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🌟 Acknowledgments

### Team

- **Backend Development:** Sen Development Team
- **Game Design:** Cultural Heritage Experts
- **Content Creation:** Vietnamese History Scholars

### Technologies

Special thanks to the open-source projects that made this possible:

- Node.js & Express.js
- bcryptjs & jsonwebtoken
- multer & sharp
- xlsx & json2csv
- And all other dependencies

### Cultural Heritage

This project is dedicated to preserving and promoting Vietnamese cultural heritage for future generations.

---

<div align="center">

## ❤️ Made with Love for Vietnamese Cultural Heritage

**Last Updated:** December 3, 2025  
**Version:** 2.0.0  
**Status:** Production Ready

[⬆ Back to Top](#-sen-backend---game-giáo-dục-văn-hóa-việt-nam)

</div>
