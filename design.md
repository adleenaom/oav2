# OpenAcademy Design System

## Overview

OpenAcademy is a mobile learning app with a **Sophisticated Editorial** visual style. The UI uses a "bottom sheet" layout pattern on mobile where a dominant white card overlays a dark backdrop — creating a premium, layered depth common in native iOS/Android apps. On desktop, the layout expands naturally with a top navigation bar.

---

## Token Architecture

Tokens are organized in two layers:

1. **Primitives** — Raw values (colors, font specs). Never referenced directly in components.
2. **Mapped** — Semantic aliases that reference primitives. Components use only mapped tokens.

---

## Primitives

### Color Primitives

| Token | Hex | Notes |
|-------|-----|-------|
| `white` | `#FFFFFF` | Base white |
| `dark-gray` | `#202020` | Darkest neutral |
| `gray-1` | `#6D727A` | Dark mid-gray |
| `gray-2` | `#A2AAB7` | Mid-gray |
| `gray-3` | `#BFC8D4` | Light mid-gray |
| `gray-4` | `#CED3D9` | Lightest gray |
| `light-gray` | `#F4F6F9` | Near-white tint |
| `action-blue` | `#5496F7` | Interactive blue |
| `orange` | `#F2994A` | Category accent |
| `brand/oa-blue` | `#67C8FF` | Brand primary blue |
| `brand/oa-blue-text` | `#18485C` | Dark brand blue (text) |
| `brand/oa-magenta` | `#EB5579` | Brand pink accent |
| `brand/oa-green` | `#A6C311` | Completion / success |
| `day/image-primary` | `#D7D7D8` | Image placeholder fill |
| `label-color/light-primary` | `#000000` | Pure black label |

### Typography Primitives

| Token | Font | Weight | Size | Line Height | Letter Spacing |
|-------|------|--------|------|-------------|----------------|
| `display/display-large` | Lora | Italic 400 | 32px | 40px | 0 |
| `display/display-medium` | Lora | Italic 400 | 20px | 24px | 0 |
| `headline/headline-large` | Montserrat | Bold 700 | 18px | auto | -0.36px |
| `headline/headline-medium` | Montserrat | Bold 700 | 16px | 20px | 0 |
| `headline/headline-small` | Montserrat | Bold 700 | 14px | auto | -0.28px |
| `title/title-medium` | Montserrat | Medium 500 | 16px | auto | 0 |
| `body-default` | Montserrat | Regular 400 | 14px | 20px | 0 |
| `description` | Montserrat | Regular 400 | 12px | auto | 0 |
| `pre-text` | Montserrat | Regular 400 | 11px | auto | -0.22px |
| `tags` | Montserrat | Bold 700 | 10px | auto | 0.2px |
| `disclaimer` | Montserrat | SemiBold 600 | 8px | auto | 0.16px |
| `button` | Montserrat | Bold 700 | 12px | auto | 0.6px |

### Spacing Primitives

Based on a 4px base grid. All spacing must use these tokens — no arbitrary values.

#### Component-level spacing (4–32px)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight nudges, icon-to-text inline gaps |
| `space-2` | 8px | Card internal gaps, horizontal scroll gaps (mobile) |
| `space-3` | 12px | Related group spacing, meta-data separator padding |
| `space-4` | 16px | Card padding, card grid gaps, heading-to-content |
| `space-6` | 24px | Section padding (mobile), inner group separation |
| `space-8` | 32px | Section padding (desktop inner), form groups |

#### Section-level spacing (40–128px)

| Token | Value | Usage |
|-------|-------|-------|
| `space-10` | 40px | Desktop heading-to-section-content |
| `space-12` | 48px | Mobile section-to-section gap |
| `space-16` | 64px | Desktop section horizontal padding |
| `space-20` | 80px | Desktop section vertical padding (standard) |
| `space-24` | 96px | Major section breaks (desktop) |
| `space-32` | 128px | Hero section bottom spacing |

### Layout Primitives

| Token | Value | Usage |
|-------|-------|-------|
| `max-w-content` | 1120px | Main content container max-width |
| `max-w-narrow` | 720px | Text-heavy single-column areas (detail pages) |
| `max-w-wide` | 1280px | Full-bleed sections within the viewport |
| `nav-height` | 64px | Top navigation bar height |
| `nav-height-mobile` | 103px | Bottom nav total height (69px tabs + 34px indicator) |

### Responsive Container Padding

