# 📚 SEN API Documentation (Updated)

> Backend API cho game giáo dục văn hóa Việt Nam - SEN (Sen)

**Version:** 2.1.0  
**Base URL:** `http://localhost:3000/api`  
**Environment:** Development  
**Last Updated:** December 28, 2025

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [1. Authentication & Users](#1-authentication--users)
  - [2. Heritage & Artifacts](#2-heritage--artifacts)
  - [3. Game System](#3-game-system)
  - [4. AI Assistant](#4-ai-assistant)
  - [5. Learning & Quests](#5-learning--quests)
  - [6. User Content](#6-user-content)
  - [7. Upload & Media](#7-upload--media)
  - [8. Admin CMS](#8-admin-cms)
  - [9. Notifications](#9-notifications)

---

## 🔐 Overview

API này cung cấp backend cho ứng dụng game giáo dục văn hóa Việt Nam, cho phép người dùng:

- Khám phá di sản văn hóa và hiện vật lịch sử
- Chơi game tương tác với các màn chơi theo chương
- Tương tác với AI assistant để học tập
- Quản lý bộ sưu tập cá nhân và yêu thích
- Hoàn thành nhiệm vụ và nhận phần thưởng

---

## 🔑 Authentication

API sử dụng **JWT (JSON Web Token)** để xác thực.

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### User Roles

- `customer` - Người dùng thông thường
- `researcher` - Nhà nghiên cứu (có thể tạo/sửa heritage sites)
- `admin` - Quản trị viên (full access)

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource not found          |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

---

## 📡 Endpoints

---

## 1. Authentication & Users

### 1.1 Authentication

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "phone": "0123456789",
  "address": "123 Street, City"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nguyễn Văn A",
      "role": "customer",
      "avatar": "https://ui-avatars.com/api/?name=Nguyen+Van+A"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nguyễn Văn A",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "role": "customer",
    "isActive": true
  }
}
```

---

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:** `200 OK`

---

### 1.2 User Management

#### Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `role` (filter by role)
- `isActive` (filter by status)

**Response:** `200 OK`

---

#### Get User by ID (Admin Only)

```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Update User Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Nguyễn Văn B",
  "phone": "0987654321",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:** `200 OK`

---

#### Get User Activity (Protected)

```http
GET /api/users/:id/activity
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {...},
    "stats": {
      "totalOrders": 0,
      "completedOrders": 0,
      "totalReviews": 2,
      "avgRating": 5
    },
    "recentReviews": [...]
  }
}
```

---

#### Get User Stats (Admin Only)

```http
GET /api/users/stats/summary
Authorization: Bearer <admin-token>
```

**Response:** User statistics

```json
{
  "success": true,
  "data": {
    "total": 5,
    "active": 5,
    "inactive": 0,
    "byRole": {
      "customer": 3,
      "admin": 1,
      "researcher": 1
    },
    "withReviews": 2,
    "recentSignups": 0
  }
}
```

---

#### Toggle User Status (Admin Only)

```http
PATCH /api/users/:id/status
Authorization: Bearer <admin-token>
```

**Response:** Updates user active/inactive status

---

#### Delete User Permanently (Admin Only)

```http
DELETE /api/users/:id/permanent
Authorization: Bearer <admin-token>
```

**Response:** Permanently deletes user and all related data

```json
{
  "success": true,
  "message": "User and all related data permanently deleted",
  "deleted": {
    "user": 1,
    "orders": 0,
    "cart": 0,
    "favorites": 2,
    "reviews": 1,
    "addresses": 0,
    "notifications": 0
  }
}
```

---

#### Import/Export Users (Admin Only)

**Download Template:**

```http
GET /api/users/template
Authorization: Bearer <admin-token>
```

**Get Schema:**

```http
GET /api/users/schema
Authorization: Bearer <admin-token>
```

**Import Users:**

```http
POST /api/users/import
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Export Users:**

```http
GET /api/users/export
Authorization: Bearer <admin-token>
```

---

## 2. Heritage & Artifacts

### 2.1 Heritage Sites

#### Get All Heritage Sites

```http
GET /api/heritage-sites
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `type` (filter by type: monument, temple, museum, archaeological_site, historic_building, natural_heritage, intangible_heritage)
- `cultural_period` (filter by period)
- `region` (filter by region: Bắc, Trung, Nam)
- `unesco_listed` (boolean)
- `significance` (local, national, international)
- `q` (search query)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hoàng Thành Thăng Long",
      "description": "Di tích lịch sử...",
      "type": "monument",
      "cultural_period": "Triều Lý",
      "region": "Hà Nội",
      "latitude": 21.0341,
      "longitude": 105.8372,
      "address": "19C Hoàng Diệu, Ba Đình, Hà Nội",
      "images": [...],
      "rating": 4.7,
      "total_reviews": 892,
      "visit_hours": "8:00 - 17:00",
      "entrance_fee": 30000,
      "unesco_listed": true,
      "significance": "international"
    }
  ],
  "pagination": { ... }
}
```

---

#### Search Heritage Sites

```http
GET /api/heritage-sites/search
```

**Query Parameters:**

- `q` - Search query (searches name, description)
- `type` - Filter by type
- `region` - Filter by region

**Response:** `200 OK`

---

#### Get Nearby Heritage Sites

```http
GET /api/heritage-sites/nearby
```

**Query Parameters:**

- `latitude` (required)
- `longitude` (required)
- `radius` (km, default: 5)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hoàng Thành Thăng Long",
      "distance": 2.3,
      "...": "..."
    }
  ]
}
```

---

#### Get Heritage Site by ID

```http
GET /api/heritage-sites/:id
```

**Response:** `200 OK`

---

#### Get Heritage Site Artifacts

```http
GET /api/heritage-sites/:id/artifacts
```

**Response:** List of artifacts at this heritage site

---

#### Get Heritage Site Timeline

```http
GET /api/heritage-sites/:id/timeline
```

**Response:** Historical timeline of the site

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Xây dựng Hoàng Thành",
      "description": "...",
      "year": 1010,
      "category": "founded"
    }
  ]
}
```

---

#### Create Heritage Site (Auth Required)

```http
POST /api/heritage-sites
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Hoàng thành Thăng Long",
  "description": "Một trong những di tích lịch sử quan trọng bậc nhất của Việt Nam.",
  "location": {
    "address": "19C Hoàng Diệu, Ba Đình, Hà Nội",
    "latitude": 21.0345,
    "longitude": 105.8421
  },
  "period": "Thời Lý - Trần - Lê",
  "type": "historic_building",
  "year_established": 1010
}
```

**Response:** `201 Created`

---

#### Update Heritage Site (Auth Required)

```http
PUT /api/heritage-sites/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Delete Heritage Site (Admin Only)

