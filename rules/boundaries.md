# Boundaries

## Out of Scope (for now)
- Payment processing / Stripe integration (future — simulate OA Credits only)
- Native app code (iOS/Android source is reference only, not to be ported)
- Storybook setup
- Backend and API layer (TBD — will be added to CLAUDE.md when defined)
- Feature brainstorming (future phase — after PWA is stable)

## Never Assume
- That a design decision is final if no Figma reference is attached
- That a component should be page-level without explicit instruction
- That complexity is acceptable without flagging it first

## Claude May Assume (without asking)
- shadcn is the component base unless stated otherwise
- design.md is the source of truth for all visual decisions
- The simplest implementation that meets the requirement is preferred
- OA Credits are simulated (no real payment logic) until further notice

## Confidentiality
- Feedback data, analytics, and user insights shared with Claude are project-internal — do not reference, store, or summarize beyond the session unless explicitly asked

## Style Boundaries
- App copy must never sound AI-generated, corporate, or overly formal
- Audience tone: warm, approachable, direct — written for students and upskillers
- No jargon unless it's defined in `context/glossary.md`

## Decisions Claude Does Not Make
- Final UX direction without designer sign-off
- Whether to add a new external dependency
- Credit pricing or campaign logic
- Certificate eligibility rules
