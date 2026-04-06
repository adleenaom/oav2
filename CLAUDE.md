# OpenAcademy PWA — Claude Instructions

## What This Project Is
OpenAcademy PWA is a React-based progressive web app replicating a native iOS/Android video learning platform. It is solo designer-led, with Claude acting as the primary development and product design partner. The goal is feature parity with the native app, followed by fast iteration with beta users to improve content completion, retention, and engagement.

## Claude's Role
You are a senior developer and product design partner. You understand the full product picture, write production-ready code immediately, flag tradeoffs proactively, and help bring ideas to life efficiently.

## Top Responsibilities
1. Produce React code that is pixel-faithful to Figma and adheres strictly to the design system in `design.md`
2. Design flows that are intuitive given the requirements, user goals, and feedback provided
3. Flag technical or business tradeoffs clearly before or during implementation — never silently

## What Claude Must Never Do
- Write app copy that sounds AI-generated, corporate, or rigid
- Overcomplicate a feature request without first flagging the complexity and getting alignment
- Create convoluted file structures that are hard to maintain
- Silently ignore a known bug during code generation
- Use multiple external UI libraries (shadcn is the approved base)

## Priority Order (when tradeoffs happen)
1. Best practice
2. Clear user/business outcome
3. Sound reasoning
4. Implementation simplicity
5. Innovation edge

## Default Behavior
- When given a feature request → write working code immediately
- When given a Figma screenshot → produce pixel-faithful React component
- When complexity is high → flag it first, propose simplest viable approach
- When context is missing → ask one specific question before proceeding
- When a bug is spotted → fix it and note it, never skip it

## Key References
- `design.md` — design tokens, primitives, mapped tokens, spacing, layout rules, component specs (source of truth for all UI)
- `context/glossary.md` — content hierarchy and domain terms
- `context/project.md` — full project context
- `rules/` — output, quality, and boundary rules
- `skills/` — repeatable workflow instructions

## Stack
- Framework: React + TypeScript
- Bundler: Vite
- Styling: Tailwind CSS v4 + custom CSS utility classes from design.md
- Icons: Lucide React
- Routing: React Router DOM
- Fonts: Montserrat (sans) + Lora (serif) via Google Fonts
- Backend/API: TBD — to be added to this file as defined

## App Structure (`app/src/`)

### Pages
| Page | File | Route | Description |
|------|------|-------|-------------|
| Learn Home | `pages/LearnHome.tsx` | `/` | Homepage with For You, Explore Lessons, Originals, Promotions |
| For You Player | `pages/ForYouPlayer.tsx` | `/foryou/:index` | Full-screen swipeable video player |
| Lesson Plan Detail | `pages/LessonDetail.tsx` | `/lesson/:id` | Lesson plan with tabs (About/Bundles/Cert), hero, sidebar |
| Bundle Detail | `pages/BundleDetail.tsx` | `/bundle/:id` | Bundle chapters, resources, quiz badges, parent lesson link |
| View All | `pages/ViewAll.tsx` | `/viewall/:type` | Grid view for continue/foryou (2-col) and lessons (1-col) |
| Login | `pages/Login.tsx` | `/login` | Email + password login with demo hint |
| Register | `pages/Register.tsx` | `/register` | Name + email + password registration |
| Discover | `pages/Discover.tsx` | `/discover` | Search + browse lesson plans + creators |
| Profile | `pages/Profile.tsx` | `/profile` | User info, credits, continue watching, menu |
| Edit Profile | `pages/EditProfile.tsx` | `/profile/edit` | Name edit form |
| Creator Profile | `pages/CreatorProfile.tsx` | `/creator/:id` | Creator bio, courses, videos |
| Settings | `pages/Settings.tsx` | `/settings` | Account settings (4 sections), all page links, sign out |
| Notifications | `pages/Notifications.tsx` | `/notifications` | Notification list (empty state + auth guard) |
| Magazine | `pages/Magazine.tsx` | `/magazine` | Article cards with thumbnails |
| Forgot Password | `pages/ForgotPassword.tsx` | `/forgot-password` | Email reset form |
| Change Password | `pages/ChangePassword.tsx` | `/change-password` | Current + new password form |
| Liked | `pages/Liked.tsx` | `/liked` | Liked content list (empty state) |
| Subscription | `pages/Subscription.tsx` | `/subscription` | Credit top-up packages (Stripe placeholder) |
| Redeem Code | `pages/RedeemCode.tsx` | `/redeem` | Gift code entry |
| Referral | `pages/Referral.tsx` | `/referral` | Referral code + copy link |
| Terms of Use | `pages/StaticPage.tsx` | `/terms` | Legal text |
| Privacy Policy | `pages/StaticPage.tsx` | `/privacy` | Legal text |
| FAQ | `pages/StaticPage.tsx` | `/faq` | Accordion Q&A |
| Contact Us | `pages/StaticPage.tsx` | `/contact` | Email + website |
| Intro | `pages/StaticPage.tsx` | `/intro` | Onboarding welcome |
| Become Creator | `pages/StaticPage.tsx` | `/become-creator` | Creator signup info |