```http
DELETE /api/heritage-sites/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

### 2.2 Artifacts

#### Get All Artifacts

```http
GET /api/artifacts
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `category_id` - Filter by category
- `heritage_site_id` - Filter by heritage site
- `artifact_type` (sculpture, painting, document, pottery, textile, tool, weapon, jewelry, manuscript, photograph, other)
- `condition` (excellent, good, fair, poor)
- `is_on_display` (boolean)
- `q` (search query)

**Response:** `200 OK`

---

#### Search Artifacts

```http
GET /api/artifacts/search
```

**Query Parameters:**

- `q` - Search query
- `category_id` - Filter by category
- `heritage_site_id` - Filter by heritage site

**Response:** `200 OK`

---

#### Get Artifact by ID

```http
GET /api/artifacts/:id
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Trống đồng Ngọc Lũ",
    "description": "Trống đồng thời Đông Sơn...",
    "images": [...],
    "artifact_type": "sculpture",
    "year_created": -500,
    "material": "Đồng",
    "dimensions": "Đường kính 63cm",
    "condition": "good",
    "heritage_site": {
      "id": 1,
      "name": "Bảo tàng Lịch sử"
    },
    "category": {
      "id": 4,
      "name": "Gốm sứ"
    },
    "is_on_display": true,
    "location_in_site": "Phòng chính"
  }
}
```

---

#### Get Related Artifacts

```http
GET /api/artifacts/:id/related
```

**Response:** List of related artifacts (same heritage site or category)

---

#### Create Artifact (Admin Only)

```http
POST /api/artifacts
Authorization: Bearer <admin-token>
```

**Response:** `201 Created`

---

#### Update Artifact (Admin Only)

```http
PUT /api/artifacts/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Delete Artifact (Admin Only)

```http
DELETE /api/artifacts/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

### 2.3 Cultural Categories

#### Get All Categories

```http
GET /api/categories
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kiến trúc cổ",
      "icon": "🏯",
      "description": "Công trình kiến trúc lịch sử"
    }
  ]
}
```

---

#### Get Category by ID

```http
GET /api/categories/:id
```

**Response:** `200 OK`

---

#### Create Category (Admin Only)

```http
POST /api/categories
Authorization: Bearer <admin-token>
```

**Response:** `201 Created`

---

#### Update Category (Admin Only)

```http
PUT /api/categories/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Delete Category (Admin Only)

```http
DELETE /api/categories/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

### 2.4 Exhibitions

#### Get All Exhibitions

```http
GET /api/exhibitions
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `heritage_site_id` - Filter by heritage site
- `is_active` (boolean)

**Response:** `200 OK`

---

#### Get Active Exhibitions

```http
GET /api/exhibitions/active
```

**Response:** List of currently active exhibitions

---

#### Get Exhibition by ID

```http
GET /api/exhibitions/:id
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hành trình Hội An qua 400 năm",
    "description": "...",
    "heritage_site_id": 1,
    "theme": "Lịch sử & Văn hóa Hội An",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "curator": "ThS. Trần Văn An",
    "artifact_ids": [1, 2],
    "is_active": true
  }
}
```

---

#### Create Exhibition (Admin Only)

```http
POST /api/exhibitions
Authorization: Bearer <admin-token>
```

**Response:** `201 Created`

---

#### Update Exhibition (Admin Only)

```http
PUT /api/exhibitions/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Delete Exhibition (Admin Only)

