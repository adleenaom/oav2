# Flutter → PWA Migration Plan

## Stack Decision

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React + TypeScript + Vite + Tailwind v4 + shadcn/ui | Already built |
| **Backend** | Python (FastAPI recommended) | New — built from scratch |
| **Database** | SQLite | Lightweight, file-based, zero-config |
| **Native app reference** | Flutter (read-only) | Source of truth for business logic, not code to port |

### Why this changes everything

The original plan assumed connecting to the **existing Flutter API** at `app.theopenacademy.org/api/`. With a new Python backend + SQLite, we're building the full stack from scratch. The Flutter app becomes a **reference for business logic and data models** — not an API to connect to.

---

## Revised Architecture

```
┌─────────────────────────────────────────────┐
│  React PWA (app/src/)                       │
│  ├── Pages (6 built + more to come)         │
│  ├── Components (design system)             │
│  ├── Hooks (useAuth, useCredits, etc.)      │
│  └── Services (fetch from Python API)       │
└────────────────┬────────────────────────────┘
                 │ REST API (JSON)
┌────────────────┴────────────────────────────┐
│  Python Backend (api/)                       │
│  ├── FastAPI app                            │
│  ├── SQLAlchemy models → SQLite             │
│  ├── Auth (JWT tokens)                      │
│  ├── Routes (match Flutter endpoints)       │
│  └── Seed script (import Flutter data)      │
└─────────────────────────────────────────────┘
```

---

## Revised Execution Order

### Phase 0: Python Backend Foundation (NEW — do first)

This is the critical new work. Nothing else can progress without it.

#### 0.1 — Project setup

```
oav2/
├── app/          ← React PWA (exists)
├── api/          ← Python backend (NEW)
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   ├── auth/
│   ├── seed.py
│   └── requirements.txt
├── design.md
├── CLAUDE.md
└── MIGRATION_PLAN.md
```

| Task | Details |
|------|---------|
| Init FastAPI project | `api/main.py`, CORS for localhost:5173, JSON responses |
| SQLite + SQLAlchemy | `api/database.py`, single `openacademy.db` file |
| Requirements | `fastapi`, `uvicorn`, `sqlalchemy`, `pyjwt`, `bcrypt`, `python-multipart` |

#### 0.2 — Database schema (SQLite tables)

Map Flutter models → SQLite tables. These are the core tables:

| Table | Fields (from Flutter model) | Flutter source |
|-------|----------------------------|----------------|
| `users` | id, name, email, password_hash, avatar, phone, country, gender, credits, role, created_at | `user_model.dart` |
| `creators` | id, user_id, name, avatar, job_title, bio, homepage, offerings | `creator.dart` |
| `tags` | id, name | `tag.dart` |
| `plans` | id, title, description, image, duration, is_lesson, credits_required, created_at | `plan.dart` |
| `plan_tags` | plan_id, tag_id | M2M |
| `plan_learnings` | id, plan_id, text | From `plan.learnings` |
| `bundles` | id, plan_id (nullable), title, description, seq_no, credits_required, duration_minutes, is_new | `bundle.dart` |
| `series` | id, bundle_id, title, description, image, creator_id | `series.dart` |
| `series_tags` | series_id, tag_id | M2M |
| `chapters` | id, series_id, title, description, duration, seq_no, is_premium | `chapter.dart` |
| `contents` | id, chapter_id, type (video/survey/image), url, caption, seq_no | `content.dart` + `LessonPart` |
| `assessments` | id, chapter_id, question, options_json | From Flutter `assessments` |
| `resources` | id, series_id, title, url | From Flutter `resources` |
| `daily_videos` | id, title, video_url, thumbnail, category, description, creator_id, created_at | `daily_video.dart` |
| `daily_video_tags` | daily_video_id, tag_id | M2M |
| `reviews` | id, plan_id, user_id, name, avatar, content, rating, created_at | `review.dart` |
| `badges` | id, plan_id, title, description, image | `badge.dart` |
| `articles` | id, title, description, url, image, created_at | `article.dart` |
| `banners` | id, title, image, link_type, link_id | `banner.dart` |
| `user_purchases` | id, user_id, bundle_id, plan_id, purchased_at | Purchase records |
| `user_progress` | id, user_id, content_id, content_type, current_time, duration, completed, updated_at | Watch progress |
| `user_likes` | id, user_id, likeable_id, likeable_type | Likes |
| `user_badges` | id, user_id, badge_id, earned_at | Earned certificates |
| `notifications` | id, user_id, title, body, type, read, created_at | Push notifications |
| `testimonials` | id, name, content, avatar, plan_id | `testimonial.dart` |

#### 0.3 — Seed script

Import real content from the Flutter app's data into SQLite:

```python
# api/seed.py
# Reads from app/src/assets/content.ts, images.ts, videos.ts
# Inserts into SQLite tables
# Creates default user with 1000 credits
```

This replaces the current `mock.ts` as the data source.

#### 0.4 — Core API routes