| Breakpoint | Horizontal Padding | Vertical Section Padding |
|------------|-------------------|-------------------------|
| Mobile (<768px) | 24px (`space-6`) | 32px (`space-8`) |
| Tablet (768–1024px) | 48px (`space-12`) | 64px (`space-16`) |
| Desktop (>1024px) | 64px (`space-16`) | 80px (`space-20`) |

### Effect Primitives

| Token | Type | Value |
|-------|------|-------|
| `shadow-button` | Drop Shadow | `0 4px 24px rgba(0, 0, 0, 0.12)` |
| `shadow-nav` | Drop Shadow | `0px -4px 14px rgba(0, 0, 0, 0.05)` |
| `focus-ring` | Box Shadow | `0 0 0 2px white, 0 0 0 4px action-blue` |

### Transition Primitives

| Token | Value | Usage |
|-------|-------|-------|
| `transition-fast` | 150ms ease | Hover/active state changes |
| `transition-base` | 200ms ease | Layout transitions |

---

## Interaction States

All interactive elements must define these states explicitly (Paper best practices):

| State | Visual Change | Notes |
|-------|--------------|-------|
| **default** | Base appearance | — |
| **hover** | `translateY(-2px)` + subtle shadow on cards; darkened bg on buttons | Pointer only |
| **focus-visible** | Blue focus ring (2px white gap + 2px action-blue) | Keyboard only |
| **active** | Scale(0.98) or return to default position | Brief press feedback |
| **disabled** | 40% opacity, `pointer-events: none` | No interaction |

### CSS Classes & Components
- `.card-interactive` — apply to clickable cards (hover lift + shadow)
- `<OAButton>` — all CTA/action buttons (replaces `.btn-primary`). See Buttons section below for variants.
- `.nav-item` — navigation tab items (hover bg change)

---

## Mapped Collection

Semantic tokens that map to primitives. All component styling references these.

### Backgrounds