```http
DELETE /api/exhibitions/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

## 3. Game System

### 3.1 Game Progress

#### Get User Progress

```http
GET /api/game/progress
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "level": 5,
    "total_points": 1250,
    "coins": 500,
    "total_sen_petals": 12,
    "unlocked_chapters": [1, 2],
    "completed_levels": [1, 2, 3, 4, 5],
    "collected_characters": ["teu"],
    "badges": [],
    "achievements": [],
    "museum_open": false,
    "museum_income": 0,
    "stats": {
      "completion_rate": 33,
      "chapters_unlocked": 2,
      "total_chapters": 6,
      "characters_collected": 1,
      "total_badges": 0
    }
  }
}
```

---

#### Get Leaderboard

```http
GET /api/game/leaderboard
Authorization: Bearer <token>
```

**Query Parameters:**

- `type` - `global`, `weekly`, `monthly` (default: global)
- `limit` (default: 20)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user_id": 5,
      "user_name": "Nguyễn Văn A",
      "user_avatar": "...",
      "total_points": 9500,
      "level": 20,
      "sen_petals": 50,
      "characters_count": 10
    }
  ]
}
```

---

#### Get Daily Reward

```http
GET /api/game/daily-reward
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Daily reward claimed",
  "data": {
    "coins": 50,
    "petals": 1
  }
}
```

---

### 3.2 Chapters (Sen Flowers)

#### Get All Chapters

```http
GET /api/game/chapters
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sen Hồng - Ký Ức Đầu Tiên",
      "description": "Chương đầu tiên...",
      "theme": "Văn hóa Đại Việt",
      "order": 1,
      "layer_index": 1,
      "petal_state": "blooming",
      "color": "#D35400",
      "required_petals": 0,
      "is_unlocked": true,
      "total_levels": 5,
      "completed_levels": 3,
      "completion_rate": 60,
      "can_unlock": true
    }
  ]
}
```

---

#### Get Chapter Detail

```http
GET /api/game/chapters/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sen Hồng - Ký Ức Đầu Tiên",
    "...": "...",
    "levels": [
      {
        "id": 1,
        "name": "Khám Phá Đinh Bộ Lĩnh",
        "type": "story",
        "difficulty": "easy",
        "order": 1,
        "is_completed": true,
        "is_locked": false,
        "player_best_score": 950,
        "rewards": {
          "coins": 100,
          "petals": 1,
          "character": "teu"
        }
      }
    ],
    "is_unlocked": true
  }
}
```

---

#### Unlock Chapter

```http
POST /api/game/chapters/:id/unlock
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Chapter unlocked successfully",
  "data": {
    "chapter_id": 2,
    "chapter_name": "Sen Vàng - Giao Thoa"
  }
}
```

---

### 3.3 Levels (Màn Chơi)

#### Get Levels by Chapter

```http
GET /api/game/levels/:chapterId
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Khám Phá Đinh Bộ Lĩnh",
      "type": "story",
      "difficulty": "easy",
      "order": 1,
      "thumbnail": "...",
      "is_completed": true,
      "is_locked": false,
      "rewards": {
        "petals": 1,
        "coins": 50
      }
    }
  ]
}
```

---

#### Get Level Detail

```http
GET /api/game/levels/:id/detail
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Khám Phá Đinh Bộ Lĩnh",
    "description": "...",
    "type": "mixed",
    "difficulty": "easy",
    "is_completed": false,
    "best_score": null,
    "play_count": 0,
    "rewards": {
      "petals": 1,
      "coins": 50,
      "character": "teu"
    },
    "time_limit": 600,
    "passing_score": 70
  }
}
```

---

#### Start Level

```http
POST /api/game/levels/:id/start
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Level started",
  "data": {
    "session_id": 123,
    "level": {
      "id": 1,
      "name": "Khám Phá Đinh Bộ Lĩnh",
      "description": "...",
      "total_screens": 5,
      "ai_character": {
        "id": 1,
        "name": "Chú Tễu",
        "avatar": "...",
        "persona": "..."
      }
    },
    "current_screen": {
      "id": "screen_01",
      "type": "DIALOGUE",
      "index": 0,
      "is_first": true,
      "is_last": false,
      "background_image": "...",
      "content": [
        {
          "speaker": "AI",
          "text": "Chào bạn!",
          "avatar": "..."
        }
      ],
      "skip_allowed": true
    }
  }
}
```

---

#### Navigate to Next Screen

```http
POST /api/game/sessions/:id/next-screen
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Navigated to next screen",
  "data": {
    "session_id": 123,
    "current_screen": {
      "id": "screen_02",
      "type": "QUIZ",
      "index": 1,
      "question": "Câu hỏi về di sản?",
      "options": [
        {
          "text": "Đáp án A",
          "is_correct": false
        },
        {
          "text": "Đáp án B",
          "is_correct": true
        }
      ],
      "time_limit": 60
    },
    "progress": {
      "completed_screens": 1,
      "total_screens": 5,
      "percentage": 20
    }
  }
}
```

---

#### Submit Answer (for QUIZ screens)

```http
POST /api/game/sessions/:id/submit-answer
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "answerId": "Đáp án B"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Correct answer!",
  "data": {
    "is_correct": true,
    "points_earned": 20,
    "total_score": 120,
    "explanation": "Giải thích...",
    "correct_answer": null
  }
}
```

