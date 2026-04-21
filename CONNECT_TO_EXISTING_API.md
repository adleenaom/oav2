# Connect PWA to Existing OpenAcademy API

## API Endpoints

| Environment | URL |
|---|---|
| **Production** | `https://app.theopenacademy.org/api/` |
| **Staging** | `https://staging-app.theopenacademy.org/api/` |

## Required Headers (every request)

```
accept: application/json
content-type: application/json
Z-PLATFORM: web
Z-VERSION: 1.0.0
Z-DEVICEID: <generated-uuid>
Z-USER: <user-id>        (only when logged in)
Z-TOKEN: <auth-token>    (only when logged in)
```

## Auth Endpoints

### Login
`POST /auth/login`
```json
Request:  { "email", "password", "device_id", "device_model", "os_version", "fcm_token" }
Response: { "status": 1, "message": "...", "platform": "email", "token": "abc123", "user_id": 42 }
```

### Register
`POST /guest/register`
```json
Request:  { "data": { "name", "email", "password", "password_confirmation" }, "platform": "email", "token": "", "tag_ids": [], "learning_goal_id": "", "enable_notification": false, "device_id", "device_model", "os_version" }
Response: { "status": 1, "message": "...", "platform": "email", "token": "abc123", "user_id": 42 }
```

### Forgot Password
`POST /guest/forgot-password`
```json
Request:  { "email": "user@example.com" }
Response: { "status": 1, "message": "Reset link sent" }
```

### Social Login
- `POST /auth/login-with-google` → `{ "token": "<google-id-token>", "access_token": "<google-access-token>", ... }`
- `POST /auth/login-with-facebook` → `{ "token": "<fb-access-token>", ... }`
- `POST /auth/login-with-apple` → `{ "token": "<apple-code>", "givenName", "familyName", ... }`

### Logout
`GET /auth/logout`

### Ping (app init — returns config)
`POST /auth/ping`
```json
Request:  { "device_id", "device_model", "os_version", "fcm_token", "allow_tracking": true }
Response: { "status": 1, "learnKeywords": [...], "magazineKeywords": [...], "articleUrlPattern": "...", "faqUrlPattern": "..." }
```

## Content Endpoints (from Flutter HTTP services)

| Method | Path | Purpose |
|---|---|---|
| GET | `/daily-videos` | For You feed |
| GET | `/daily-videos/{id}` | Single video |
| GET | `/plans` | Lesson plans list |
| GET | `/plans/{id}` | Lesson plan detail |
| GET | `/bundles` | Bundles list |
| GET | `/bundles/{id}` | Bundle detail |
| GET | `/series` | Series list |
| GET | `/series/{id}` | Series detail with chapters |
| GET | `/chapters/{id}` | Chapter with contents |
| GET | `/contents/{id}` | Content (video/survey/image) |
| GET | `/creators` | Creators list |
| GET | `/creators/{id}` | Creator profile |
| GET | `/resources/{id}` | Downloadable resources |
| GET | `/tags` | Content tags/categories |
| GET | `/reviews?plan_id={id}` | Reviews for a plan |
| GET | `/badges` | Badges/certificates |
| GET | `/articles` | Magazine articles |
| GET | `/banners` | Promotional banners |
| GET | `/testimonials` | Testimonials |
| GET | `/listings/homepage` | Homepage sections |
| GET | `/listings/learn` | Learn tab content |
| GET | `/listings/discover` | Discover tab content |

## Commerce Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/profile` | User profile + credits |
| POST | `/profile/update` | Update profile |
| POST | `/profile/change-password` | Change password |
| POST | `/profile/update-avatar` | Upload avatar (multipart) |
| POST | `/purchases/bundle/{id}` | Purchase a bundle |
| POST | `/purchases/plan/{id}` | Purchase a lesson plan |
| POST | `/subscriptions/verify` | Verify IAP receipt |
| GET | `/shares/{type}/{id}` | Get share link |
| POST | `/settings/update` | Update app settings |

## User Engagement Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/user-engagements/like` | Like content |
| POST | `/user-engagements/unlike` | Unlike content |
| GET | `/user-engagements/liked` | Get liked items |
| POST | `/user-engagements/complete` | Mark chapter complete |
| GET | `/user-engagements/completed` | Get completed chapters |
| POST | `/user-engagements/own` | Mark bundle as owned |
| GET | `/user-engagements/owned` | Get owned bundles |
| POST | `/surveys/{id}/submit` | Submit survey answer |

## Notifications

| Method | Path | Purpose |
|---|---|---|
| GET | `/notifications` | List notifications |
| POST | `/notifications/{id}/read` | Mark as read |
| GET | `/notifications/settings` | Get notification prefs |
| POST | `/notifications/settings` | Update notification prefs |

## Steps to Connect

### Step 1: Update API client
Change `app/src/services/api.ts` to use the existing API URL and headers format.

### Step 2: Add device ID generation
Generate a UUID on first visit, persist in localStorage as the device ID.

### Step 3: Adapt auth hooks
Update `useAuth` to:
- Send `device_id`, `device_model`, `os_version` with login/register
- Store `Z-USER` and `Z-TOKEN` from response
- Send both as headers on authenticated requests

### Step 4: Map API responses
The existing API uses a different response shape than the Python API:
- Wraps data in `{ "status": 1, "data": { ... } }` format
- Uses `snake_case` field names
- Relations are returned as IDs, not embedded objects (need separate fetches)

### Step 5: Handle CORS
The existing API may not have CORS headers for your PWA domain.
Options:
- Ask the backend team to add your PWA domain to CORS allowed origins
- Use a proxy (nginx or Coolify reverse proxy)

### Step 6: Deprecate Python API
Once connected to the existing API, the Python backend (`api/`) is no longer needed for content/auth. It can remain as a local dev fallback.

## Key Differences from Python API

| Feature | Python API (current) | Existing API |
|---|---|---|
| Auth | JWT Bearer token | Custom Z-TOKEN + Z-USER headers |
| Response format | Direct JSON | `{ status, message, data }` wrapper |
| Relations | Embedded objects | IDs only (need extra fetches) |
| Pagination | `?page=1&limit=10` | Likely similar |
| Error format | `{ detail: "..." }` | `{ status: 0, errors: { field: [...] } }` |
| File uploads | Not implemented | Multipart with progress |