| Mapped Token | Primitive Reference | Usage |
|-------------|-------------------|-------|
| `background/base` | `white` (#FFFFFF) | Primary app surface |
| `background/secondary` | `light-gray` (#F4F6F9) | Section backgrounds, chips, inputs |
| `background/elevated` | `white` (#FFFFFF) | Cards, modals, sheets |
| `background/overlay` | `dark-gray` (#202020) | Dark backdrop behind sheets |

### Actions

| Mapped Token | Primitive Reference | Usage |
|-------------|-------------------|-------|
| `action/primary` | `dark-gray` (#202020) | Primary buttons, CTA backgrounds |
| `action/secondary` | `action-blue` (#5496F7) | Secondary buttons, active links |
| `action/on-primary` | `white` (#FFFFFF) | Text on primary buttons |
| `action/on-secondary` | `white` (#FFFFFF) | Text on secondary buttons |

### Text

| Mapped Token | Primitive Reference | Usage |
|-------------|-------------------|-------|
| `text/primary` | `dark-gray` (#202020) | Headlines, titles, primary copy |
| `text/secondary` | `gray-1` (#6D727A) | Body text, descriptions |
| `text/tertiary` | `gray-2` (#A2AAB7) | Meta-data, timestamps, ratings |
| `text/disabled` | `gray-4` (#CED3D9) | Inactive nav items |
| `text/on-dark` | `white` (#FFFFFF) | Text on dark backgrounds |
| `text/category` | `orange` (#F2994A) | Category labels above titles |
| `text/brand` | `brand/oa-blue-text` (#18485C) | OpenAcademy Originals headline |

### Borders

| Mapped Token | Primitive Reference | Usage |
|-------------|-------------------|-------|
| `border/default` | `gray-4` (#CED3D9) | Borders, separators, dividers |
| `border/card` | `#EBEBEB` | Card outlines |
| `border/input` | `#EDF1F8` | Search field border |

### Brand Accents

| Mapped Token | Primitive Reference | Usage |
|-------------|-------------------|-------|
| `accent/blue` | `brand/oa-blue` (#67C8FF) | Progress bars, active elements |
| `accent/green` | `brand/oa-green` (#A6C311) | Completion markers, done badges |
| `accent/magenta` | `brand/oa-magenta` (#EB5579) | Emphasis, active links |
| `accent/yellow` | `#FFCD4B` | Credit coins, reward badges |

---

## Layout System

### Bottom Sheet Pattern (Mobile)
- Main content lives in a high-elevation white card that overlays a dark backdrop
- Top edges of the main container use generous rounding (24px+)
- Background is `background/overlay` (#202020) for contrast

### Desktop Layout

All pages must follow these rules for desktop (md+):

| Rule | Value | Class |
|------|-------|-------|
| Content max-width | 1120px | `container-content` |
| Horizontal padding | 24→48→64px (responsive) | `container-content` |
| Section vertical padding | 32→64→80px (responsive) | `section` |
| Tight section padding | 24→48→64px (responsive) | `section-tight` |
| Hero section padding | 48→80→96px (responsive) | `section-hero` |
| Two-column gap | 48px (md) / 64px (lg) | `gap-12 lg:gap-16` |
| Sidebar width | 340px (md) / 380px (lg) | `w-[340px] lg:w-[380px]` |
| Sticky sidebar top offset | 96px (below nav) | `sticky top-24` |
| Main column | `flex-1 min-w-0` | Prevents overflow |

**Top navigation bar** replaces bottom nav on desktop (hidden `md:hidden` / shown `hidden md:block`).

### Page Layout Patterns

#### Mandatory section pattern (ALL feed/browse pages)

Every content section on every page MUST follow this exact structure:

```html
<div className="bg-bg-base section-tight">        <!-- outer: bg + vertical padding -->
  <div className="container-content">              <!-- inner: max-width + horizontal padding -->
    <SectionHeader title="..." />                  <!-- heading -->
    <div className="flex scroll-gap overflow-x-auto hide-scrollbar mt-4 -mx-6 px-6 md:mx-0 md:px-0">
      {/* cards */}                                 <!-- horizontal scroll content -->
    </div>
  </div>
</div>
```

Rules:
1. **Outer wrapper**: `bg-bg-base section-tight` — provides vertical padding (32px all breakpoints)
2. **Inner wrapper**: `container-content` — constrains to `max-w-content` (1120px), adds responsive horizontal padding (24→48→64px)
3. **Heading**: `SectionHeader` or `type-headline-medium` — always inside `container-content`
4. **Horizontal scroll**: `mt-4` gap below heading, `-mx-6 px-6` on mobile (cards bleed to edge), `md:mx-0 md:px-0` on desktop (contained)
5. **Grid layouts**: Use `card-grid-gap` for grids inside `container-content`

This pattern applies to: Homepage, Discover, ViewAll, Profile (continue watching), and any future browse page.

#### Homepage / Feed pages
```
container-content + section-tight (per section)
```
Each content section (For You, Explore Lessons, Originals) is a separate `section-tight` block with its own `container-content`. Originals uses `section` (larger padding) for visual break.

#### Detail pages (Lesson Plan, Bundle)
```
Full-bleed hero → container-content + section (two-column body)
```
- **Hero**: Full-width image (360px height), gradient overlay. Back button and title text sit inside a `container-content` absolutely positioned over the hero — this aligns overlay content with the body below.
- **Body**: `container-content section` wraps a two-column `flex` layout: main content (flex-1) + sticky sidebar (340/380px).
- **Mobile**: Single column, floating title card overlays hero, sticky bottom bar for CTA.

#### Video players (all video content is vertical 9:16)

All video in the app uses **9:16 portrait aspect ratio** (YouTube Shorts style). Never use 16:9 horizontal video.

**For You player** (full-screen reel):
- Mobile: Fixed overlay, 9:16 fills viewport, swipe up/down to navigate
- Desktop: 9:16 centered (max 380px wide), dark bg, nav arrows + actions to the right

**Bundle chapter player** (inline within detail page):
- Mobile: `aspect-[9/16]` with `max-h-[70vh]`, black bg, `px-4` (16px) horizontal padding, `rounded-[16px]`, centered in column
- Desktop: `w-[300px] lg:w-[340px]` fixed width, `aspect-[9/16]` with `max-h-[600px]`, `rounded-[16px]`, chapter info displayed beside the video

### Spacing
- Generous padding inside white sheets (24px on mobile, 32px on desktop)
- Vertical dividers (`border/default`) separate meta-data points
- `section-heading-gap` between section titles and content (16→32→40px)

### Borders & Corners
- Cards: 12px border-radius
- Thumbnails: 8px border-radius
- Buttons: 4px (medium) / 16px (big)
- Main container: 16–24px border-radius on mobile
- Sidebar cards: 16px border-radius, `shadow-button` shadow

---

## Component Patterns

### Lesson Cards (Explore Lessons)
- `border/card` outline, 12px radius
- Image with gradient fade to `background/base`
- Category in `text/category` + `tags` typography
- Title in `headline/headline-medium`
- Description in `description` typography, `text/secondary` color
- Rating in `description` typography, `text/secondary` color

### For You Thumbnails
- 8px radius, portrait orientation
- Duration chip: `dark-gray` 80% opacity background, `disclaimer` typography
- Play icon overlay top-left

### Bundle Thumbnail (`BundleThumbnail` component)

Figma node: 4423:32728. Pure thumbnail card used in Originals grid and Continue Watching.

#### Sizes (3:4 aspect ratio)

| Size | Width | Height | Usage |
|------|-------|--------|-------|
| `default` | 100px | 133px | Compact grids |
| `medium` | 120px | 160px | Medium displays |
| `big` | 160px | 213px | Homepage Originals grid, Continue Watching |

In grid layouts, override to `w-full h-auto aspect-[3/4]` to fill the column.

#### States

| State | Overlay | Center content | Bottom bar | Badge |
|-------|---------|---------------|------------|-------|
| `not-started` | None | None | None | Price badge top-right: `action/primary` bg, `button` type, coin icon + N or "FREE" |
| `in-progress` | 30% black | Percentage in `headline/headline-medium`, white | 7px `accent/blue` bar, left-aligned | None |
| `completed` | 30% black | Check icon (18px) + "COMPLETED" in `tags`, white | None | None |

All states: 8px border-radius, image fills edge-to-edge, `.card-interactive` hover lift.

#### Props
- `thumbnail`: image URL
- `size`: `default` | `medium` | `big`
- `progress`: 0–100 (undefined = not started)
- `price`: number | `'free'` (shown only when not started)
- `showPrice`: boolean
- `onClick`: handler

### OpenAcademy Originals Grid
- Uses `BundleThumbnail` in a 2-column (mobile) / 3–4 column (desktop) grid
- `card-grid-gap` for spacing (8px mobile, 16px desktop)
- Each thumbnail uses `w-full h-auto aspect-[3/4]` to fill grid column

### Promotional Banner
- Full-width, 8px radius
- Brand color gradient overlay

### Navigation Bar
- **Mobile**: Fixed bottom, 4 tabs, `tags` typography
- **Desktop**: Fixed top, horizontal tabs, `headline/headline-small` typography
- Active: `text/secondary`, Inactive: `text/disabled`

### Buttons (`OAButton` component)

All buttons use the `button` typography token (Montserrat Bold 12px, uppercase, 0.6px tracking).

#### Variants (type)

| Variant | Default BG | Default Text | Active BG | Active Text |
|---------|-----------|-------------|----------|------------|
| `primary` | `action/primary` (#202020) | `bg-secondary` (#F4F6F9) | `bg-secondary` (#F4F6F9) | `text-primary` (#202020) |
| `blue` | `action-blue` (#5496F7) | white | `bg-secondary` (#F4F6F9) | `action-blue` (#5496F7) |
| `danger` | `bg-secondary` (#F4F6F9) | #DD3131 | — | — |
| `label` | `action/primary` (#202020) | `bg-secondary` (#F4F6F9) | — | — |

Disabled state: `gray-3` (#BFC8D4) bg, `bg-secondary` text, no interaction.
Added state: `action/primary` bg, `oa-green` (#A6C311) text, check icon.

#### Sizes

| Size | Horizontal Padding | Vertical Padding | Height | Border Radius | Min Width |
|------|-------------------|-----------------|--------|---------------|-----------|
| `big` | 12px (px-3) | 20px (py-5) | auto | 16px | 130px |
| `medium` | 16px (px-4) | 12px (py-3) | min-h 34px | 4px | — |
| `medium-compact` | 8px (px-2) | 8px (py-2) | 34px | 4px | — |

#### Props

- `variant`: `primary` | `blue` | `danger` | `label`
- `size`: `big` | `medium` | `medium-compact`
- `state`: `default` | `active` | `disabled` | `added`
- `fullWidth`: boolean — stretches to container width
- `iconBefore` / `iconAfter`: ReactNode — icon slots
- `children`: button label text

---

## Padding Rules

Every interactive or contained element must have explicit padding. No element should have text or content touching its edges.

### Component Padding Reference (from Figma)

| Element | Horizontal | Vertical | Tailwind | Notes |
|---------|-----------|---------|----------|-------|
| **OAButton big** | 12px | 20px | `px-3 py-5` | Hero CTAs, big onboarding actions |
| **OAButton medium** | 16px | 12px | `px-4 py-3` | Standard CTA buttons, full-width actions |
| **OAButton medium-compact** | 8px | 8px | `p-2` | Icon + short label, compact inline |
| **Card content area** | 24px | 24px | `p-6` | All cards, list items, panels, sidebar cards |
| **Floating title card** | 24px | 24px | `p-6` | Bundle/Lesson detail title card |
| **Status/tag badge** | 8px | 4px | `px-2 py-1` | "In-Progress", "Completed", "90% COMPLETED" |
| **Price badge (thumbnail)** | 8px | 8px | `p-2` | Coin + price on BundleThumbnail |
| **Quiz badge bar** | 16px | 10px | `px-4 py-2.5` | Quiz row in chapter list |
| **Duration chip** | 8px | 4px | `px-2 py-1` | ForYou card duration overlay |
| **Chapter list item** | 24px | 16px | `px-6 py-4` | Chapter row in bundle detail |
| **Section heading (with icon)** | 16px left, 24px right | 24px top | `pl-4 pr-6 pt-6` | "Resources", "Chapters" section headers |
| **Sticky bottom bar** | 24px | 16px | `px-6 py-4` | Mobile CTA bar |
| **Search field** | 26px | 18px | `px-6 py-4` | Search input on homepage |
| **Nav tab (desktop)** | 16px | 8px | `px-4 py-2` | Top nav items |
| **Nav tab (mobile)** | — | — | `w-[81px] h-[69px]` | Bottom nav items (centered) |
| **Promotion banner text** | 16px | 16px | `bottom-4 left-4 right-4` | Absolute positioned, equivalent to p-4 |

### Padding Rules

1. **Buttons must always have padding** — use `OAButton` component which enforces correct padding per size. Never create a raw `<button>` without padding.
2. **Badges/tags with backgrounds must have `px-2 py-1`** (8px/4px) minimum. Text-only labels (category above title) don't need padding.
3. **Cards must have content padding** — `p-6` (24px) minimum for all content containers, cards, and panels. This is the standard spacing token. Image areas remain edge-to-edge.
4. **Floating/elevated cards must have `p-6`** (24px) for the elevated sheet pattern — same as standard cards.
5. **List items must have `px-6 py-4`** (24px/16px) for touch targets and readability.
6. **Section containers must use layout classes** (`container-content`, `section`, `section-tight`) which enforce responsive padding — never hardcode section padding.
7. **Thumbnails with overlays** — overlay badges positioned with fixed offsets from Figma (e.g. `top-[9px] right-[9px]`), not arbitrary values.
8. **Card containers must never touch edges** — any wrapper that holds cards with shadows or rounded corners must have `py-1` minimum vertical padding so shadows are not clipped. Sidebar sticky wrappers use `py-1` + `gap-6` (24px) between card groups.
9. **Headings inside card lists must have `px-1`** (4px) — when a section heading sits above a list of cards that have their own `p-4` padding, the heading needs `px-1` to prevent it from being visually flush with the card outer edge.
10. **No 0-padding containers** — every visible container (card, list wrapper, section, sidebar) must have non-zero padding on all sides. Use the spacing scale: minimum `p-1` (4px) for structural wrappers, `p-6` (24px) for all content cards and panels. This is the **base container padding** — 24px (`space-6`) is the standard for all card and panel content. If a component's background is transparent and serves only as a layout wrapper, it still needs at least `py-1` to prevent child shadow clipping.

---

## Design Rules

### Always
- Use mapped tokens, never raw hex in components
- One brand accent per functional block
- Maintain soft rounded corners throughout
- Use `border/default` vertical dividers for inline meta-data
- Pass WCAG accessibility standards
- **Every interactive element must have visible padding** — buttons, cards, badges, list items
- **Use Figma-exact padding values** from the Padding Rules table above

### Never
- Use harsh 90-degree corners
- Combine multiple brand accents in the same card
- Use inline styles — all styling via design tokens
- **Create a card or container with 0 padding on any side**
- **Let card shadows clip against a parent edge** — always ensure parent has `py-1` minimum
- Add UI libraries beyond shadcn
- **Create buttons or badges without padding**
- **Use arbitrary padding values** — always reference the table above