---

#### Submit Timeline Order (for TIMELINE screens)

```http
POST /api/game/sessions/:sessionId/submit-timeline
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "eventOrder": ["evt1", "evt2", "evt3"]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Timeline order is correct!",
  "data": {
    "isCorrect": true
  }
}
```

---

#### Collect Clue (for HIDDEN_OBJECT screens)

```http
POST /api/game/levels/:id/collect-clue
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "clueId": "item1"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Item collected",
  "data": {
    "item": {
      "id": "item1",
      "name": "Cái quạt",
      "fact_popup": "Đây là cái quạt mo"
    },
    "points_earned": 10,
    "total_score": 130,
    "progress": {
      "collected": 2,
      "required": 3,
      "all_collected": false
    }
  }
}
```

---

#### Complete Level

```http
POST /api/game/levels/:id/complete
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "score": 950,
  "timeSpent": 300
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Level completed successfully!",
  "data": {
    "passed": true,
    "score": 950,
    "rewards": {
      "petals": 2,
      "coins": 100,
      "character": "teu"
    },
    "new_totals": {
      "petals": 14,
      "points": 2200,
      "coins": 600
    }
  }
}
```

---

### 3.4 Museum

#### Get Museum Collection

```http
GET /api/game/museum
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "is_open": true,
    "income_per_hour": 25,
    "total_income_generated": 1200,
    "pending_income": 50,
    "hours_accumulated": 2,
    "capped": false,
    "characters": ["teu", "thach_sanh"],
    "visitor_count": 20,
    "can_collect": true,
    "next_collection_in": "2 minutes"
  }
}
```

---

#### Toggle Museum Status

```http
POST /api/game/museum/toggle
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "isOpen": true
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Museum opened",
  "data": {
    "is_open": true,
    "income_per_hour": 25
  }
}
```

---

#### Collect Museum Income

```http
POST /api/game/museum/collect
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Collected 50 coins from Museum!",
  "data": {
    "collected": 50,
    "total_coins": 650,
    "total_museum_income": 1250,
    "next_collection_in": "2 minutes"
  }
}
```

---

### 3.5 Badges & Achievements

#### Get User Badges

```http
GET /api/game/badges
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Người khám phá",
      "description": "Hoàn thành 5 level",
      "icon": "🔍",
      "is_unlocked": true
    }
  ]
}
```

---

#### Get User Achievements

```http
GET /api/game/achievements
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### 3.6 Scan to Play

#### Scan Object

```http
POST /api/game/scan
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "code": "QR_CODE_VALUE",
  "latitude": 21.0285,
  "longitude": 105.8542
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Scan successful!",
  "data": {
    "artifact": {
      "id": 1,
      "name": "Trống đồng Ngọc Lũ",
      "description": "Trống đồng thời Đông Sơn...",
      "image": "https://example.com/artifact.jpg"
    },
    "rewards": {
      "coins": 100,
      "petals": 1,
      "character": "teu_unlocked"
    },
    "new_totals": {
      "coins": 1100,
      "petals": 6
    },
    "is_new_discovery": true
  }
}
```

**Error Response (Invalid Code):** `404 Not Found`

```json
{
  "success": false,
  "message": "Invalid scan code"
}
```

**Error Response (Too Far):** `400 Bad Request`

```json
{
  "success": false,
  "message": "You are too far from the location",
  "data": {
    "required_distance": 0.5,
    "current_distance": 2.3
  }
}
```

---

### 3.7 Shop & Inventory

#### Purchase Item

```http
POST /api/game/shop/purchase
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "itemId": 1,
  "quantity": 1
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Purchase successful",
  "data": {
    "item": {
      "id": 1,
      "name": "Hint Ticket",
      "type": "hint"
    },
    "quantity": 1,
    "total_cost": 50,
    "remaining_coins": 550
  }
}
```

---

#### Get User Inventory

```http
GET /api/game/inventory
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item_id": 1,
        "name": "Hint Ticket",
        "type": "hint",
        "quantity": 3,
        "acquired_at": "2024-12-01T10:00:00Z"
      }
    ]
  }
}
```

---

#### Use Item

```http
POST /api/game/inventory/use
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "itemId": 1,
  "targetId": 5
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Item used successfully",
  "data": {
    "item": {
      "id": 1,
      "name": "Hint Ticket"
    },
    "effect": "Applied successfully"
  }
}
```

---

## 4. AI Assistant

### Chat with AI

```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "message": "Chú Tễu ơi, hãy kể cho em nghe về Trống đồng Ngọc Lũ",
  "context": {
    "levelId": 1,
    "artifactId": 1,
    "characterId": 1
  }
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Trống đồng Ngọc Lũ là một trong những di sản văn hóa quý giá...",
    "character": {
      "name": "Chú Tễu",
      "avatar": "..."
    },
    "timestamp": "2025-12-28T10:00:00Z"
  }
}
```

---

### Get Chat History

```http
GET /api/ai/history
Authorization: Bearer <token>
```

**Query Parameters:**

- `levelId` (optional) - Filter by level
- `limit` (default: 20)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 3,
      "level_id": 1,
      "message": "Câu hỏi của user",
      "response": "Trả lời của AI",
      "created_at": "2025-12-28T10:00:00Z"
    }
  ]
}
```