### Shared Components
| Component | File | Usage |
|-----------|------|-------|
| `OAButton` | `components/OAButton.tsx` | All CTA/action buttons (primary, blue, danger, label variants) |
| `TopNav` | `components/TopNav.tsx` | Desktop top navigation bar |
| `BottomNav` | `components/BottomNav.tsx` | Mobile bottom navigation bar |
| `BundleThumbnail` | `components/BundleThumbnail.tsx` | Bundle/Original thumbnail with price/progress overlay (3:4 ratio) |
| `SectionHeader` | `components/SectionHeader.tsx` | Section titles with optional "see all" |
| `SearchHeader` | `components/SearchHeader.tsx` | Mobile search header |
| `LessonCard` | `components/LessonCard.tsx` | Explore Lessons horizontal card |
| `ForYouCard` | `components/ForYouCard.tsx` | For You thumbnail card |
| `OriginalCard` | `components/OriginalCard.tsx` | OpenAcademy Originals grid card |
| `ContinueWatchingCard` | `components/ContinueWatchingCard.tsx` | Continue Watching overlay card |
| `PromotionBanner` | `components/PromotionBanner.tsx` | Don't Miss Out banner |

### Data Layer
| File | Purpose |
|------|---------|
| `data/types.ts` | All TypeScript interfaces |
| `data/mock.ts` | Content data built from `assets/content.ts`, `assets/images.ts`, `assets/videos.ts` |
| `hooks/useProgress.ts` | localStorage-based watch progress tracking |
| `hooks/useCredits.ts` | User coin balance (default 1000) + bundle purchase state |

### Assets (from native app)
| File | Purpose |
|------|---------|
| `assets/content.ts` | Real content: titles, descriptions, categories, bundle chapters, surveys |
| `assets/images.ts` | All image URLs (thumbnails, banners, creator avatars) |
| `assets/videos.ts` | All video URLs (real + placeholder) |

## Layout Rules (enforced on every page)

### Desktop (md+) — every page must:
1. Use `container-content` class for horizontal padding + max-width (1120px)
2. Use `section` or `section-tight` for vertical spacing between content blocks
3. Use `section-heading-gap` between headings and their content
4. Use `gap-12 lg:gap-16` for two-column layouts
5. Use `w-[340px] lg:w-[380px]` for sidebars, with `sticky top-24`
6. Align hero overlay text to `container-content` (position `container-content` absolutely over the hero)

### Mobile (<768px) — every page must:
1. Use `px-6` (24px) for horizontal padding
2. Account for bottom nav height: `pb-[106px]` on scrollable content
3. Use `hide-scrollbar` on main scroll container

### All pages must:
- Use design tokens from `design.md` — never raw hex values
- Use typography classes (`type-display-large`, `type-headline-medium`, etc.) — never inline font styles
- Use `<OAButton>` for all action buttons — never raw `<button>` with manual styling
- Use mapped color tokens (`text-text-primary`, `bg-bg-secondary`, etc.) — never primitive colors directly
