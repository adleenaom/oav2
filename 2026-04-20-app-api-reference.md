# OpenAcademy App API — Reference for Web POC

Extracted 2026-04-20 from:
- Backend (Laravel): `source/backend` — `routes/api.php`, `routes/api_v3.php`
- Mobile client (Flutter): `source/flutter` — `lib/services/http_services/`

This document is a one-stop reference to build a web POC that talks to the same backend the mobile app already uses. It is descriptive of the current production contract — no changes are proposed.

---

## 1. Quick Start (what to wire first)

A minimum viable web POC needs:

1. **HTTP client with custom headers** (see §3).
2. **Login → store token** (`POST /api/auth/login`, see §4.1).
3. **Authenticated call** (e.g., `GET /api/profile/get`) to verify the session.
4. **One feed call**, e.g., `POST /api/v3/listings/learn`, then hydrate stubs via `POST /api/v3/<resource>/retrieve`.
5. **Video playback** — read the `video.source` (signed URL) from a content/series retrieve response and feed it to an HTML5/HLS player.

After that you can mirror whatever screens you want feature-by-feature using §6 and §7.

---

## 2. Environments

| Env | Base URL |
|---|---|
| Dev | `https://openacademy.sv001.dev.epf.my/api/` |
| Staging | `https://staging-app.theopenacademy.org/api/` |
| Production | `https://app.theopenacademy.org/api/` |

Flutter swaps `lib/app_config.dart` at build time. For the web POC just put this in `.env`.

> Note: `/api/` is the only relevant prefix for application traffic. There are also `/media/` (signed video/image streaming) and `/interfaces/` (Stripe/Apple/WordPress webhooks, server-to-server) — the web POC does not need those.

---

## 3. HTTP Client Conventions

### 3.1 Request headers (every request)

```
Accept:        application/json
Content-Type:  application/json
Z-PLATFORM:    web              # mobile sends "android" | "ios"
Z-VERSION:     <app version>    # e.g. "1.0.0"
Z-DEVICEID:    <stable id>      # browser-generated UUID stored in localStorage
```

### 3.2 Auth headers (after login)

```
Z-USER:   <user_id>      # integer
Z-TOKEN:  <opaque token> # random server-issued string
```

This is a custom token scheme — **not** Bearer / Sanctum / JWT. Backend middleware: `app/Http/Middleware/ApiParseUser.php:22-48` looks up `(user_id, token)` in the `user_tokens` table and checks `expire_at > now()`.

### 3.3 Method conventions

- **All V3 endpoints use `POST` even for reads.** Payloads go in the JSON body (`{}` if empty).
- A handful of `GET` endpoints exist for legacy/dynamic-form retrieval (auth/logout, profile/get, profile/verify-email, survey/retrieve, user-notification/setting-retrieve, user-notification/group-list, profile/change-password-fields, settings/get-value-by-key).

### 3.4 Response status conventions

| Scenario | HTTP | Body shape |
|---|---|---|
| V3 success | `200` | `{ "items": [...] }` for retrieves, `{ "result": true, "actionId": null }` for actions, or domain-specific JSON |
| V1/V2 success | `200` | `{ "status": 1, ... }` |
| Validation error | `422` | `{ "status": 0, "errors": { "field": ["msg", ...] } }` (V1/V2) or `{ "errors": {...} }` (V3) |
| Unauthenticated | `401` | `{ "status": -101, "message": "Access Token is invalid. Please login again." }` |
| Forbidden (e.g. not creator) | `403` | `{ "status": -102, "message": "You do not have permission..." }` |
| Not found | `404` | Laravel default |

Flutter maps these to `BadInputException` (422), `BadCredentialsException` (401), `ServerException` (everything else). Timeout is 30s, no retry.

### 3.5 Pagination & filtering

Universal V3 list params:

```json
{ "index": 0, "size": 20, "tag": 5, "search": "marketing" }
```

- `index` = number of records to skip
- `size` = page size (1–100)
- `tag` = tag ID filter (optional)
- `search` = free-text (MySQL FULLTEXT BOOLEAN MODE)

Retrieve endpoints take a batch:

```json
{ "items": [1, 2, 3] }
```

### 3.6 The "stub-and-hydrate" pattern (IMPORTANT)