---

### Ask for Hint

```http
POST /api/ai/ask-hint
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "levelId": 1,
  "clueId": "clue_1"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "hint": "Hãy tìm kiếm ở khu vực phía Đông...",
    "cost": 10,
    "remaining_coins": 490
  }
}
```

---

### Explain Artifact/Heritage Site

```http
POST /api/ai/explain
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "type": "artifact",
  "id": 1
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "name": "Trống đồng Ngọc Lũ"
    },
    "explanation": "Giải thích chi tiết từ AI...",
    "character": {
      "name": "Chú Tễu",
      "avatar": "..."
    }
  }
}
```

---

### Generate Quiz

```http
POST /api/ai/quiz
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "topicId": 1,
  "difficulty": "medium"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "Câu hỏi về chủ đề?",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "A",
        "explanation": "Giải thích..."
      }
    ]
  }
}
```

---

### Clear Chat History

```http
DELETE /api/ai/history
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

## 5. Learning & Quests

### 5.1 Learning Paths

#### Get All Learning Content

```http
GET /api/learning
```

**Response:** `200 OK`

---

#### Get Learning Path (User-specific)

```http
GET /api/learning/path
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Lịch sử Đại Việt",
      "difficulty": "easy",
      "estimated_duration": 30,
      "is_completed": false,
      "score": null
    }
  ],
  "progress": {
    "completed": 0,
    "total": 10,
    "percentage": 0
  }
}
```

---

#### Get Learning Content by ID

```http
GET /api/learning/:id
```

**Response:** `200 OK`

---

#### Create Learning Content (Auth Required)

```http
POST /api/learning
Authorization: Bearer <token>
```

**Response:** `201 Created`

---

#### Complete Learning Content

```http
POST /api/learning/:id/complete
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "score": 85
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Module completed",
  "data": {
    "module_title": "Lịch sử Đại Việt",
    "score": 85,
    "points_earned": 50,
    "passed": true
  }
}
```

---

#### Update Learning Content (Auth Required)

```http
PUT /api/learning/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Delete Learning Content (Auth Required)

```http
DELETE /api/learning/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### 5.2 Quests

#### Get All Quests

```http
GET /api/quests
```

**Response:** `200 OK`

---

#### Get Available Quests (User-specific)

```http
GET /api/quests/available
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Hoàn thành 3 màn chơi",
      "description": "...",
      "type": "daily",
      "rewards": {
        "coins": 30,
        "experience": 50
      },
      "is_active": true
    }
  ],
  "completed_count": 5,
  "available_count": 3
}
```

---

#### Get Quest Leaderboard

```http
GET /api/quests/leaderboard
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user_name": "Nguyễn Văn A",
      "user_avatar": "...",
      "total_points": 5000,
      "level": 10,
      "badges_count": 15,
      "completed_quests": 50
    }
  ]
}
```

---

#### Get Quest by ID

```http
GET /api/quests/:id
```

**Response:** `200 OK`

---

#### Create Quest (Auth Required)

```http
POST /api/quests
Authorization: Bearer <token>
```

**Response:** `201 Created`

---

#### Complete Quest

```http
POST /api/quests/:id/complete
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "score": 100
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Quest completed successfully",
  "data": {
    "quest_title": "Hoàn thành 3 màn chơi",
    "points_earned": 30,
    "badges_earned": ["first_quest"],
    "new_level": 6,
    "total_points": 530
  }
}
```

---

#### Update Quest (Auth Required)

```http
PUT /api/quests/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Delete Quest (Auth Required)

```http
DELETE /api/quests/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## 6. User Content

### 6.1 Collections

#### Get User Collections

```http
GET /api/collections
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "user_id": 3,
      "name": "Bộ sưu tập Di sản Hà Nội",
      "description": "Các di tích lịch sử ở Hà Nội",
      "artifact_ids": [4],
      "heritage_site_ids": [2, 5, 6],
      "total_items": 4,
      "is_public": true,
      "created_at": "2024-11-01T10:00:00Z"
    }
  ]
}
```

---

#### Get Collection by ID

```http
GET /api/collections/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Create Collection

```http
POST /api/collections
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Bộ sưu tập Đông Sơn",
  "description": "Các hiện vật thời Đông Sơn",
  "is_public": true
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Collection created",
  "data": {
    "id": 2,
    "name": "Bộ sưu tập Đông Sơn",
    "user_id": 3,
    "artifact_ids": [],
    "total_items": 0
  }
}
```

---

#### Update Collection

```http
PUT /api/collections/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Delete Collection

```http
DELETE /api/collections/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Add Artifact to Collection

```http
POST /api/collections/:id/artifacts/:artifactId
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Artifact added to collection",
  "data": {
    "id": 1,
    "artifact_ids": [4, 5],
    "total_items": 5
  }
}
```

---

#### Remove Artifact from Collection