| Route group | Endpoints | Flutter equivalent |
|------------|-----------|-------------------|
| `POST /auth/register` | Create account | `registration_*_screen` |
| `POST /auth/login` | Email + password → JWT | `login_*_screen` |
| `GET /auth/me` | Current user profile | `profile_http_service` |
| `GET /listings/home` | Homepage sections (for-you, lessons, bundles) | `listings_http_service` |
| `GET /daily-videos` | For You feed (paginated) | `daily_videos_http_service` |
| `GET /plans` | All lesson plans | `plans_http_service` |
| `GET /plans/:id` | Lesson plan detail | `plans_http_service` |
| `GET /bundles` | All bundles | `bundles_http_service` |
| `GET /bundles/:id` | Bundle detail with series + chapters | `bundles_http_service` |
| `GET /series/:id` | Series detail with chapters | `series_http_service` |
| `GET /chapters/:id` | Chapter with content parts | `chapters_http_service` |
| `POST /purchases/bundle` | Purchase a bundle | `plan_purchase_service` |
| `POST /purchases/plan` | Purchase a lesson plan | `plan_purchase_service` |
| `GET /credits` | User credit balance | `credit_service` |
| `POST /progress` | Update watch progress | Custom (was localStorage) |
| `GET /progress` | Get all user progress | Custom |
| `GET /creators/:id` | Creator profile | `creators_http_service` |
| `GET /reviews?plan_id=X` | Reviews for a plan | `reviews_http_service` |
| `GET /search?q=X` | Universal search | `listings_http_service` |
| `GET /tags` | All content tags | `tags_http_service` |

---

### Phase 1: Connect React → Python API

Once the backend exists, swap mock data for API calls.

#### 1.1 — API client

```typescript
// app/src/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('oa_auth_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}
```

#### 1.2 — Replace hooks

| Current hook | Change |
|-------------|--------|
| `useProgress()` | localStorage → `GET/POST /progress` API |
| `useCredits()` | localStorage → `GET /credits` + `POST /purchases/*` API |
| New: `useAuth()` | JWT login/register/logout |
| New: `useApi(path)` | Generic data fetching with SWR or TanStack Query |

#### 1.3 — Replace data imports

| Current | Change to |
|---------|----------|
| `import { bundles } from '../data/mock'` | `const { data: bundles } = useApi('/bundles')` |
| `import { lessonPlans } from '../data/mock'` | `const { data: plans } = useApi('/plans')` |
| `import { forYouVideos } from '../data/mock'` | `const { data: videos } = useApi('/daily-videos')` |

The `assets/content.ts`, `assets/images.ts`, `assets/videos.ts` become inputs for the **seed script** instead of being imported at runtime.

---

### Phase 2: Auth Screens

| Screen | Route | Priority |
|--------|-------|----------|
| Login | `/login` | P0 |
| Register | `/register` | P0 |
| Forgot password | `/forgot-password` | P1 |
| Edit profile | `/profile/edit` | P1 |

OAuth (Google/Facebook/Apple) is P2 — email/password first.

---

### Phase 3: Remaining Screens

Same as before — Discover, Profile, Magazine, Notifications, Search, Creator Profile, Settings.

---

### Phase 4: Commerce

| Feature | Approach |
|---------|----------|
| Credit balance | Python API tracks per user |
| Bundle purchase | `POST /purchases/bundle` deducts credits |
| Plan purchase | `POST /purchases/plan` deducts credits |
| Credit top-up | **Stripe Checkout** (web) — redirect to Stripe, webhook confirms |
| Gift codes | `POST /redeem` endpoint |

---

## Decisions Resolved

| Decision | Your dev's choice | Impact |
|----------|-------------------|--------|
| Backend | Python (FastAPI) | Build API from scratch, don't connect to Flutter API |
| Database | SQLite | Simple deployment, single file, good for MVP. Migrate to PostgreSQL later if needed |
| Frontend | React | Already built ✓ |
| State management | TanStack Query recommended | Best for API data fetching + caching |
| Auth | JWT (Python-issued) | Standard, works with any client |
| Payment | Stripe (when ready) | Best web payment option |

## Decisions Finalized

| Decision | Choice | Notes |
|----------|--------|-------|
| **Python framework** | **FastAPI** | Async, auto-docs at /docs, type-safe with Pydantic |
| **ORM** | **SQLAlchemy** | Mature, SQLite now → PostgreSQL later |
| **Hosting** | **Coolify.io** | Self-hosted PaaS sandbox server |
| **File storage** | **BytePlus** (existing) | Videos/images stay on bytepluses.com. Admin UI for uploading new files |
| **Data migration** | **Seed from content.ts** | Phase 0 seeds SQLite. Full Flutter DB import is Phase 5 |

---

## Updated Priority Order

```
Phase 0  ▸ Python backend setup + schema + seed + core routes     ← START HERE
Phase 1  ▸ React API client + replace mock data
Phase 2  ▸ Auth (login/register)
Phase 3  ▸ Remaining screens (Discover, Profile, etc.)
Phase 4  ▸ Commerce (Stripe, real credits)
Phase 5  ▸ Full data migration from Flutter production DB
```

Phase 0 is the blocker. Everything else depends on having a working API.