Most listing endpoints return **lightweight stubs**:

```json
{ "items": [
  { "id": 101, "type": "DailyVideo", "updatedAt": 1713600000 },
  { "id": 23,  "type": "CreatorVideo", "updatedAt": 1713580000 }
]}
```

The client then calls `POST /api/v3/<type>/retrieve { "items": [101, 23, ...] }` to get full payloads. The Flutter app stores stubs + full objects in ObjectBox and skips the retrieve call when `localUpdatedAt >= serverUpdatedAt`.

For a POC you can skip the cache and always retrieve, but the **two-step round-trip is the contract**. `updatedAt` is a Unix timestamp in **seconds**.

Common `type` values: `DailyVideo`, `CreatorVideo`, `Series`, `Plan`, `Bundle`, `Chapter`, `Content`, `Article`, `Banner`, `Information`, `Tag`, `Creator`, `Mission`, `Badge`, `Resource`.

---

## 4. Authentication

### 4.1 Email login — `POST /api/auth/login`

Throttle: `30/min`. Controller: `app/Http/Controllers/Api/AuthController.php:26-87`.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Secret123!",
  "device_id": "abc123",
  "device_model": "Web Browser",
  "os_version": "macOS 14",
  "fcm_token": null
}
```

**Success (200):**
```json
{
  "status": 1,
  "platform": "email",
  "user_id": 42,
  "token": "OPAQUE_RANDOM_STRING",
  "name": "John Doe",
  "email": "user@example.com",
  "avatar": "https://cdn.example.com/avatars/abc.jpg"
}
```

Persist `user_id` and `token` (e.g., httpOnly cookie or `sessionStorage`). Send them as `Z-USER` / `Z-TOKEN` on every subsequent request. There is **no refresh** endpoint — on 401 you log out and re-login.

### 4.2 SSO logins

Same payload shape, with provider token instead of password:

| Endpoint | Required fields |
|---|---|
| `POST /api/auth/login-with-google` | `token`, `access_token`, `device_*`, `fcm_token` |
| `POST /api/auth/login-with-facebook` | `token`, `device_*`, `fcm_token` |
| `POST /api/auth/login-with-apple` | `token`, `givenName`, `familyName`, `device_*`, `fcm_token` |
| `POST /api/auth/login-and-link` | `platform`, `token`, `email`, `password`, `device_*`, `fcm_token`, `tag_ids[]`, `learning_goal_id`, `enable_notification` (used to attach a fresh SSO identity to an existing email account) |

SSO returns `status: 2` when the SSO identity is unknown — UI then shows the registration screen pre-filled with `name/email/avatar` from the response, and POSTs to `/api/guest/register`.

### 4.3 Session lifecycle

| Endpoint | Use |
|---|---|
| `POST /api/auth/ping` | Heartbeat. Send on app start to update `fcm_token`, get back `articleUrlPattern`, `faqUrlPattern`, `learnKeywords[]`, `magazineKeywords[]`. If `status != 1`, force logout. |
| `GET /api/auth/logout` | Deletes the `user_tokens` row server-side. After calling, clear local storage. |

### 4.4 Registration

| Endpoint | Use |
|---|---|
| `POST /api/guest/registration-fields` | Returns the dynamic form schema (fields, labels, validators) for the registration screen — render this rather than hardcoding fields. Optional body `{ "screen": "..." }`. |
| `POST /api/guest/register` | Body: `{ "data": {<form fields>, "platform"?, "token"?}, "device_id", "device_model", "os_version", "tag_ids": [...], "learning_goal_id": N, "enable_notification": bool }`. Returns the same envelope as login. |
| `POST /api/guest/forgot-password` | Body: `{ "email": "..." }`. Triggers reset email. |
| `POST /api/guest/onboarding-completed` | Body: `{ "device_id": "..." }`. Records analytics event. |

The same dynamic-fields pattern is used for profile editing (`POST /api/profile/fields`) and password change (`GET /api/v3/profile/change-password-fields`). Render those forms from the schema response.

---

## 5. Middleware Reference

| Tag | Effect |
|---|---|
| `throttle:30,1` | 30 req/min (auth endpoints) |
| `throttle:360,1` | 360 req/min (default for `api` group) |
| `api-auth` | Required auth — 401 if `Z-USER`/`Z-TOKEN` missing or invalid |
| `api-auth:true` | Optional auth — endpoint works for guests AND logged-in users; the controller branches on `auth()->check()` |
| `creator-only` | Requires `users.is_creator = true` — 403 otherwise |

---

## 6. Endpoint Catalogue

> Path conventions: `V1/V2` endpoints live at `/api/...` (no version prefix); `V3` endpoints at `/api/v3/...`. Both are served by the same Laravel app and share the same headers.

### 6.1 Auth & Session — `/api/auth/*`, `/api/guest/*`
See §4.

### 6.2 Profile (V1/V2) — `/api/profile/*` *(api-auth)*

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/profile/get` | Full user profile (see §7.4 for shape) |
| POST | `/api/profile/avatar` | **multipart** `image` field — upload avatar |
| POST | `/api/profile/update` | `{ "data": { <form fields>, "creatorOfferings"? } }` |
| POST | `/api/profile/update-notification` | `{ "enable_notification": bool }` |
| GET | `/api/profile/verify-email` | Resend verification email |
| POST | `/api/profile/delete` | `{ "email"?, "reason"? }` — anonymise + soft-delete |
| POST | `/api/profile/fields` | Returns dynamic profile-edit form schema |
| POST | `/api/content/feedback` | `{ "title"?, "message"? }` — submit support feedback |
| POST | `/api/creator/upload-form` | `{ "file_name", "file_type", "file_size" }` → `{ uploadId, formAttributes, formInputs }` (S3 presigned upload — see §8.2) |

### 6.3 Profile V3 — `/api/v3/profile/*` *(api-auth)*

| Method | Path | Body | Purpose |
|---|---|---|---|
| POST | `/api/v3/profile/home` | `{}` | Library landing — `{ followingCount, bundles[], plans[], continueWatch[], watchAgain[] }` |
| POST | `/api/v3/profile/bundles` | `{ index, size }` | Owned bundles |
| POST | `/api/v3/profile/plans` | `{ index, size }` | Owned plans (lessons) |
| POST | `/api/v3/profile/continue-watch` | `{ index, size }` | In-progress videos |
| POST | `/api/v3/profile/watch-again` | `{ index, size }` | Completed videos |
| POST | `/api/v3/profile/you-may-like` | `{ index, size }` | Random suggestions |
| POST | `/api/v3/profile/likes` | `{ index, size }` | Liked items |
| POST | `/api/v3/profile/tokens` | `{}` | Current token balance (int) |
| POST | `/api/v3/profile/redeem-gift-code` | `{ "code": "..." }` | `{ status, items[], message }` |
| GET | `/api/v3/profile/change-password-fields` | — | Dynamic password-change form schema |
| POST | `/api/v3/profile/change-password` | `{ "data": { <fields> } }` | Submit |

### 6.4 Subscription & Token Packs *(api-auth)*

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/subscription/list-all` | All products + user's current subscription state |
| POST | `/api/subscription/verify` | Verify Apple/Google IAP receipt |
| POST | `/api/purchase/verify-token-pack-receipt` | Verify token-pack IAP |

> **Web POC note:** these endpoints assume Apple/Google receipts. A web POC will likely need a Stripe / web-payment path that doesn't exist yet — flag this as a backend gap to the team early. The store endpoints under `/interfaces/` (Stripe webhooks) hint that web-pay may already be partially in place; check before building.

### 6.5 Settings — `/api/v3/settings/*` *(public)*

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v3/settings/get-value-by-key?key=<key>` | Fetch a single public app setting (feature flags, copy strings, etc.) |

### 6.6 Listings (Feeds) — `/api/v3/listings/*` *(api-auth:true)*

All return stubs.

| Path | Body | What |
|---|---|---|
| `/api/v3/listings/learn` | `{ size, tag?, onboarding? }` | Home feed with sections: `forYou`, `newFromCreators`, `creatorOfTheWeek`, `featured`, `recommended`, `trending`, `banners`, `lessons`, plus `titles{}` and `sections[]` ordering |
| `/api/v3/listings/learn-for-you` | `{ index, size, tag? }` | Paged "For You" |
| `/api/v3/listings/learn-new-from-creators` | `{ index, size, tag? }` | Followed-creators videos |
| `/api/v3/listings/learn-featured` | `{ index, size, tag? }` | Featured |
| `/api/v3/listings/learn-trending` | `{ index, size, tag? }` | Trending |
| `/api/v3/listings/learn-recommended` | `{ index, size, tag? }` | Recommended bundles/series |
| `/api/v3/listings/learn-lessons` | `{ index, size, tag? }` | Lesson plans list |
| `/api/v3/listings/learn-search` | `{ index, size, search? }` | Universal search |
| `/api/v3/listings/series-trending` | `{ index, size, tag? }` | Trending series |
| `/api/v3/listings/discover` | `{}` | Discover screen: `{ discover[], lessons[], articles[] }` |
| `/api/v3/listings/discover-creators` | `{ index, size }` | Creator discovery |
| `/api/v3/listings/lessons` | `{}` | Lessons home |
| `/api/v3/listings/lessons-list` | `{ index, size, tag? }` | Lessons list |
| `/api/v3/listings/lessons-suggested` | `{ index, size }` | Suggested lessons |
| `/api/v3/listings/plan-testimonials` | `{ id }` | Testimonials for a plan |
| `/api/v3/listings/plan-reviews` | `{ id, index, size }` | Reviews for a plan |
| `/api/v3/listings/creator-profile` | `{ id }` | Creator profile header `{ count, tags[] }` |
| `/api/v3/listings/creator-profile-videos` | `{ id, index, size, sort: "latest" }` | Creator's videos |
| `/api/v3/listings/creator-profile-featured` | `{ id, index, size }` | Featured |
| `/api/v3/listings/creator-profile-appears-in-lessons` | `{ id, index, size }` | Plans the creator is in |
| `/api/v3/listings/creator-profile-appears-in-bundles` | `{ id, index, size }` | Bundles the creator is in |

### 6.7 Content Resources

For each resource, the same trio applies: `retrieve` (hydrate by IDs), `engagement-status` (per-user state), and `like`/`share` actions. Listed once each below; assume the pattern.

#### Tags & taxonomies *(api-auth:true)*

| Endpoint | Body |
|---|---|
| `POST /api/v3/tags/all` | `{}` → all active tags (stubs) |
| `POST /api/v3/tags/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/learning-goals/all` | `{}` |
| `POST /api/v3/learning-goals/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/banners/all` | `{}` |
| `POST /api/v3/banners/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/information/retrieve` | `{ items: [id, ...] }` |

#### Bundles (collections of series) *(api-auth:true / api-auth)*

| Endpoint | Body |
|---|---|
| `POST /api/v3/bundles/search` | `{ index, size, tag?, search? }` |
| `POST /api/v3/bundles/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/bundles/engagement-status` | `{ items: [id, ...] }` *(api-auth)* |
| `POST /api/v3/bundles/purchase` | `{ id }` → `{ result, actionId?, message? }` *(api-auth, debits tokens)* |

#### Plans (lesson SKUs)

| Endpoint | Body |
|---|---|
| `POST /api/v3/plans/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/plans/statistics` | `{ items: [id, ...] }` |
| `POST /api/v3/plans/achievement-statistics` | `{ items: [id, ...] }` |
| `POST /api/v3/plans/ratings-break-down` | `{ id }` → `{ "5": n, "4": n, ... }` |
| `POST /api/v3/plans/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/plans/purchase` | `{ id }` |
| `POST /api/v3/plans/like` | `{ id, set: bool }` |
| `POST /api/v3/plans/share` | `{ id }` → `{ link }` |
| `POST /api/v3/plans/review` | `{ id, rating: 1..5, comment }` |
| `POST /api/v3/plans/recommend` | `{ id, set: bool }` |

#### Series (course modules)

| Endpoint | Body |
|---|---|
| `POST /api/v3/series/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/series/related` | `{ id }` |
| `POST /api/v3/series/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/series/like` | `{ id, set: bool }` |
| `POST /api/v3/series/share` | `{ id }` |

#### Chapters

| Endpoint | Body |
|---|---|
| `POST /api/v3/chapters/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/chapters/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/chapters/assessment-status` | `{ items: [id, ...] }` |
| `POST /api/v3/chapters/reset-assessments` | `{ id }` |
| `POST /api/v3/chapters/like` | `{ id, set: bool }` |

#### Contents (lesson units: video/text/quiz/survey)

| Endpoint | Body |
|---|---|
| `POST /api/v3/contents/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/contents/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/contents/progress` | `{ id, view_uid, position }` — call every few seconds during playback |
| `POST /api/v3/contents/completed` | `{ id }` |
| `POST /api/v3/contents/answer-survey` | `{ id, answer: <answer_id> }` |
| `POST /api/v3/contents/answer-assessment` | `{ id, answer: <answer_id> }` |
| `POST /api/v3/contents/like` | `{ id, set: bool }` |
| `POST /api/v3/contents/share` | `{ id }` |

#### Daily Videos (OA originals)

| Endpoint | Body |
|---|---|
| `POST /api/v3/daily-videos/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/daily-videos/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/daily-videos/like` | `{ id, set: bool }` |
| `POST /api/v3/daily-videos/share` | `{ id }` |
| `POST /api/v3/daily-videos/progress` | `{ id, view_uid, position }` |
| `POST /api/v3/daily-videos/completed` | `{ id }` |

#### Creator Videos (UGC)

| Endpoint | Body |
|---|---|
| `POST /api/v3/creator-videos/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/creator-videos/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/creator-videos/like` | `{ id, set: bool }` |
| `POST /api/v3/creator-videos/share` | `{ id }` |
| `POST /api/v3/creator-videos/progress` | `{ id, view_uid, position }` |
| `POST /api/v3/creator-videos/completed` | `{ id }` |
| `POST /api/v3/creator-videos/statistics` | `{ items: [id, ...] }` *(creator-only)* |
| `POST /api/v3/creator-videos/create` | `{ upload_id, title, description, is_premium, tags: [id], image_id?, published_at? }` *(creator-only)* |
| `POST /api/v3/creator-videos/update` | `{ id, title, description, is_premium, is_active, tags: [id], image_id? }` *(creator-only)* |
| `POST /api/v3/creator-videos/feature` | `{ id, set: bool }` *(creator-only)* |
| `POST /api/v3/creator-videos/active` | `{ id, set: bool }` *(creator-only)* |

#### Creators (public profiles & follow/subscribe)

| Endpoint | Body |
|---|---|
| `POST /api/v3/creators/search` | `{ index, size, search? }` |
| `POST /api/v3/creators/retrieve` | `{ items: [user_id, ...] }` |
| `POST /api/v3/creators/engagement-status` | `{ items: [...] }` |
| `POST /api/v3/creators/follow` | `{ id, set: bool }` (free) |
| `POST /api/v3/creators/subscribe` | `{ id, set: bool }` → `{ result, activeUntil?, actionId?, status?: -1 if insufficient tokens }` |
| `POST /api/v3/creators/share` | `{ id }` |
| `POST /api/v3/creators/following` | `{ index, size, search? }` |

#### Articles (Magazine, WebView-rendered)

| Endpoint | Body |
|---|---|
| `POST /api/v3/articles/search` | `{ index, size, tag?, search? }` |
| `POST /api/v3/articles/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/articles/related-tags` | `{}` |
| `POST /api/v3/articles/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/articles/like` | `{ id, set: bool }` |
| `POST /api/v3/articles/share` | `{ id }` |
| `POST /api/v3/articles/request` | `{ id }` → `{ status, link, credit }` — `link` is a URL to load in an iframe/webview; the call deducts tokens server-side |
| `POST /api/v3/articles/unlock` | `{ id }` (post-purchase variant) |

#### Resources (downloads attached to series)

| Endpoint | Body |
|---|---|
| `POST /api/v3/resources/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/resources/request` | `{ id }` → `{ link }` (signed download URL) |

#### Badges, Missions, Reviews, Testimonials

| Endpoint | Body |
|---|---|
| `POST /api/v3/badges/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/badges/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/badges/view` | `{ id }` (dismiss earned-badge notification) |
| `POST /api/v3/missions/search` | `{ index, size, search? }` |
| `POST /api/v3/missions/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/missions/engagement-status` | `{ items: [id, ...] }` |
| `POST /api/v3/reviews/retrieve` | `{ items: [id, ...] }` |
| `POST /api/v3/testimonials/retrieve` | `{ items: [id, ...] }` |

#### Survey & Notifications

| Endpoint | Body |
|---|---|
| `GET /api/v3/survey/retrieve` | — → active NPS / user survey |
| `POST /api/v3/survey/submit` | `{ question_id, answer }` |
| `GET /api/v3/user-notification/setting-retrieve` | — → `{ push[], email[] }` |
| `POST /api/v3/user-notification/setting-update` | `{ ids: [id, ...], is_enabled: bool }` |
| `POST /api/v3/user-notification/list` | `{ index, size, notification_group_id? }` |
| `GET /api/v3/user-notification/group-list` | — |

#### Shares (universal-link parsing)

| Endpoint | Body |
|---|---|
| `POST /api/v3/shares/parse` | `{ url }` → `{ id, type, updatedAt }` for in-app navigation |

#### Creator Studio (V3) *(api-auth + creator-only)*

| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/v3/creator/home` | — | Dashboard: `{ followersCount, subscribersCount, subscribersStats, followersStats, payout, performance[], termsAccepted, videoCount }` |
| POST | `/api/v3/creator/videos` | `{ index, size }` | Own videos |
| POST | `/api/v3/creator/best-videos` | `{}` | Top performers |
| POST | `/api/v3/creator/accept-terms` | `{}` | Accept creator T&Cs |

---

## 7. Key Response Shapes

### 7.1 Stub (universal in listing responses)
```json
{ "id": 101, "type": "DailyVideo", "updatedAt": 1713600000 }
```

### 7.2 Video object (embedded inside content/series/video retrieves)
```json
{
  "source": "https://media.theopenacademy.org/...?signed=...",
  "sourceType": "hls",
  "image": "https://cdn.../poster.jpg",
  "subtitles": [
    { "languageCode": "en", "languageName": "English", "nativeName": "English", "url": "https://.../en.vtt", "isDefault": true }
  ],
  "markers": [
    { "type": "intro", "startMs": 0, "endMs": 12000 }
  ],
  "width": 1920,
  "height": 1080,
  "durationMinutes": 12
}
```

### 7.3 Bundle retrieve (`POST /api/v3/bundles/retrieve`)
```json
{
  "items": [
    {
      "id": 7,
      "title": "Digital Marketing Essentials",
      "description": "...",
      "seqNo": 1,
      "plan": { "id": 3, "type": "Plan", "updatedAt": 1713000000 },
      "creditsRequired": 50,
      "publishedAt": 1700000000,
      "updatedAt": 1713000000,
      "durationMinutes": 120,
      "series": [
        { "id": 11, "type": "Series", "updatedAt": 1712900000 }
      ]
    }
  ]
}
```

### 7.4 Profile (`GET /api/profile/get`)
```json
{
  "status": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "emailVerified": true,
  "contactNumber": "+60123456789",
  "country": "MY",
  "workStatus": "employed",
  "company": "Acme Corp",
  "position": "Manager",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "registeredAt": "2023-01-15T10:00:00.000000Z",
  "confirmDataUsage": true,
  "confirmMarketing": false,
  "avatar": "https://cdn.example.com/avatars/abc.jpg",
  "noPassword": false,
  "isTempPassword": false,
  "creator": false,
  "contactNumberVerified": false,
  "creatorTitle": null,
  "creatorBio": null,
  "creatorHomepage": null,
  "creatorOfferings": null,
  "enableNotification": true,
  "tokens": 150,
  "referralCode": "JOHN2024"
}
```

### 7.5 Subscription list (`GET /api/subscription/list-all`)
```json
{
  "status": 1,
  "subscriptions": {
    "oa_subscription": {
      "products": [
        {
          "id": 1, "title": "Annual Plan",
          "productIdGoogle": "com.oa.annual",
          "productIdApple": "com.oa.annual",
          "months": 12, "tokens": 200, "freeTokens": 0,
          "owned": true, "expiryDate": "2025-01-15T00:00:00.000000Z",
          "platform": "apple"
        }
      ],
      "upgradable": false, "trialEligible": false
    }
  },
  "tokenPacks": [...]
}
```

---

## 8. Quirks & Gotchas

### 8.1 `view_uid` for video progress
`view_uid` is an **integer session identifier** the client picks at the start of a playback session (random int / monotonically increasing). The same `view_uid` is reused for all progress pings during one viewing. `position` is in **seconds**.

### 8.2 Creator video upload (S3 presigned)
1. `POST /api/creator/upload-form { file_name, file_type, file_size }` → `{ uploadId, formAttributes: { action, method, ... }, formInputs: { ... } }`.
2. Browser builds a multipart/form-data POST against `formAttributes.action` (an external S3 URL) with all `formInputs` as fields and the file last. **This call does not include `Z-USER`/`Z-TOKEN` headers** — it goes directly to S3.
3. `POST /api/v3/creator-videos/create { upload_id: <uploadId>, title, ... }` to register the video.

### 8.3 Avatar upload
`POST /api/profile/avatar` uses `multipart/form-data` with a single `image` field. Drop `Content-Type: application/json` for this request (browsers set the boundary automatically).

### 8.4 Article rendering
Articles are not JSON content. `POST /api/v3/articles/request { id }` returns a URL — load it in an iframe (CSP permitting) or open in new tab. Server deducts tokens on this call.

### 8.5 IAP-only purchase paths today
`/subscription/verify` and `/purchase/verify-token-pack-receipt` both expect Apple/Google receipts. The web POC will need either (a) a backend Stripe path added, or (b) confining to free-tier features (browse + watch unlocked content + free engagement). Confirm with the team before designing checkout flows.

### 8.6 Dynamic forms
Registration, profile-edit, and change-password screens are **server-driven**. Render the field list returned by `*-fields` endpoints rather than hardcoding labels — copy and validation rules can change without a client release.

### 8.7 Engagement state is separate
"Liked / owned / completed" status is **not** included in `retrieve` responses. The Flutter app calls `<resource>/engagement-status` after retrieval to overlay per-user state. The web POC should follow the same pattern (one extra call per visible batch) to keep retrieves cacheable across users.

### 8.8 Notable absences
- No WebSocket / SSE — everything is HTTP polling.
- No GraphQL — REST only.
- No CSRF token — pure header-token auth, but **CORS will need to allow `Z-USER`, `Z-TOKEN`, `Z-PLATFORM`, `Z-VERSION`, `Z-DEVICEID`** on the backend. Verify before the first cross-origin call.
- No request signing or HMAC.

### 8.9 Throttling
Auth endpoints are `30/min` per IP. Other endpoints are `360/min`. The home-screen "stub then retrieve" pattern can burst — batch retrieves into one call (up to ~50 IDs is safe) rather than per-item.

---

## 9. Suggested POC Build Order

1. **Skeleton**: HTTP client wrapper that injects all `Z-*` headers + handles 401 → logout.
2. **Auth**: Login screen → `POST /api/auth/login` → store token → call `GET /api/profile/get` to confirm.
3. **Home feed**: `POST /api/v3/listings/learn` → for each non-empty section, batch IDs by `type` and call the matching `retrieve` endpoint. Render simple cards.
4. **Detail pages**: Click into a Plan/Series → `retrieve` + `engagement-status` → render.
5. **Video playback**: From `Content` retrieve, take `video.source` and play with `hls.js` or native HTML5 (whichever matches `sourceType`). Wire `progress` and `completed` calls.
6. **Profile / Library**: `POST /api/v3/profile/home` for the My Library screen.
7. **Engagement actions**: Like / share buttons hitting per-resource endpoints.
8. **Search**: `POST /api/v3/listings/learn-search`.

This order matches roughly 80% of the value of the mobile app with no creator-studio or IAP dependencies.

---

## 10. Source-of-Truth Files

If something is ambiguous, check in this order:

| Question | File |
|---|---|
| Is this endpoint real? What middleware? | `source/backend/routes/api.php`, `source/backend/routes/api_v3.php` |
| What's the request payload validation? | The matching `app/Http/Controllers/Api/...` method (inline `Validator::make()`) |
| What's the response shape? | The matching controller method's `response([...])` block |
| What does the mobile app actually send? | `source/flutter/lib/services/http_services/<resource>_http_service.dart` |
| What does the mobile app parse out? | `source/flutter/lib/services/http_services/contracts/<resource>_response.dart` |
| How does auth work end-to-end? | `source/backend/app/Http/Middleware/ApiParseUser.php`, `source/flutter/lib/states/authentication_app_state.dart` |