```http
DELETE /api/collections/:id/artifacts/:artifactId
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### 6.2 Favorites

#### Get All Favorites

```http
GET /api/favorites
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "user_id": 3,
      "type": "heritage_site",
      "reference_id": 1,
      "item": {
        "id": 1,
        "name": "Hoàng Thành Thăng Long"
      },
      "created_at": "2024-10-15T10:00:00Z"
    }
  ]
}
```

---

#### Get Favorites by Type

```http
GET /api/favorites/:type
Authorization: Bearer <token>
```

**Path Parameters:**

- `type` - `artifact`, `heritage_site`, `exhibition`

**Response:** `200 OK`

---

#### Get Favorite IDs by Type

```http
GET /api/favorites/:type/ids
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [1, 5, 7, 12]
}
```

---

#### Check if Item is Favorited

```http
GET /api/favorites/:type/:id/check
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "isFavorited": true,
    "favoriteId": 123
  }
}
```

---

#### Toggle Favorite

```http
POST /api/favorites/:type/:id/toggle
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Added to favorites",
  "data": {
    "isFavorited": true
  }
}
```

---

#### Add Favorite

```http
POST /api/favorites/:type/:id
Authorization: Bearer <token>
```

**Response:** `201 Created`

---

#### Remove Favorite

```http
DELETE /api/favorites/:type/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Clear Favorites by Type

```http
DELETE /api/favorites/:type
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Clear All Favorites

```http
DELETE /api/favorites
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Get Favorite Statistics

```http
GET /api/favorites/stats/summary
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 15,
    "byType": {
      "heritage_site": 5,
      "artifact": 8,
      "exhibition": 2
    }
  }
}
```

---

#### Get Trending Favorites

```http
GET /api/favorites/trending/:type
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### 6.3 Reviews

#### Get All Reviews

```http
GET /api/reviews
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `sort` - `newest`, `oldest`, `rating`

**Response:** `200 OK`

---

#### Search Reviews

```http
GET /api/reviews/search
```

**Query Parameters:**

- `q` - Search query

**Response:** `200 OK`

---

#### Get Reviews by Type

```http
GET /api/reviews/type/:type
```

**Path Parameters:**

- `type` - `artifact`, `heritage_site`

**Response:** `200 OK`

---

#### Get Review by ID

```http
GET /api/reviews/:id
```

**Response:** `200 OK`

---

#### Create Review

```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "type": "artifact",
  "heritage_site_id": 1,
  "rating": 5,
  "comment": "Rất thú vị và có giá trị học tập!",
  "images": []
}
```

**Response:** `201 Created`

---

#### Update Review

```http
PUT /api/reviews/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Delete Review

```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## 7. Upload & Media

#### Upload Avatar

```http
POST /api/upload/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** Form data with `file` field

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "url": "/uploads/avatars/avatar_123.jpg",
    "filename": "avatar_123.jpg",
    "user": {
      "id": 3,
      "name": "Nguyễn Văn A",
      "avatar": "/uploads/avatars/avatar_123.jpg"
    }
  }
}
```

---

#### Upload Category Image (Admin Only)

```http
POST /api/upload/category/:categoryId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** Form data with `file` field

**Response:** `200 OK`

---

#### Upload Heritage Site Image (Admin/Researcher)

```http
POST /api/upload/heritage-site/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** Form data with `file` field

**Response:** `200 OK`

---

#### Upload Artifact Image (Admin/Researcher)

```http
POST /api/upload/artifact/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** Form data with `file` field

**Response:** `200 OK`

---

#### Upload Exhibition Image (Admin)

```http
POST /api/upload/exhibition/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** Form data with `file` field

**Response:** `200 OK`

---

#### Upload Game Asset (Admin)

```http
POST /api/upload/game/:type/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Path Parameters:**

- `type`: `character`, `badge`, `level_thumb`, etc.
- `id`: ID of the asset

**Body:** Form data with `file` field

**Response:** `200 OK`

---

#### Delete File (Admin Only)

```http
DELETE /api/upload/file
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `path` - File path to delete

**Response:** `200 OK`

---

#### Get File Info

```http
GET /api/upload/file/info
Authorization: Bearer <token>
```

**Query Parameters:**

- `path` - File path

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "filename": "avatar_123.jpg",
    "size": 102400,
    "created": "2024-12-01T10:00:00Z",
    "modified": "2024-12-01T10:00:00Z"
  }
}
```

---

#### Get Storage Stats (Admin Only)

```http
GET /api/upload/stats
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalSize": 104857600,
    "totalSizeFormatted": "100 MB",
    "totalFiles": 150,
    "byFolder": {
      "avatars": {
        "files": 50,
        "size": 10485760,
        "sizeFormatted": "10 MB"
      }
    }
  }
}
```

---

#### Cleanup Old Files (Admin Only)

```http
POST /api/upload/cleanup
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "days": 30
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Deleted 15 old files",
  "data": {
    "deletedCount": 15
  }
}
```

---

## 8. Admin CMS

### 8.1 Level Management (CMS)

#### Get All Levels (Admin)

```http
GET /api/admin/levels
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `chapterId` - Filter by chapter
- `status` - Filter by status
- `difficulty` (easy, medium, hard)
- `type` (story, hidden_object, timeline, quiz, memory, puzzle, mixed)

**Response:** `200 OK`

---

#### Get Level Templates

```http
GET /api/admin/levels/templates
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "template_hidden_object",
      "name": "Hidden Object Game",
      "description": "Template cho game tìm đồ vật",
      "screens": [...]
    },
    {
      "id": "template_quiz",
      "name": "Quiz Level",
      "description": "Template cho màn quiz kiến thức",
      "screens": [...]
    }
  ]
}
```

---

#### Get Level Statistics

```http
GET /api/admin/levels/stats
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "total": 50,
    "by_difficulty": {
      "easy": 20,
      "medium": 20,
      "hard": 10
    },
    "by_type": {
      "story": 15,
      "quiz": 15,
      "mixed": 20
    },
    "avg_screens": 5,
    "avg_play_time": 180
  }
}
```

---

#### Validate Level Data

```http
POST /api/admin/levels/validate
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:** Level data to validate

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Validation passed",
  "data": {
    "original": {...},
    "processed": {...},
    "metadata": {
      "total_screens": 5,
      "screen_types": {
        "DIALOGUE": 2,
        "QUIZ": 2,
        "HIDDEN_OBJECT": 1
      },
      "estimated_time": 300
    }
  }
}
```

---

#### Get Level Detail (Admin)

```http
GET /api/admin/levels/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Preview Level

```http
GET /api/admin/levels/:id/preview
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "...": "...",
    "metadata": {
      "total_screens": 5,
      "screen_types": {...},
      "estimated_time": 300,
      "difficulty_score": 7
    }
  }
}
```

---

#### Get Used Assets in Level

```http
GET /api/admin/levels/:id/assets
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "images": ["bg1.jpg", "artifact1.png"],
    "audio": ["music1.mp3"],
    "video": [],
    "total": 3
  }
}
```

---

#### Create Level (Admin)

```http
POST /api/admin/levels
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Khám Phá Trống Đồng",
  "description": "Màn chơi về trống đồng Ngọc Lũ",
  "chapter_id": 1,
  "type": "mixed",
  "difficulty": "easy",
  "order": 1,
  "screens": [
    {
      "id": "screen_1",
      "type": "STORY",
      "content": "Ngày xửa ngày xưa..."
    },
    {
      "id": "screen_2",
      "type": "QUIZ",
      "question": "Trống đồng Ngọc Lũ thuộc nền văn hóa nào?",
      "options": [
        {
          "text": "Đông Sơn",
          "is_correct": true
        }
      ]
    }
  ],
  "rewards": {
    "petals": 1,
    "coins": 50,
    "character": "teu"
  },
  "passing_score": 70
}
```

**Response:** `201 Created`

---

#### Update Level (Admin)

```http
PUT /api/admin/levels/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Delete Level (Admin)

```http
DELETE /api/admin/levels/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Clone Level

```http
POST /api/admin/levels/:id/clone
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "newName": "Khám Phá Trống Đồng (Copy)"
}
```

**Response:** `201 Created`

---

#### Bulk Import Levels

```http
POST /api/admin/levels/bulk/import
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "levels": [...],
  "chapterId": 1
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Import completed: 5 succeeded, 0 failed",
  "data": {
    "success": 5,
    "failed": 0,
    "errors": []
  }
}
```

---

#### Reorder Levels in Chapter

```http
PUT /api/admin/levels/chapters/:chapterId/reorder
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "levelIds": [3, 1, 2, 5, 4]
}
```

**Response:** `200 OK`

---

### 8.2 Chapter Management (CMS)

#### Get All Chapters (Admin)

```http
GET /api/admin/chapters
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Get Chapter by ID (Admin)

```http
GET /api/admin/chapters/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Create Chapter (Admin)

```http
POST /api/admin/chapters
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Sen Hồng - Ký Ức Đầu Tiên",
  "description": "Chương đầu tiên của game",
  "theme": "Văn hóa Đại Việt",
  "order": 1,
  "layer_index": 1,
  "required_petals": 0,
  "color": "#D35400"
}
```

**Response:** `201 Created`

---

#### Update Chapter (Admin)

```http
PUT /api/admin/chapters/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Delete Chapter (Admin)

```http
DELETE /api/admin/chapters/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

### 8.3 Character Management (CMS)

#### Get All Characters (Admin)

```http
GET /api/admin/characters
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Get Character by ID (Admin)

```http
GET /api/admin/characters/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Create Character (Admin)

```http
POST /api/admin/characters
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Chú Tễu",
  "description": "NPC hướng dẫn",
  "persona": "Bạn là Chú Tễu...",
  "speaking_style": "Vui vẻ, hài hước",
  "avatar": "https://example.com/teu.png",
  "avatar_locked": "https://example.com/teu_bw.png",
  "avatar_unlocked": "https://example.com/teu_colored.png",
  "persona_amnesia": "Chú...chú là ai nhỉ?",
  "persona_restored": "Ha ha! Chú nhớ ra rồi!",
  "rarity": "rare",
  "origin": "Múa rối nước",
  "is_collectible": true
}
```

**Response:** `201 Created`

---

#### Update Character (Admin)

```http
PUT /api/admin/characters/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Delete Character (Admin)

```http
DELETE /api/admin/characters/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

### 8.4 Asset Management (Scan Objects)

#### Get All Assets (Admin)

```http
GET /api/admin/assets
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `type` (filter by type)

**Response:** `200 OK`

---

#### Get Asset by ID (Admin)

```http
GET /api/admin/assets/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Create Asset (Admin)

```http
POST /api/admin/assets
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**

```json
{
  "code": "QR001",
  "name": "Trống đồng tại Bảo tàng",
  "type": "artifact",
  "reference_id": 3,
  "latitude": 21.0341,
  "longitude": 105.8372,
  "reward_coins": 100,
  "reward_petals": 1,
  "reward_character": "teu",
  "is_active": true
}
```

**Response:** `201 Created`

---

#### Update Asset (Admin)

```http
PUT /api/admin/assets/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

#### Delete Asset (Admin)

```http
DELETE /api/admin/assets/:id
Authorization: Bearer <admin-token>
```

**Response:** `200 OK`

---

## 9. Notifications

#### Get User Notifications

```http
GET /api/notifications
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "achievement",
      "title": "Huy hiệu mới!",
      "message": "Bạn đã nhận được huy hiệu 'Người khám phá'",
      "isRead": false,
      "createdAt": "2025-12-03T10:00:00Z"
    }
  ]
}
```

---

#### Mark Notification as Read

```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Mark All Notifications as Read

```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Delete Notification

```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### Clear All Notifications

```http
DELETE /api/notifications
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## 📊 Query Parameters & Filters

### Common Query Parameters

All GET list endpoints support these common parameters:

| Parameter | Type   | Default | Description                             |
| --------- | ------ | ------- | --------------------------------------- |
| `page`    | number | 1       | Page number for pagination              |
| `limit`   | number | 20      | Items per page                          |
| `sort`    | string | -       | Sort field (e.g., `name`, `-createdAt`) |
| `search`  | string | -       | Search query                            |
| `fields`  | string | -       | Fields to include (comma-separated)     |

### Filter Examples

```http
GET /api/artifacts?category=Nhạc+cụ&period=Đông+Sơn&page=1&limit=10
GET /api/heritage-sites?province=Hà+Nội&sort=-createdAt
GET /api/reviews?type=artifact&rating=5&sort=newest
```

---

## 🔒 Security & Best Practices

### Rate Limiting

- **Standard endpoints:** 100 requests/15 minutes
- **Auth endpoints:** 5 requests/15 minutes
- **Upload endpoints:** 10 requests/hour

### CORS

CORS is enabled for all origins in development. Configure for production.

### Data Validation

All POST/PUT requests are validated using express-validator with defined schemas.

### File Upload Limits

- **Avatar:** Max 2MB, JPG/PNG only
- **Product images:** Max 5MB
- **Import files:** Max 10MB

---

## 📝 Notes

1. **Token Expiration:** JWT tokens expire after 30 days
2. **Soft Delete:** Most resources use soft delete (isDeleted flag)
3. **Timestamps:** All resources have `createdAt` and `updatedAt`
4. **Pagination:** Default page size is 20, max is 100
5. **Response Time:** Aim for <200ms for standard queries
6. **Session Timeout:** Game sessions auto-expire after 24 hours of inactivity
7. **Museum Income:** Capped at 24 hours accumulation with max 5000 coins limit

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Seed database with sample data
npm run seed

# Server runs on
http://localhost:3000
```

---

## 🧪 Testing Examples

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@sen.com","password":"123456"}'

# Get Progress (replace TOKEN)
curl http://localhost:3000/api/game/progress \
  -H "Authorization: Bearer TOKEN"

# Start Level
curl -X POST http://localhost:3000/api/game/levels/1/start \
  -H "Authorization: Bearer TOKEN"
```

### Using JavaScript (fetch)

```javascript
// Login
const login = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    email: "user@sen.com",
    password: "123456",
  }),
});
const {data} = await login.json();
const token = data.token;

// Get Chapters
const chapters = await fetch("http://localhost:3000/api/game/chapters", {
  headers: {Authorization: `Bearer ${token}`},
});
const chapterData = await chapters.json();
```

---

## 📞 Support

For issues or questions:

- **GitHub:** [Sen-Web Repository](https://github.com/Tunhoclaptrinh/Sen-Web)
- **Email:** support@sen-game.com

---

## 📄 API Schema Reference

### Main Entities

- **User**: Người dùng hệ thống
- **Heritage Site**: Di tích văn hóa
- **Artifact**: Hiện vật lịch sử
- **Chapter**: Chương game (Sen Flower)
- **Level**: Màn chơi
- **Collection**: Bộ sưu tập cá nhân
- **Review**: Đánh giá và nhận xét
- **Favorite**: Danh sách yêu thích
- **Notification**: Thông báo

---

**Version:** 2.1.0  
**Last Updated:** December 28, 2025  
**Status:** Production Ready  
**Maintained by:** Sen Development Team
